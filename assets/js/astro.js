/* 달빛골목 — 별자리 운세용 천문 계산
 * 달의 황경: Jean Meeus, 『Astronomical Algorithms』 47장 주기항 상위 항(오차 약 0.05° 이내)
 * 해의 황경: manseryeok 의 apparentSolarLongitude (Meeus 25장) */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('manseryeok'));
  else root.Astro = factory(root.Manseryeok);
})(typeof self !== 'undefined' ? self : this, function (M) {
  'use strict';
  const RAD = Math.PI / 180;
  const norm = x => ((x % 360) + 360) % 360;
  // [D, M, M', F, 계수(1e-6 도)]
  const LTERMS = [
    [0, 0, 1, 0, 6288774], [2, 0, -1, 0, 1274027], [2, 0, 0, 0, 658314], [0, 0, 2, 0, 213618], [0, 1, 0, 0, -185116], [0, 0, 0, 2, -114332],
    [2, 0, -2, 0, 58793], [2, -1, -1, 0, 57066], [2, 0, 1, 0, 53322], [2, -1, 0, 0, 45758], [0, 1, -1, 0, -40923], [1, 0, 0, 0, -34720],
    [0, 1, 1, 0, -30383], [2, 0, 0, -2, 15327], [0, 0, 1, 2, -12528], [0, 0, 1, -2, 10980], [4, 0, -1, 0, 10675], [0, 0, 3, 0, 10034],
    [4, 0, -2, 0, 8548], [2, 1, -1, 0, -7888], [2, 1, 0, 0, -6766], [1, 0, -1, 0, -5163], [1, 1, 0, 0, 4987], [2, -1, 1, 0, 4036],
    [2, 0, 2, 0, 3994], [4, 0, 0, 0, 3861], [2, 0, -3, 0, 3665], [0, 1, -2, 0, -2689], [2, 0, -1, 2, -2602], [2, -1, -2, 0, 2390],
    [1, 0, 1, 0, -2348], [2, -2, 0, 0, 2236], [0, 1, 2, 0, -2120], [0, 2, 0, 0, -2069], [2, -2, -1, 0, 2048], [2, 0, 1, -2, -1773],
    [2, 0, 0, 2, -1595], [4, -1, -1, 0, 1215], [0, 0, 2, 2, -1110], [3, 0, -1, 0, -892], [2, 1, 1, 0, -810], [4, -1, -2, 0, 759],
    [0, 2, -1, 0, -713], [2, 2, -1, 0, -700], [2, 1, -2, 0, 691], [2, -1, 0, -2, 596], [4, 0, 1, 0, 549], [0, 0, 4, 0, 537],
  ];
  function moonLongitude(ms) {
    const jd = ms / 86400000 + 2440587.5 + 69 / 86400; // ΔT 약 69초
    const T = (jd - 2451545) / 36525;
    const Lp = 218.3164477 + 481267.88123421 * T - 0.0015786 * T * T;
    const D = 297.8501921 + 445267.1114034 * T - 0.0018819 * T * T;
    const Ms = 357.5291092 + 35999.0502909 * T - 0.0001536 * T * T;
    const Mp = 134.9633964 + 477198.8675055 * T + 0.0087414 * T * T;
    const F = 93.272095 + 483202.0175233 * T - 0.0036539 * T * T;
    const E = 1 - 0.002516 * T - 0.0000074 * T * T;
    let sum = 0;
    for (const [d, m, mp, f, c] of LTERMS) {
      let v = c * Math.sin((d * D + m * Ms + mp * Mp + f * F) * RAD);
      if (Math.abs(m) === 1) v *= E; else if (Math.abs(m) === 2) v *= E * E;
      sum += v;
    }
    const A1 = 119.75 + 131.849 * T, A2 = 53.09 + 479264.29 * T;
    sum += 3958 * Math.sin(A1 * RAD) + 1962 * Math.sin((Lp - F) * RAD) + 318 * Math.sin(A2 * RAD);
    const omega = 125.04452 - 1934.136261 * T;
    return norm(Lp + sum / 1e6 - 0.00478 * Math.sin(omega * RAD));
  }
  const sunLongitude = ms => M.apparentSolarLongitude(ms);

  const SIGNS = [
    { ko: '양자리', en: 'Aries', sym: '♈', el: '불', ruler: '화성', dates: '3/21~4/19' },
    { ko: '황소자리', en: 'Taurus', sym: '♉', el: '흙', ruler: '금성', dates: '4/20~5/20' },
    { ko: '쌍둥이자리', en: 'Gemini', sym: '♊', el: '공기', ruler: '수성', dates: '5/21~6/21' },
    { ko: '게자리', en: 'Cancer', sym: '♋', el: '물', ruler: '달', dates: '6/22~7/22' },
    { ko: '사자자리', en: 'Leo', sym: '♌', el: '불', ruler: '태양', dates: '7/23~8/22' },
    { ko: '처녀자리', en: 'Virgo', sym: '♍', el: '흙', ruler: '수성', dates: '8/23~9/22' },
    { ko: '천칭자리', en: 'Libra', sym: '♎', el: '공기', ruler: '금성', dates: '9/23~10/22' },
    { ko: '전갈자리', en: 'Scorpio', sym: '♏', el: '물', ruler: '화성·명왕성', dates: '10/23~11/21' },
    { ko: '사수자리', en: 'Sagittarius', sym: '♐', el: '불', ruler: '목성', dates: '11/22~12/21' },
    { ko: '염소자리', en: 'Capricorn', sym: '♑', el: '흙', ruler: '토성', dates: '12/22~1/19' },
    { ko: '물병자리', en: 'Aquarius', sym: '♒', el: '공기', ruler: '토성·천왕성', dates: '1/20~2/18' },
    { ko: '물고기자리', en: 'Pisces', sym: '♓', el: '물', ruler: '목성·해왕성', dates: '2/19~3/20' },
  ];
  const signOf = lon => Math.floor(norm(lon) / 30);
  // 생일(한국 시각 정오 기준)의 태양 별자리 — 경계일 출생도 실제 태양 위치로 판정
  function sunSignOfBirth(y, m, d, h = 12, mi = 0) {
    const ms = Date.UTC(y, m - 1, d, h - 9, mi);
    const lon = sunLongitude(ms);
    return { idx: signOf(lon), lon, deg: lon % 30 };
  }
  const PHASES = ['삭(새달)', '초승달', '상현달', '차오르는 달', '보름달', '기우는 달', '하현달', '그믐달'];
  function moonPhase(ms) {
    const el = norm(moonLongitude(ms) - sunLongitude(ms));
    const idx = Math.floor(((el + 22.5) % 360) / 45);
    const illum = (1 - Math.cos(el * RAD)) / 2;
    return { elong: el, idx, name: PHASES[idx], illum };
  }
  // 그날(한국 시각) 정오의 달 위치
  function skyOn(y, m, d) {
    const ms = Date.UTC(y, m - 1, d, 3, 0); // KST 12:00
    const ml = moonLongitude(ms), sl = sunLongitude(ms);
    // 다음 별자리로 넘어가는 시각(대략)
    const next = (Math.floor(ml / 30) + 1) * 30;
    const hours = (norm(next - ml)) / 0.549; // 시간당 약 0.549°
    return { moonLon: ml, moonSign: signOf(ml), sunLon: sl, sunSign: signOf(sl), phase: moonPhase(ms), moonIngressH: hours };
  }
  // 상(aspect): 두 황경 차이
  function aspect(a, b) {
    const d = Math.abs(((a - b + 540) % 360) - 180);
    const list = [[0, '합', 8], [60, '육분', 6], [90, '사각', 7], [120, '삼분', 8], [180, '대립', 8]];
    for (const [ang, name, orb] of list) if (Math.abs(d - ang) <= orb) return { name, ang, exact: Math.abs(d - ang) };
    return null;
  }

  return { moonLongitude, sunLongitude, SIGNS, signOf, sunSignOfBirth, moonPhase, skyOn, aspect, PHASES };
});
