
/**
 * @param {number} overshootCount 
 * @returns {number} 
 */
export function calculateStars(overshootCount) {
  if (overshootCount === 0) return 3;
  if (overshootCount <= 2) return 2;
  return 1;
}

export function starsToString(stars) {
  return '★★★'.slice(0, stars) + '☆☆☆'.slice(0, 3 - stars);
}
