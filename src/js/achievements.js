
export const ACHIEVEMENTS = [
  {
    id: 'first_solve',
    icon: '🏅',
    label: 'Fraction Beginner',
    description: 'Solve your first level',
    check: (stats) => stats.levelsSolved >= 1
  },
  {
    id: 'perfect_level',
    icon: '🎯',
    label: 'Perfect Accuracy',
    description: 'Solve a level with 3 stars',
    check: (stats) => stats.threeStarLevels >= 1
  },
  {
    id: 'speed_solver',
    icon: '⚡',
    label: 'Speed Solver',
    description: 'Solve a level in under 10 seconds',
    check: (stats) => stats.fastestSolveSeconds !== null && stats.fastestSolveSeconds < 10
  },
  {
    id: 'no_mistake_streak',
    icon: '🔥',
    label: '5-Level Streak',
    description: 'Solve 5 levels in a row without an overshoot',
    check: (stats) => stats.bestCleanStreak >= 5
  },
  {
    id: 'fraction_master',
    icon: '🏆',
    label: 'Fraction Master',
    description: 'Complete every level in the game',
    check: (stats) => stats.levelsSolved >= stats.totalLevels
  }
];

/**
 * @param {object} stats 
 * @param {Set<string>} alreadyUnlocked 
 * @returns {Array} 
 */
export function getNewlyUnlocked(stats, alreadyUnlocked) {
  return ACHIEVEMENTS.filter((a) => !alreadyUnlocked.has(a.id) && a.check(stats));
}
