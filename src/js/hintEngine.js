
export const MAX_HINTS_PER_LEVEL = 3;

/**
 * @param {number} shadedCount
 * @param {number} target
 * @param {number} denom
 * @returns {string} 
 */
export function getHint(shadedCount, target, denom) {
  if (shadedCount === target) {
    return "You're already there — press Next Level!";
  }
  if (shadedCount < target) {
    const diff = target - shadedCount;
    return diff === 1
      ? 'Try adding one more piece.'
      : `Try adding a few more pieces — you need ${diff} more.`;
  }
  const diff = shadedCount - target;
  return diff === 1
    ? 'A little too much — try removing one piece.'
    : `You've overshot — try removing ${diff} pieces.`;
}
