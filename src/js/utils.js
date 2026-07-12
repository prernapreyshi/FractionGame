export function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a || 1;
}

/**

 * @returns {{ num:number, den:number, divisor:number, wasAlreadySimplified:boolean }}
 */
export function simplifyFraction(num, den) {
  const divisor = gcd(num, den);
  return {
    num: num / divisor,
    den: den / divisor,
    divisor,
    wasAlreadySimplified: divisor === 1
  };
}

export function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}
