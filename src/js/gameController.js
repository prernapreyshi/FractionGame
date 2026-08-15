import { LEVELS, TIERS, BASE_POINTS, BONUS_PER_STAR } from './config.js';
import { calculateStars } from './starRating.js';
import { MAX_HINTS_PER_LEVEL, getHint } from './hintEngine.js';
import { ACHIEVEMENTS, getNewlyUnlocked } from './achievements.js';
import { getThemeById } from './themes.js';
import { loadProgress, saveProgress } from './storage.js';

const SPEED_BONUSES = [
  { underSeconds: 15, bonus: 20 },
  { underSeconds: 30, bonus: 10 }
];

export class GameController {
  /**
   * @param {object} deps
   * @param {AudioEngine} deps.audio
   * @param {object} deps.view 
   */
  constructor({ audio, view }) {
    this.audio = audio;
    this.view = view;

    this.levelIndex = 0;
    this.shadedCount = 0;
    this.score = 0;
    this.themeId = 'pie';

    this.solvedOnce = false;
    this.overshootCount = 0;
    this.hintsUsed = 0;
    this.levelStartTime = null;

    this.bestStars = new Array(LEVELS.length).fill(null);
    this.bestTimes = new Array(LEVELS.length).fill(null);
    this.unlockedAchievements = new Set();

    this.currentCleanStreak = 0;
    this.bestCleanStreak = 0;
    this.fastestSolveSeconds = null;

    this._restoreSavedProgress();
  }

  get currentLevel() {
    return LEVELS[this.levelIndex];
  }

  get isLastLevel() {
    return this.levelIndex === LEVELS.length - 1;
  }

  get totalLevels() {
    return LEVELS.length;
  }

  get theme() {
    return getThemeById(this.themeId);
  }

  get hintsRemaining() {
    return MAX_HINTS_PER_LEVEL - this.hintsUsed;
  }

  _restoreSavedProgress() {
    const saved = loadProgress();
    if (!saved) return;

    this.score = saved.score ?? 0;
    this.themeId = saved.themeId ?? 'pie';
    this.bestStars = saved.bestStars ?? new Array(LEVELS.length).fill(null);
    this.bestTimes = saved.bestTimes ?? new Array(LEVELS.length).fill(null);
    this.unlockedAchievements = new Set(saved.unlockedAchievements ?? []);
    this.bestCleanStreak = saved.bestCleanStreak ?? 0;
    this.fastestSolveSeconds = saved.fastestSolveSeconds ?? null;

    const firstUnsolved = this.bestStars.findIndex((s) => s === null);
    this.levelIndex = firstUnsolved === -1 ? LEVELS.length - 1 : firstUnsolved;
  }

  _persist() {
    saveProgress({
      score: this.score,
      themeId: this.themeId,
      bestStars: this.bestStars,
      bestTimes: this.bestTimes,
      unlockedAchievements: Array.from(this.unlockedAchievements),
      bestCleanStreak: this.bestCleanStreak,
      fastestSolveSeconds: this.fastestSolveSeconds
    });
  }

  selectLevel(index) {
    if (index < 0 || index >= LEVELS.length) return;
    this.levelIndex = index;
    this.shadedCount = 0;
    this.solvedOnce = false;
    this.overshootCount = 0;
    this.hintsUsed = 0;
    this.levelStartTime = Date.now();
    this.view.onLevelStart();
    this._renderAll();
  }

  setTheme(themeId) {
    this.themeId = themeId;
    this._persist();
    this._renderAll();
  }

 
  addPiece() {
    const level = this.currentLevel;
    if (this.shadedCount >= level.denom) return;

    this.shadedCount += 1;
    this.audio.playAdd();
    this._renderAll();
    this._checkAnswer();
  }

  
  removePiece() {
    if (this.shadedCount <= 0) return;

    this.shadedCount -= 1;
    this.audio.playRemove();
    this._renderAll();
    this._checkAnswer();
  }

  requestHint() {
    if (this.hintsRemaining <= 0) return;
    this.hintsUsed += 1;
    this.audio.playHint();
    const level = this.currentLevel;
    const message = getHint(this.shadedCount, level.target, level.denom);
    this.view.onHint(message, this.hintsRemaining);
    this._renderAll();
  }


  _checkAnswer() {
    const level = this.currentLevel;

    if (this.shadedCount === level.target) {
      if (!this.solvedOnce) {
        this._handleFirstSolve(level);
      } else {
        this.view.onCorrect(level, this.bestStars[this.levelIndex]);
      }
    } else if (this.shadedCount === level.denom && level.target !== level.denom) {
    
      if (!this.solvedOnce) this.overshootCount += 1;
      this.audio.playWrong();
      this.view.onWrong();
    } else {
      this.view.onProgress();
    }

    this._renderAll();
  }


