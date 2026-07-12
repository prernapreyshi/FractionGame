import { PIE_GEOMETRY } from './config.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

/** Converts a polar coordinate (angle from 12 o'clock) to cartesian x/y. */
function polarToCartesian(cx, cy, r, angleDeg) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad)
  };
}

/** Builds an SVG arc "d" path string for one pie slice. */
function describeSlice(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

  return [
    'M', cx, cy,
    'L', start.x, start.y,
    'A', r, r, 0, largeArcFlag, 0, end.x, end.y,
    'Z'
  ].join(' ');
}

/**

 *
 * @param {SVGSVGElement} svgEl
 * @param {number} denom 
 * @param {number} shadedCount
 */
export function renderPie(svgEl, denom, shadedCount) {
  const { centerX: cx, centerY: cy, radius: r } = PIE_GEOMETRY;
  const anglePerSlice = 360 / denom;

  svgEl.innerHTML = '';

  for (let i = 0; i < denom; i++) {
    const startAngle = i * anglePerSlice;
    const endAngle = startAngle + anglePerSlice;

    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', describeSlice(cx, cy, r, startAngle, endAngle));
    path.setAttribute('class', 'slice ' + (i < shadedCount ? 'shaded' : 'unshaded'));
    path.dataset.index = String(i);

    svgEl.appendChild(path);
  }
}

/**
 
 * @param {HTMLElement} containerEl 
 */
export function launchConfetti(containerEl) {
  const colors = ['#E8A33D', '#C1447E', '#4E9F7D', '#F3C969', '#7BB8A0'];
  const pieceCount = 22;

  for (let i = 0; i < pieceCount; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';

    const angle = Math.random() * Math.PI * 2;
    const distance = 60 + Math.random() * 90;

    piece.style.setProperty('--dx', `${Math.cos(angle) * distance}px`);
    piece.style.setProperty('--dy', `${Math.sin(angle) * distance}px`);
    piece.style.setProperty('--rot', `${Math.random() * 360}deg`);
    piece.style.background = colors[i % colors.length];

    containerEl.appendChild(piece);
    setTimeout(() => piece.remove(), 850);
  }
}
