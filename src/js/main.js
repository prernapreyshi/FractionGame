import { LEVELS, TIERS } from './config.js';
import { AudioEngine } from './audioEngine.js';
import { renderPie, launchConfetti } from './pieRenderer.js';
import { ThreeCelebration } from './threeCelebration.js';
import { GameController } from './gameController.js';
import { THEMES } from './themes.js';
import { simplifyFraction, formatTime } from './utils.js';
import { ACHIEVEMENTS } from './achievements.js';

document.addEventListener('DOMContentLoaded', () => {
  const dom = {
    stage: document.getElementById('stage'),
    themeEmoji: document.getElementById('themeEmoji'),
   
    levelNum: document.getElementById('levelNum'),
    levelTotal: document.getElementById('levelTotal'),
    scoreNum: document.getElementById('scoreNum'),
    levelsBtn: document.getElementById('levelsBtn'),
    homeBtn: document.getElementById('homeBtn'),
    muteBtn: document.getElementById('muteBtn'),
    restartBtn: document.getElementById('restartBtn'),

    startStats: document.getElementById('startStats'),
    savedScore: document.getElementById('savedScore'),
    savedFastest: document.getElementById('savedFastest'),
    savedSolved: document.getElementById('savedSolved'),
    themeRow: document.getElementById('themeRow'),
    playBtn: document.getElementById('playBtn'),

    tiersContainer: document.getElementById('tiersContainer'),

    tierBadge: document.getElementById('tierBadge'),
    timerChip: document.getElementById('timerChip'),
    pieSvg: document.getElementById('pieSvg'),
    pieWrap: document.getElementById('pieWrap'),
    targetFraction: document.getElementById('targetFraction'),
    curNum: document.getElementById('curNum'),
    curDen: document.getElementById('curDen'),
    statusMsg: document.getElementById('statusMsg'),
    simplifyNote: document.getElementById('simplifyNote'),
    addBtn: document.getElementById('addBtn'),
    removeBtn: document.getElementById('removeBtn'),
    hintBtn: document.getElementById('hintBtn'),
    hintsLeft: document.getElementById('hintsLeft'),
    nextBtn: document.getElementById('nextBtn'),
    levelDots: document.getElementById('levelDots'),
    badgeGrid: document.getElementById('badgeGrid'),

    endScore: document.getElementById('endScore'),
    endAccuracy: document.getElementById('endAccuracy'),
    endFastest: document.getElementById('endFastest'),
    endBadges: document.getElementById('endBadges'),
    playAgainBtn: document.getElementById('playAgainBtn'),
    backToMenuBtn: document.getElementById('backToMenuBtn'),

    toastStack: document.getElementById('toastStack')
  };

  dom.levelTotal.textContent = String(LEVELS.length);

 
  function showScreen(name) {
    dom.stage.dataset.screen = name;
    if (name === 'start') renderStartScreen();
    if (name === 'levels') renderLevelSelect();
  }
  
  function setStatus(message, kind) {
    dom.statusMsg.textContent = message;
    dom.statusMsg.className = 'status-msg ' + kind;
  }

  function shakeStage() {
    dom.stage.classList.remove('shake');
    void dom.stage.offsetWidth; 
    dom.stage.classList.add('shake');
  }

  function renderLevelDots(levelIndex, bestStars) {
    dom.levelDots.innerHTML = '';
    LEVELS.forEach((_, i) => {
      const dot = document.createElement('div');
      const solved = bestStars[i] !== null;
      dot.className = 'dot' + (solved ? ' done' : '') + (i === levelIndex ? ' active' : '');
      dot.textContent = String(i + 1);
      dom.levelDots.appendChild(dot);
    });
  }

  function renderBadges(unlockedIds) {
    dom.badgeGrid.innerHTML = '';
    ACHIEVEMENTS.forEach((a) => {
      const unlocked = unlockedIds.has(a.id);
      const el = document.createElement('div');
      el.className = 'badge' + (unlocked ? ' unlocked' : ' locked');
      el.title = a.description;
      el.innerHTML = `<span class="badge-icon">${a.icon}</span><span class="badge-label">${a.label}</span>`;
      dom.badgeGrid.appendChild(el);
    });
  }

  function showToast(icon, title, subtitle) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span class="toast-icon">${icon}</span><div><div class="toast-title">${title}</div><div class="toast-sub">${subtitle}</div></div>`;
    dom.toastStack.appendChild(toast);
    setTimeout(() => toast.classList.add('toast-out'), 2600);
    setTimeout(() => toast.remove(), 3000);
  }
  
  function applyTheme(theme) {
    const root = document.documentElement.style;
    root.setProperty('--filling', theme.filling);
    root.setProperty('--filling-dark', theme.fillingDark);
    root.setProperty('--slice-unshaded', theme.unshaded);
    dom.themeEmoji.textContent = theme.emoji;

    document.querySelectorAll('.theme-swatch').forEach((btn) => {
      btn.classList.toggle('selected', btn.dataset.themeId === theme.id);
    });
  }

  function buildThemeRow() {
    dom.themeRow.innerHTML = '';
    THEMES.forEach((theme) => {
      const btn = document.createElement('button');
      btn.className = 'theme-swatch';
      btn.dataset.themeId = theme.id;
      btn.style.setProperty('--swatch-color', theme.filling);
      btn.innerHTML = `<span class="swatch-emoji">${theme.emoji}</span><span>${theme.label}</span>`;
      btn.addEventListener('click', () => {
        game.setTheme(theme.id);
        applyTheme(theme);
      });
      dom.themeRow.appendChild(btn);
    });
  }
  
  function renderLevelSelect() {
    dom.tiersContainer.innerHTML = '';
    TIERS.forEach((tier) => {
      const group = document.createElement('div');
      group.className = 'tier-group';
      group.style.setProperty('--tier-color', tier.color);

      const heading = document.createElement('h3');
      heading.className = 'tier-heading';
      heading.textContent = tier.label;
      group.appendChild(heading);

      const grid = document.createElement('div');
      grid.className = 'level-grid';

      LEVELS.forEach((level, i) => {
        if (level.tier !== tier.id) return;
        const stars = game.bestStars[i];
        const card = document.createElement('button');
        card.className = 'level-card' + (stars !== null ? ' solved' : '');
        card.innerHTML = `
          <div class="level-card-num">${i + 1}</div>
          <div class="level-card-fraction">${level.target}/${level.denom}</div>
          <div class="level-card-stars">${starIcons(stars)}</div>
        `;
        card.addEventListener('click', () => {
          game.selectLevel(i);
          showScreen('game');
        });
        grid.appendChild(card);
      });

      group.appendChild(grid);
      dom.tiersContainer.appendChild(group);
    });
  }

  function starIcons(stars) {
    if (stars === null) return '<span class="star-empty">☆☆☆</span>';
    return '★'.repeat(stars) + '<span class="star-empty">' + '☆'.repeat(3 - stars) + '</span>';
  }

  
  function renderStartScreen() {
    const solvedCount = game.bestStars.filter((s) => s !== null).length;
    if (solvedCount > 0 || game.score > 0) {
      dom.startStats.hidden = false;
      dom.savedScore.textContent = String(game.score);
      dom.savedFastest.textContent = game.fastestSolveSeconds !== null
        ? formatTime(Math.floor(game.fastestSolveSeconds)) : '—';
      dom.savedSolved.textContent = `${solvedCount}/${LEVELS.length}`;
    } else {
      dom.startStats.hidden = true;
    }
  }


  let timerInterval = null;
  function startTimerDisplay() {
    stopTimerDisplay();
    timerInterval = setInterval(() => {
      if (!game.levelStartTime || game.solvedOnce) return;
      const seconds = Math.floor((Date.now() - game.levelStartTime) / 1000);
      dom.timerChip.textContent = '⏱ ' + formatTime(seconds);
    }, 250);
  }
  function stopTimerDisplay() {
    if (timerInterval) clearInterval(timerInterval);
  }

 
  const celebration = new ThreeCelebration(dom.pieWrap);

  const view = {
    render(state) {
      renderPie(dom.pieSvg, state.level.denom, state.shadedCount);

      dom.curNum.textContent = String(state.shadedCount);
      dom.curDen.textContent = String(state.level.denom);
      dom.targetFraction.textContent = `${state.level.target}/${state.level.denom}`;
      dom.levelNum.textContent = String(state.levelIndex + 1);
      dom.scoreNum.textContent = String(state.score);
      dom.hintsLeft.textContent = String(state.hintsRemaining);
      dom.hintBtn.disabled = state.hintsRemaining <= 0;

      if (state.tier) {
        dom.tierBadge.textContent = state.tier.label;
        dom.tierBadge.style.setProperty('--tier-color', state.tier.color);
      }

    
      dom.addBtn.disabled = state.shadedCount >= state.level.denom;
      dom.removeBtn.disabled = state.shadedCount <= 0;

      dom.nextBtn.classList.toggle('show', state.solvedOnce);

      renderLevelDots(state.levelIndex, state.bestStars);
      renderBadges(state.unlockedAchievements);
    },

    onProgress() {
      setStatus('Keep going — getting closer!', 'neutral');
      dom.simplifyNote.textContent = '';
    },

    onCorrect(level, stars, details) {
      const simplified = simplifyFraction(level.target, level.denom);
      if (details) {
       
        let msg = ` Correct! That's ${level.target}/${level.denom} — ${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}`;
        if (details.speedBonus > 0) msg += ` (+${details.speedBonus} speed bonus!)`;
        setStatus(msg, 'correct');
        celebration.burst();
        launchConfetti(dom.pieWrap);
      } else {
        setStatus(` Still correct — ${level.target}/${level.denom}`, 'correct');
      }

      if (!simplified.wasAlreadySimplified) {
        dom.simplifyNote.textContent =
          `💡 ${level.target}/${level.denom} simplifies to ${simplified.num}/${simplified.den} (divide by ${simplified.divisor})`;
      } else {
        dom.simplifyNote.textContent = '';
      }
    },

    onWrong() {
      setStatus('Not quite — try removing a piece or two', 'wrong');
      shakeStage();
      dom.simplifyNote.textContent = '';
    },

    onHint(message) {
      setStatus('💡 ' + message, 'neutral');
    },

    onLevelStart() {
      setStatus('Add pieces to build the target fraction', 'neutral');
      dom.simplifyNote.textContent = '';
      startTimerDisplay();
    },

    onAchievementsUnlocked(newlyUnlocked) {
      newlyUnlocked.forEach((a) => showToast(a.icon, 'Achievement unlocked!', a.label));
    },

    onGameComplete(summary) {
      stopTimerDisplay();
      dom.endScore.textContent = String(summary.score);
      dom.endAccuracy.textContent = summary.accuracy + '%';
      dom.endFastest.textContent = summary.fastestSolveSeconds !== null
        ? formatTime(Math.floor(summary.fastestSolveSeconds)) : '—';
      dom.endBadges.textContent = `${summary.badgesUnlocked}/${summary.totalBadges}`;
      showScreen('end');
    }
  };

  const audio = new AudioEngine();
  const game = new GameController({ audio, view });

  
  dom.addBtn.addEventListener('click', () => game.addPiece());
  dom.removeBtn.addEventListener('click', () => game.removePiece());
  dom.hintBtn.addEventListener('click', () => game.requestHint());
  dom.nextBtn.addEventListener('click', () => game.goToNextLevel());

  dom.playBtn.addEventListener('click', () => showScreen('levels'));
  dom.levelsBtn.addEventListener('click', () => showScreen('levels'));
  dom.homeBtn.addEventListener('click', () => showScreen('start'));
  dom.playAgainBtn.addEventListener('click', () => showScreen('levels'));
  dom.backToMenuBtn.addEventListener('click', () => showScreen('start'));

  dom.restartBtn.addEventListener('click', () => {
    if (confirm('Restart all progress? This clears your score, stars, and badges.')) {
      game.restart();
      showScreen('start');
    }
  });

  dom.muteBtn.addEventListener('click', () => {
    const muted = game.toggleMute();
    dom.muteBtn.textContent = muted ? '🔇' : '🔊';
  });

 
  document.addEventListener('keydown', (e) => {
    if (dom.stage.dataset.screen !== 'game') return;
    if (e.key === 'ArrowRight' || e.key === '+') game.addPiece();
    if (e.key === 'ArrowLeft' || e.key === '-') game.removePiece();
  });

  buildThemeRow();
  applyTheme(game.theme);
  showScreen('start');
});