  _handleFirstSolve(level) {
    this.solvedOnce = true;

    const elapsedSeconds = this.levelStartTime ? (Date.now() - this.levelStartTime) / 1000 : null;
    const stars = calculateStars(this.overshootCount);
    const speedBonus = this._calculateSpeedBonus(elapsedSeconds);
    const starBonus = BONUS_PER_STAR * (stars - 1);
    const pointsEarned = BASE_POINTS + starBonus + speedBonus;
    this.score += pointsEarned;

    if (this.bestStars[this.levelIndex] === null || stars > this.bestStars[this.levelIndex]) {
      this.bestStars[this.levelIndex] = stars;
    }
    if (elapsedSeconds !== null) {
      const prevBest = this.bestTimes[this.levelIndex];
      if (prevBest === null || elapsedSeconds < prevBest) {
        this.bestTimes[this.levelIndex] = elapsedSeconds;
      }
      if (this.fastestSolveSeconds === null || elapsedSeconds < this.fastestSolveSeconds) {
        this.fastestSolveSeconds = elapsedSeconds;
      }
    }

    if (this.overshootCount === 0) {
      this.currentCleanStreak += 1;
      this.bestCleanStreak = Math.max(this.bestCleanStreak, this.currentCleanStreak);
    } else {
      this.currentCleanStreak = 0;
    }

    this.audio.playCorrect();
    this.view.onCorrect(level, stars, { elapsedSeconds, pointsEarned, speedBonus });

    this._checkAchievements();
    this._persist();
  }

  _calculateSpeedBonus(elapsedSeconds) {
    if (elapsedSeconds === null) return 0;
    for (const tier of SPEED_BONUSES) {
      if (elapsedSeconds < tier.underSeconds) return tier.bonus;
    }
    return 0;
  }

  _checkAchievements() {
    const stats = this._buildStatsSnapshot();
    const newlyUnlocked = getNewlyUnlocked(stats, this.unlockedAchievements);
    if (newlyUnlocked.length === 0) return;

    newlyUnlocked.forEach((a) => this.unlockedAchievements.add(a.id));
    this.audio.playAchievement();
    this.view.onAchievementsUnlocked(newlyUnlocked);
  }

  _buildStatsSnapshot() {
    const levelsSolved = this.bestStars.filter((s) => s !== null).length;
    const threeStarLevels = this.bestStars.filter((s) => s === 3).length;
    return {
      levelsSolved,
      threeStarLevels,
      totalLevels: LEVELS.length,
      fastestSolveSeconds: this.fastestSolveSeconds,
      bestCleanStreak: this.bestCleanStreak
    };
  }

  goToNextLevel() {
    if (this.isLastLevel) {
      this.view.onGameComplete(this._buildEndSummary());
      return;
    }
    this.audio.playLevelComplete();
    this.selectLevel(this.levelIndex + 1);
  }

  _buildEndSummary() {
    const stats = this._buildStatsSnapshot();
    const totalStarsEarned = this.bestStars.reduce((sum, s) => sum + (s || 0), 0);
    const maxStars = LEVELS.length * 3;
    const accuracy = maxStars > 0 ? Math.round((totalStarsEarned / maxStars) * 100) : 0;
    return {
      score: this.score,
      accuracy,
      fastestSolveSeconds: this.fastestSolveSeconds,
      levelsSolved: stats.levelsSolved,
      totalLevels: stats.totalLevels,
      badgesUnlocked: this.unlockedAchievements.size,
      totalBadges: ACHIEVEMENTS.length
    };
  }

  
  restart() {
    this.levelIndex = 0;
    this.shadedCount = 0;
    this.score = 0;
    this.solvedOnce = false;
    this.overshootCount = 0;
    this.hintsUsed = 0;
    this.bestStars = new Array(LEVELS.length).fill(null);
    this.bestTimes = new Array(LEVELS.length).fill(null);
    this.unlockedAchievements = new Set();
    this.currentCleanStreak = 0;
    this.bestCleanStreak = 0;
    this.fastestSolveSeconds = null;
    this.levelStartTime = Date.now();
    this._persist();
    this.view.onLevelStart();
    this._renderAll();
  }

  toggleMute() {
    return this.audio.toggleMute();
  }

  
  _renderAll() {
    this.view.render({
      levelIndex: this.levelIndex,
      totalLevels: LEVELS.length,
      level: this.currentLevel,
      tier: TIERS.find((t) => t.id === this.currentLevel.tier),
      shadedCount: this.shadedCount,
      score: this.score,
      solvedOnce: this.solvedOnce,
      bestStars: this.bestStars,
      bestTimes: this.bestTimes,
      hintsRemaining: this.hintsRemaining,
      theme: this.theme,
      unlockedAchievements: this.unlockedAchievements
    });
  }
}
