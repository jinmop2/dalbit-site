/* 달빛골목 — 타로 카드 그림
 * 앞면: 라이더-웨이트-스미스 원본(1909, 그림 Pamela Colman Smith, 퍼블릭 도메인 — 위키미디어 공용)
 * 뒷면: 달빛골목 SVG */
(function () {
  'use strict';
  const G = '#e6c470', G2 = '#f6e2a6';
  function starPath(cx, cy, r, n = 5, inner = 0.42, rot = -90) {
    let d = '';
    for (let i = 0; i < n * 2; i++) {
      const rr = i % 2 ? r * inner : r, a = (rot + (i * 180) / n) * Math.PI / 180;
      d += (i ? 'L' : 'M') + (cx + rr * Math.cos(a)).toFixed(1) + ' ' + (cy + rr * Math.sin(a)).toFixed(1);
    }
    return d + 'Z';
  }

  const src = card => `assets/tarot/${card.id}.webp`;
  const face = card => `<div class="rws"><img src="${src(card)}" alt="${card.name} (${card.en})" loading="lazy" decoding="async" draggable="false"></div>`;

  const back = () => `<svg class="tcard-back" viewBox="0 0 120 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="1" y="1" width="118" height="198" rx="9" fill="url(#tbgBack)" stroke="${G}" stroke-width="1.2"/>
    <rect x="7" y="7" width="106" height="186" rx="6" fill="none" stroke="${G}" stroke-width=".7"/>
    <rect x="12" y="12" width="96" height="176" rx="4" fill="url(#tpat)" opacity=".55"/>
    <circle cx="60" cy="100" r="26" fill="#120c2c" stroke="${G}" stroke-width="1"/>
    <path d="M66 82 a19 19 0 1 0 0 36 a15 15 0 1 1 0 -36" fill="${G2}"/>
    <path d="${starPath(52, 100, 5, 8, .45)}" fill="${G}"/>
    ${[[60, 40], [60, 160], [30, 100], [90, 100]].map(([x, y]) => `<path d="${starPath(x, y, 6, 4, .3)}" fill="${G}"/>`).join('')}
    ${[[38, 58, .2], [82, 58, .5], [38, 142, .8], [82, 142, .95]].map(([x, y, f]) => `<circle cx="${x}" cy="${y}" r="5" fill="#120c2c" stroke="${G}" stroke-width=".7"/><circle cx="${x + (f - .5) * 6}" cy="${y}" r="4" fill="${G2}" opacity=".85"/>`).join('')}
  </svg>`;

  const defs = () => `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
    <linearGradient id="tbgBack" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2c1a5c"/><stop offset="1" stop-color="#140c30"/></linearGradient>
    <pattern id="tpat" width="12" height="12" patternUnits="userSpaceOnUse"><path d="M6 0 L12 6 L6 12 L0 6 Z" fill="none" stroke="#e6c470" stroke-width=".4"/><circle cx="6" cy="6" r=".8" fill="#e6c470"/></pattern>
  </defs></svg>`;

  // 고른 카드 그림을 뒤집기 전에 미리 받아 둔다
  const preload = ids => Promise.all(ids.map(id => new Promise(res => { const im = new Image(); im.onload = im.onerror = res; im.src = `assets/tarot/${id}.webp`; })));

  window.TarotArt = { face, back, defs, src, preload };
})();
