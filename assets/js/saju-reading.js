/* 달빛골목 — 사주 분석 결과를 청운 선생의 풀이로 엮는다 */
(function () {
  'use strict';
  const S = window.SajuCore, K = window.SajuData, D = window.Dalbit;
  const j = (w, p) => D.j(w, p);
  const pj = (w, p) => D.j(w, p).slice(String(w).length); // 조사만
  const EL_H = S.ELEMENTS_H;
  const POSNAME = { year: '년주', month: '월주', day: '일주', hour: '시주' };
  const SPOT = { year: '년', month: '월', day: '일', hour: '시' };

  /* ── 오행 길흉 (용신·희신·기신·구신·한신) ── */
  function favMap(a) {
    const E = S.ELEMENTS, y = a.yongsin;
    const idx = e => E.indexOf(e);
    const gusin = E[(idx(y.gisin) + 4) % 5];
    const m = {};
    for (const e of E) m[e] = 0;
    m[y.el] = 2; m[y.huisin] = 1; m[y.gisin] = -2; m[gusin] = -1;
    if (y.johu && y.johu.el !== y.el) m[y.johu.el] = m[y.johu.el] < 0 ? 0 : Math.max(m[y.johu.el], 1);
    return m;
  }
  const FAV_NAME = { 2: '용신', 1: '희신', 0: '한신', '-1': '구신', '-2': '기신' };
  function flowLabel(score) {
    if (score >= 1.2) return ['크게 좋은 흐름', 'great'];
    if (score >= 0.4) return ['좋은 흐름', 'good'];
    if (score > -0.4) return ['무난한 흐름', 'even'];
    if (score > -1.2) return ['조심할 흐름', 'care'];
    return ['단련의 흐름', 'hard'];
  }
  function pillarScore(a, fm, p) {
    let s = fm[p.stemEl] * 0.45 + fm[p.branchEl] * 0.55;
    // 일지·월지와 충이면 변동
    for (const k of ['day', 'month']) {
      if (!a.pillars[k]) continue;
      const rel = S.branchRelations(p.branch, a.pillars[k].branch);
      if (rel.some(r => r.type === '충')) s -= 0.35;
      if (rel.some(r => r.type === '육합' || r.type === '삼합')) s += 0.15;
    }
    return s;
  }

  /* ── 세운·해마다의 사건 ── */
  const XS = () => window.SajuExtra;
  function seunFor(a, y) {
    const p = S.yearPillar(y);
    const d = S.describePillar(a.dm, p);
    const rel = [];
    for (const k of Object.keys(a.pillars)) {
      for (const x of S.branchRelations(p.branch, a.pillars[k].branch)) rel.push(Object.assign({ with: k }, x));
      for (const x of S.stemRelations(p.stem, a.pillars[k].stem)) rel.push(Object.assign({ with: k, stemLevel: true }, x));
    }
    return Object.assign(d, { year: y, relations: rel });
  }
  const spouseGroupOf = a => (a.gender === 'male' ? '재성' : '관성');
  function yearEvents(a, fm, from, to) {
    const out = [];
    const sp = spouseGroupOf(a);
    for (let y = from; y <= to; y++) {
      const s = seunFor(a, y);
      const sc = pillarScore(a, fm, s);
      const g = [S.GROUP_OF[s.stemTG], S.GROUP_OF[s.branchTG]];
      const dayRel = s.relations.filter(r => r.with === 'day' && !r.stemLevel).map(r => r.type);
      const monRel = s.relations.filter(r => r.with === 'month' && !r.stemLevel).map(r => r.type);
      const dohwa = ['day', 'year'].some(k => S.sinsal12(a.pillars[k].branch, s.branch) === '년살');
      const yeokma = ['day', 'year'].some(k => S.sinsal12(a.pillars[k].branch, s.branch) === '역마살');
      const love = g.includes(sp) || dayRel.includes('육합') || dayRel.includes('삼합') || dohwa;
      const money = g.includes('재성') || (g.includes('식상') && a.strength.level >= 2);
      const job = g.includes('관성') || g.includes('인성');
      const move = dayRel.includes('충') || monRel.includes('충') || yeokma;
      const caution = sc <= -0.7 || (dayRel.includes('충') && sc < 0);
      out.push({ y, s, sc, love, money, job, move, caution, dohwa, dayRel, monRel });
    }
    return out;
  }

  /* ── 물상(物象): 사주를 한 폭의 그림으로 ── */
  function mulsang(a) {
    const X = XS(), dm = a.dm, mb = a.pillars.month.branch;
    const others = [...new Set(['year', 'month', 'hour'].filter(k => a.pillars[k]).map(k => a.pillars[k].stem))].filter(st => st !== dm);
    const sameDm = ['year', 'month', 'hour'].filter(k => a.pillars[k] && a.pillars[k].stem === dm).length;
    let scene = `${X.SEASON_SCENE[mb]}, ${j(X.STEM_IMG[dm], '이가')} 있는 그림이네.`;
    if (others.length) {
      const parts = others.map(st => X.STEM_SCENE[st]);
      parts[parts.length - 1] = parts[parts.length - 1].replace(/고$/, '네');
      scene += ' ' + parts.join(', ') + '.';
    }
    if (sameDm) scene += ` 곁에 같은 ${j(X.STEM_IMG[dm], '이가')} 또 있어 힘을 나누고 있구먼.`;
    const named = X.MULSANG.filter(([st]) => st[0] === dm && st.slice(1).every(x => others.includes(x))).map(([, n, t]) => ({ n, t }));
    const jf = a.johu.items[0];
    const second = a.johu.items.slice(1, 3).find(x => x.shown);
    const judge = jf.shown ? `이 계절에 가장 먼저 필요한 ${jf.stemH}(${jf.stem})${pj(jf.stem, '이가')} 하늘에 떠 있으니, 그림이 제대로 살았구먼.`
      : jf.hidden ? `이 계절에 가장 먼저 필요한 ${jf.stemH}(${jf.stem})${pj(jf.stem, '이가')} 땅속(지장간)에 숨어 있으니, 운에서 하늘로 드러날 때 크게 빛을 보네.`
        : second ? `으뜸으로 찾는 ${jf.stemH}(${jf.stem})${pj(jf.stem, '은는')} 없지만 버금인 ${second.stemH}(${second.stem})${pj(second.stem, '이가')} 떠 있어 그런대로 그림이 살았네. ${jf.stemH}의 운이 오면 한층 밝아지지.`
          : `다만 이 계절에 꼭 필요한 ${jf.stemH}(${jf.stem})${pj(jf.stem, '이가')} 보이지 않으니, 그 기운이 들어오는 운을 기다려야 하네.`;
    return { scene, named, judge };
  }
  function archetypeOf(a) {
    const gp = a.groupPower;
    const [g1, g2] = S.GROUPS.slice().sort((x, y) => gp[y] - gp[x]);
    const r = XS().ARCHE[g1 + g2];
    return { key: g1 + g2, g1, g2, name: r[0], desc: r[1], jobs: r[2] };
  }
  function hiddenTalents(a) {
    const shown = new Set(['year', 'month', 'hour'].filter(k => a.pillars[k]).map(k => S.GROUP_OF[a.pillars[k].stemTG]));
    const hid = new Set();
    for (const k of Object.keys(a.pillars)) for (const h of a.pillars[k].hidden) hid.add(S.GROUP_OF[h.tg]);
    const TXT = { 비겁: '드러내지 않은 승부욕과 독립심', 식상: '아직 꺼내지 않은 표현력과 재주', 재성: '숨어 있는 재물 감각과 현실 감각', 관성: '속에 품은 책임감과 명예욕', 인성: '조용히 쌓아 둔 학문과 인덕' };
    return [...hid].filter(g => !shown.has(g)).map(g => ({ g, t: TXT[g] }));
  }

  /* ── 그래프 ── */
  const toPct = sc => Math.max(6, Math.min(96, Math.round(50 + sc * 24)));
  function lifeGraph(a, fm) {
    if (!a.daeun) return '';
    const L = a.daeun.list.slice(0, 9);
    const W = 640, H = 236, x0 = 34, x1 = W - 16, y0 = 30, y1 = H - 50;
    // 가로축은 나이: 각 대운의 점은 그 10년의 가운데, 눈금은 대운이 바뀌는 나이
    const A0 = L[0].age, A1 = L[L.length - 1].age + 10;
    const xa = age => x0 + (x1 - x0) * (Math.min(A1, Math.max(A0, age)) - A0) / (A1 - A0);
    const xs = L.map(d => xa(d.age + 5));
    const ys = L.map(d => y1 - (y1 - y0) * toPct(pillarScore(a, fm, d)) / 100);
    const seg = i => { const m = (xs[i] + xs[i + 1]) / 2; return [[xs[i], ys[i]], [m, ys[i]], [m, ys[i + 1]], [xs[i + 1], ys[i + 1]]]; };
    const bz = (P, t) => { const u = 1 - t; return [0, 1].map(k => u * u * u * P[0][k] + 3 * u * u * t * P[1][k] + 3 * u * t * t * P[2][k] + t * t * t * P[3][k]); };
    let path = `M${xa(A0)} ${ys[0]} L${xs[0]} ${ys[0]}`;
    for (let i = 0; i < xs.length - 1; i++) { const P = seg(i); path += ` C${P[1][0]} ${P[1][1]} ${P[2][0]} ${P[2][1]} ${P[3][0]} ${P[3][1]}`; }
    path += ` L${xa(A1)} ${ys[ys.length - 1]}`;
    const area = `${path} L${xa(A1)} ${y1} L${xa(A0)} ${y1} Z`;
    // 지금: 실제 만 나이
    const birth = Date.UTC(a.solar.y, a.solar.m - 1, a.solar.d);
    const ageNow = (Date.now() - birth) / (365.2425 * 86400e3);
    const xn = xa(ageNow);
    let yn;
    if (xn <= xs[0]) yn = ys[0];
    else if (xn >= xs[xs.length - 1]) yn = ys[ys.length - 1];
    else {
      const i = xs.findIndex((x, k) => k < xs.length - 1 && xn >= x && xn <= xs[k + 1]);
      const P = seg(i); let lo = 0, hi = 1;
      for (let k = 0; k < 30; k++) { const mid = (lo + hi) / 2; if (bz(P, mid)[0] < xn) lo = mid; else hi = mid; }
      yn = bz(P, (lo + hi) / 2)[1];
    }
    const cur = a.daeun.current;
    const before = ageNow < A0;
    const lab = before ? `지금 · 첫 대운 전` : `지금 · 만 ${Math.floor(ageNow)}세`;
    const anchor = xn < x0 + 50 ? 'start' : xn > x1 - 50 ? 'end' : 'middle';
    const curBand = cur >= 0 && cur < L.length ? `<rect x="${xa(L[cur].age)}" y="${y0 - 8}" width="${xa(L[cur].age + 10) - xa(L[cur].age)}" height="${y1 - y0 + 8}" class="band"/>` : '';
    const ticks = L.map(d => d.age).concat([A1]).map(age => `<line x1="${xa(age)}" x2="${xa(age)}" y1="${y1}" y2="${y1 + 5}" class="tick"/><text x="${xa(age)}" y="${y1 + 18}" class="age">${age}세</text>`).join('');
    return `<svg class="life-graph" viewBox="0 0 ${W} ${H}" role="img" aria-label="대운 흐름 그래프, ${lab}">
      <defs><linearGradient id="lgfill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b8322a" stop-opacity=".35"/><stop offset="1" stop-color="#b8322a" stop-opacity="0"/></linearGradient></defs>
      ${curBand}
      ${[25, 50, 75].map(v => `<line x1="${x0}" x2="${x1}" y1="${y1 - (y1 - y0) * v / 100}" y2="${y1 - (y1 - y0) * v / 100}" class="grid"/>`).join('')}
      <text x="4" y="${y0 + 8}" class="axis">좋음</text><text x="4" y="${y1}" class="axis">단련</text>
      <path d="${area}" fill="url(#lgfill)"/><path d="${path}" class="line"/>
      ${xs.map((x, i) => `<g class="pt${i === cur ? ' cur' : ''}"><circle cx="${x}" cy="${ys[i]}" r="4.5"/><text x="${x}" y="${H - 8}" class="gz">${L[i].hanja}</text></g>`).join('')}
      ${ticks}
      <g class="nowmark"><line x1="${xn}" x2="${xn}" y1="${y0 - 6}" y2="${y1}" class="nowline"/><circle cx="${xn}" cy="${yn}" r="7"/><text x="${xn}" y="${y0 - 12}" class="nowlab" text-anchor="${anchor}">${lab}</text></g>
    </svg>`;
  }
  const EV_ICON = { love: '💞', money: '💰', job: '💼', move: '🧳', caution: '⚠️' };
  function decadeChart(evs) {
    return `<div class="decade">${evs.map(e => { const v = toPct(e.sc); const lab = flowLabel(e.sc); return `<div class="dc ${lab[1]}"><div class="ic">${Object.keys(EV_ICON).filter(k => e[k]).map(k => EV_ICON[k]).join('')}</div><div class="bar"><div style="height:${v}%"></div></div><b>${String(e.y).slice(2)}</b><small>${e.s.stem}${e.s.branch}</small></div>`; }).join('')}</div>
      <p class="muted small">💞 인연 · 💰 재물 · 💼 일·시험 · 🧳 이동·변화 · ⚠️ 조심 — 막대가 높을수록 순한 해예요.</p>`;
  }

  /* ── 지난 해 맞히기 (철학관식 확인) ── */
  function pastHits(a, fm) {
    const now = S.kstNow().y;
    const from = Math.max(a.solar.y + 15, now - 12), to = now - 1;
    if (to - from < 2) return [];
    const evs = yearEvents(a, fm, from, to);
    const daeunYears = a.daeun ? a.daeun.list.map(d => d.fromYear) : [];
    const pick = evs.find(e => e.dayRel.includes('충')) || evs.find(e => e.monRel.includes('충')) || evs.find(e => daeunYears.includes(e.y)) || evs.slice().sort((x, y) => x.sc - y.sc)[0];
    const good = evs.filter(e => e.y !== pick.y && Math.abs(e.y - pick.y) > 1).sort((x, y) => y.sc - x.sc)[0];
    const out = [];
    const why = pick.dayRel.includes('충') ? `그해 ${pick.s.branch}${pj(pick.s.branch, '이가')} 자네 일지 ${a.pillars.day.branch}${pj(a.pillars.day.branch, '과와')} 정면으로 부딪쳤거든(충).`
      : pick.monRel.includes('충') ? `그해 ${pick.s.branch}${pj(pick.s.branch, '이가')} 자네 월지 ${a.pillars.month.branch}${pj(a.pillars.month.branch, '과와')} 부딪쳐 자리가 흔들렸거든(충).`
        : daeunYears.includes(pick.y) ? '그해 즈음 십 년 대운이 바뀌었거든.' : '그해는 자네에게 기운이 거슬렀던 해였거든.';
    out.push({ y: pick.y, q: `자네, ${pick.y}년(${pick.s.stem}${pick.s.branch}년) 즈음에 이사나 이직, 관계 정리처럼 큰 변동이 있지 않았나?`, why });
    if (good) out.push({ y: good.y, q: `그리고 ${good.y}년(${good.s.stem}${good.s.branch}년)엔 일이 술술 풀리거나 인정받는 일이 있었을 걸세. 어떤가?`, why: `그해는 자네에게 ${good.s.stemTG}의 해였고, 반가운 ${good.s.stemEl}·${good.s.branchEl} 기운이 들었거든.` });
    return out;
  }

  /* ── 사주 카드 (한눈에) ── */
  function sajuCard(a) {
    const X = XS(), il = X.ILJU[a.dayPillar], ms = mulsang(a), ar = archetypeOf(a), ye = K.EL[a.yongsin.el];
    return `<div class="saju-card">
      <div class="sc-top"><div class="sc-ilju"><span class="h">${a.pillars.day.stemH}${a.pillars.day.branchH}</span><small>${a.dayPillar} 일주</small></div>
        <div><div class="sc-nick">「${il[0]}」</div><div class="sc-type">${ar.name}</div></div></div>
      <p class="sc-scene">🖼️ ${ms.scene}</p>
      ${ms.named.map(n => `<p class="sc-named"><b>${n.n}</b> — ${n.t}</p>`).join('')}
      <p class="sc-judge">${ms.judge}</p>
      <div class="sc-tags"><span>용신 ${a.yongsin.el}(${EL_H[a.yongsin.el]})</span><span>행운의 색 ${ye.color}</span><span>${a.strength.name}</span><span>${a.yongsin.jong || a.gyeok.name}</span><span>뿌리 · ${a.roots.level}</span></div>
    </div>`;
  }

  /* ── 원국 표 ── */
  function chartHTML(a) {
    const cols = ['hour', 'day', 'month', 'year'].filter(k => a.pillars[k]);
    const cell = (k, f) => cols.map(c => `<td>${f(a.pillars[c], c)}</td>`).join('');
    const elBox = (ch, el, yang, sub) => `<div class="gz el-${el}" title="${el}(${EL_H[el]}) · ${yang ? '양' : '음'}"><span class="h">${ch}</span><span class="k">${sub}</span></div>`;
    return `
      <table class="wonguk">
        <thead><tr><th></th>${cols.map(c => `<th>${a.pillars[c].label}<small>${a.pillars[c].palace.split('·')[0]}</small></th>`).join('')}</tr></thead>
        <tbody>
          <tr class="tg"><th>십성</th>${cell(0, p => p.stemTG)}</tr>
          <tr><th>천간</th>${cell(0, p => elBox(p.stemH, p.stemEl, p.stemYang, p.stem + ' · ' + p.stemEl))}</tr>
          <tr><th>지지</th>${cell(0, p => elBox(p.branchH, p.branchEl, p.branchYang, p.branch + ' · ' + p.branchEl))}</tr>
          <tr class="tg"><th>십성</th>${cell(0, p => p.branchTG)}</tr>
          <tr class="sm"><th>지장간</th>${cell(0, p => p.hidden.map(h => `<span class="el-t-${h.el}" title="${h.tg}">${h.stemH}</span>`).join(' '))}</tr>
          <tr class="sm"><th>12운성</th>${cell(0, p => p.stage)}</tr>
          <tr class="sm"><th>12신살</th>${cell(0, p => p.sinsal12 + (p.gongmang ? ' <em class="gm">공망</em>' : ''))}</tr>
        </tbody>
      </table>`;
  }

  function infoHTML(a) {
    const p = a.input;
    const name = p.name ? D.esc(p.name) + ' · ' : '';
    const lun = a.lunar ? `음력 ${a.lunar.y}.${a.lunar.m}.${a.lunar.d}${a.lunar.leap ? '(윤)' : ''}` : '';
    let corr = '';
    if (a.correction) {
      const c = a.correction;
      const parts = [];
      if (c.dstMin) parts.push(`${c.dstMin === 60 ? '서머타임' : '당시 표준시'} ${c.dstMin > 0 ? '−' : '+'}${Math.abs(c.dstMin)}분`);
      if (c.lonMin) parts.push(`경도 ${c.lonMin > 0 ? '+' : '−'}${Math.abs(c.lonMin)}분`);
      if (c.eotMin) parts.push(`균시차 ${c.eotMin > 0 ? '+' : '−'}${Math.abs(c.eotMin)}분`);
      corr = `<div>입력 ${String(p.hour).padStart(2, '0')}:${String(p.minute).padStart(2, '0')} → 진태양시 <b>${c.solarTime}</b> <span class="muted small">(${parts.join(', ') || '보정 없음'})</span></div>`;
    }
    const dae = a.daeun ? `대운수 ${a.daeun.startYears}년 ${a.daeun.startMonths}개월 (${a.daeun.forward ? '순행' : '역행'})` : '';
    return `<div class="info-line">${name}${a.gender === 'female' ? '여성' : '남성'} · 양력 ${a.solar.y}.${a.solar.m}.${a.solar.d} · ${lun} · ${a.animal}띠</div>
      ${corr}
      <div class="muted small">${dae}${a.gongmang ? ` · 공망 ${a.gongmang.join('')}` : ''}${a.hasHour ? '' : ' · 태어난 시를 몰라 세 기둥(삼주)으로 봅니다'}</div>`;
  }

  /* ── 1. 타고난 나 ── */
  function selfSection(a) {
    const dm = K.DM[a.dm];
    const dp = a.pillars.day;
    const stage = K.STAGE[dp.stage];
    const special = [];
    const ganyeo = S.stemEl(dp.stem) === S.branchEl(dp.branch);
    if (ganyeo) special.push(`일주 ${dp.stem}${dp.branch}${pj(dp.branch, '은는')} 천간과 지지가 같은 오행인 <b>간여지동</b>이라, 주관이 뚜렷하고 자기 세계가 단단하네. 배우자와도 대등하게 맞서는 기질이 있어 서로의 영역을 존중해야 하지.`);
    if (['경진', '경술', '임진', '임술', '무술'].includes(dp.stem + dp.branch)) special.push(`일주 ${dp.stem}${dp.branch}${pj(dp.branch, '은는')} <b>괴강</b>일세. 총명하고 결단이 빠르며 남 밑에 있기 싫어하는 우두머리 기질이 있어.`);
    if (['정해', '정유', '계사', '계묘'].includes(dp.stem + dp.branch)) special.push(`일주 ${dp.stem}${dp.branch}${pj(dp.branch, '은는')} 일지에 귀인을 깔고 앉은 <b>일귀(日貴)</b>일세. 용모가 단정하고 품위가 있으며, 어려울 때 돕는 손길이 따르지.`);
    if (['갑인', '을묘', '병오', '정사', '무진', '무술', '기축', '기미', '경신', '신유', '임자', '계해'].includes(dp.stem + dp.branch) && !ganyeo) special.push(`일주 ${dp.stem}${dp.branch}${pj(dp.branch, '은는')} 제 뿌리를 깔고 앉아 힘이 단단하네.`);
    const g = K.GYEOK[a.gyeok.name] || '';
    const ilju = XS().ILJU[a.dayPillar];
    const rl = a.roots.list.map(r => `${POSNAME[r.pos]}의 ${r.branch} 속 ${S.STEMS_H[S.si(r.stem)]}(${r.kind})`);
    const rootText = (rl.length ? `일간과 같은 기운이 ${rl.join(', ')}에 있네. ` : '네 지지 어디에도 일간과 같은 기운이 없네. ') + ({ '강한 뿌리': '땅에 깊이 뿌리내려 쉽게 흔들리지 않는 사람일세.', '든든한 뿌리': '제법 뿌리가 있어 어려움이 와도 버틸 힘이 있네.', '가는 뿌리': '뿌리가 가늘어, 사람과 배움의 도움을 받아야 힘이 제대로 나네.', '뿌리 없음': '땅에 뿌리를 내리지 못한 형국이라, 고집보다 주변 흐름을 타는 것이 지혜일세.' })[a.roots.level];
    return {
      say: [`자네는 **${dm.title.split(' · ')[0]}**, ${dm.image} 같은 사람일세.`, `옛 책 『적천수』에 "${dm.classic}"이라 했지. ${dm.classicKo}는 뜻이네.`, ilju ? `일주는 **${a.dayPillar}**, 「${ilju[0]}」일세. ${ilju[1].split('. ')[0].replace(/\.$/, '')}.` : ''].filter(Boolean),
      html: `
        <div class="dm-head el-bg-${a.dmEl}"><div class="dm-hanja">${a.dmH}</div><div><h3>${dm.title}</h3><p class="classic">「${dm.classic}」<br><span>${dm.classicKo}. — 『적천수』 천간론</span></p></div></div>
        <p>${dm.nature}</p>
        <div class="grid2">
          <div class="mini"><h4>빛나는 점</h4><ul>${dm.strengths.map(x => `<li>${x}</li>`).join('')}</ul></div>
          <div class="mini"><h4>그림자</h4><ul>${dm.shadows.map(x => `<li>${x}</li>`).join('')}</ul></div>
        </div>
        <h4>일주 ${dp.stem}${dp.branch}(${dp.stemH}${dp.branchH}) — 나의 속마음과 배우자 자리</h4>
        <p>일간 ${dp.stem}${j(S.stemEl(dp.stem), '이가')} 깔고 앉은 땅은 ${dp.branch}(${dp.branchEl})이고, 그 자리는 <b>${dp.branchTG}</b>의 기운이네. ${K.TG[dp.branchTG].core}</p>
        <p>일지의 12운성은 <b>${dp.stage}</b>(${stage.e}) — ${stage.d}</p>
        ${special.map(x => `<p>${x}</p>`).join('')}
        ${ilju ? `<h4>일주론 — ${a.dayPillar}일주 「${ilju[0]}」</h4><p>${ilju[1]}</p>
        <div class="grid2"><div class="mini"><h4>💞 연애·배우자</h4><p>${ilju[2]}</p></div><div class="mini"><h4>💼 일·재능</h4><p>${ilju[3]}</p></div></div>
        <p class="muted">⚠️ ${ilju[4]}</p>` : ''}
        <h4>일간의 뿌리 — ${a.roots.level}</h4>
        <p>${rootText}</p>
        <h4>격국 — ${a.yongsin.jong ? a.yongsin.jong + ' (원래 틀은 ' + a.gyeok.name + ')' : a.gyeok.name}</h4>
        <p>${g} 월지 ${a.pillars.month.branch}에서 드러난 <b>${a.gyeok.tg}</b>의 기운이 사주의 큰 틀을 이루네.</p>
        <p class="advice">“${dm.advice}”</p>`,
    };
  }

  /* ── 2. 오행과 강약 ── */
  function elementSection(a) {
    const fm = favMap(a);
    const pct = a.power.pct, cnt = a.power.count;
    const max = Math.max(...Object.values(pct));
    const bars = S.ELEMENTS.map(e => `
      <div class="ebar"><span class="lab el-t-${e}">${e}<small>${EL_H[e]}</small></span>
        <div class="track"><div class="fill el-bg-${e}" style="width:${(pct[e] / max * 100).toFixed(1)}%"></div></div>
        <span class="num">${cnt[e]}개 · ${pct[e]}%</span><span class="fav fav${fm[e]}">${FAV_NAME[fm[e]]}</span></div>`).join('');
    const sorted = S.ELEMENTS.slice().sort((x, y) => pct[y] - pct[x]);
    const strong = sorted[0], weak = sorted[4];
    const missing = S.ELEMENTS.filter(e => cnt[e] === 0);
    const st = a.strength;
    const lvPos = [10, 30, 50, 70, 90][st.level];
    const y = a.yongsin;
    const elOver = pct[strong] >= 30 ? `<p><b class="el-t-${strong}">${K.EL[strong].name}</b> 기운이 가장 강하네(${pct[strong]}%). ${K.EL[strong].excess}</p>` : '';
    const elLack = missing.length ? `<p>사주에 ${missing.map(e => `<b class="el-t-${e}">${K.EL[e].name}</b>`).join('·')} 기운이 하나도 없네. ${missing.map(e => K.EL[e].lack).join(' ')}</p>`
      : `<p>가장 약한 기운은 <b class="el-t-${weak}">${K.EL[weak].name}</b>일세(${pct[weak]}%). ${K.EL[weak].lack}</p>`;
    const ye = K.EL[y.el];
    return {
      fm,
      say: [`오행을 저울에 달아 보니 **${strong}** 기운이 가장 무겁고 **${weak}** 기운이 가장 가볍구먼.`, `일간의 힘은 **${st.name}**, 자네에게 반가운 기운(용신)은 **${y.el}(${EL_H[y.el]})**일세.`],
      html: `
        <div class="ebars">${bars}</div>
        <p class="muted small">개수는 여덟 글자(시를 모르면 여섯 글자)의 겉 오행, 퍼센트는 지장간과 자리의 무게(월지가 가장 무겁다)까지 따진 세력이에요.</p>
        ${elOver}${elLack}
        <h4>일간의 힘 — ${st.name}</h4>
        <div class="gauge"><div class="gscale"><span>극신약</span><span>신약</span><span>중화</span><span>신강</span><span>극신강</span></div><div class="gtrack"><div class="gdot" style="left:${lvPos}%"></div></div></div>
        <p>${K.STRENGTH[st.name]}</p>
        <p class="muted small">판단 근거: 월지에서 힘을 ${st.deukryeong ? '얻었고(득령)' : '얻지 못했고(실령)'}, 일지에서 ${st.deukji ? '뿌리를 얻었네(득지)' : '뿌리가 약하네(실지)'}. 월지에서의 12운성은 ${st.monthStage}. 나를 돕는 기운의 비율 ${Math.round(st.ratio * 100)}%.</p>
        <h4>용신 — 자네에게 약이 되는 기운</h4>
        <div class="yong">
          <div class="ybox el-bg-${y.el}"><small>용신</small><b>${y.el}</b><span>${EL_H[y.el]}</span></div>
          <div class="ybox el-bg-${y.huisin} soft"><small>희신</small><b>${y.huisin}</b><span>${EL_H[y.huisin]}</span></div>
          <div class="ybox el-bg-${y.gisin} soft dim"><small>기신</small><b>${y.gisin}</b><span>${EL_H[y.gisin]}</span></div>
        </div>
        ${y.jong ? `<p class="jong">🔱 <b>${y.jong}</b> — ${y.reason}.</p>` : `<p><b>${y.group}(${y.el})</b>${pj(y.el, '을를')} 용신으로 잡았네 <span class="tag">${y.method}</span></p>
        <ul class="tips"><li><b>억부</b> — ${y.eok.reason} → ${y.eok.el}</li><li><b>조후</b> — ${y.johu.why} → ${y.johu.el}</li>${y.urgent ? `<li><b>조후위급(調候爲急)</b> — ${['해', '자', '축'].includes(a.pillars.month.branch) ? '한겨울인데 불이 하나도 없으니 볕이 무엇보다 급하네' : '한여름인데 물이 하나도 없으니 물이 무엇보다 급하네'}</li>` : ''}${y.tong ? `<li><b>통관</b> — ${j(y.tong.a, '과와')} ${j(y.tong.b, '이가')} 크게 맞서니 ${y.tong.el}${pj(y.tong.el, '으로')} 다리를 놓는 길도 있네 → ${y.tong.el}</li>` : ''}<li><b>결론</b> — 이를 함께 저울질해 ${y.el}(${EL_H[y.el]})${pj(y.el, '을를')} 용신으로 잡았네.</li></ul>`}
        <div class="johu-box"><h4>『궁통보감』의 조후 — ${a.johu.season}의 ${a.dm}${a.dmEl}</h4>
          <div class="johu-stems">${a.johu.items.map(x => `<div class="js ${x.shown ? 'shown' : x.hidden ? 'hid' : 'none'}"><b>${x.stemH}</b><small>${x.stem} · ${x.tg}</small><em>${x.shown ? '천간에 있음' : x.hidden ? '지장간에 숨음' : '없음'}</em></div>`).join('')}</div>
          <p>${a.johu.items.slice(0, 2).map(x => `${x.stemH}(${x.stem})${pj(x.stem, '은는')} ${XS().johuRole(a.dm, x.stem, a.pillars.month.branch)}`).join(', ')}는 뜻이네. ${mulsang(a).judge}</p></div>
        <h4>기운을 북돋는 생활 비법 (개운법)</h4>
        <ul class="tips">
          <li>행운의 색: <b>${ye.color}</b> · 방향: <b>${ye.dir}</b> · 숫자: <b>${ye.num}</b> · 계절: ${ye.season}</li>
          <li>생활 습관: ${ye.boost}</li>
          <li>피하면 좋은 것: ${K.EL[y.gisin].name} 기운이 과한 환경(${K.EL[y.gisin].color} 일색, ${K.EL[y.gisin].dir} 쪽으로만 치우친 동선)</li>
        </ul>
        <p class="muted small">용신은 학파마다 보는 법이 달라요. 여기서는 일간의 강약을 맞추는 억부(抑扶), 『궁통보감』의 계절별 조후(調候), 두 기운이 맞설 때의 통관(通關)을 함께 저울질하고, 한쪽으로 크게 치우친 사주는 종격(從格)으로 봐요.</p>`,
    };
  }

  /* ── 3. 십성 ── */
  function tenGodSection(a) {
    const gc = a.groupCount, gp = a.groupPower;
    const total = Object.values(gp).reduce((x, y) => x + y, 0);
    const order = S.GROUPS.slice().sort((x, y) => gp[y] - gp[x]);
    const meaning = { 비겁: '나·형제·동료·자존심', 식상: '재능·표현·자녀(여)·먹을복', 재성: '재물·아버지·아내(남)·현실', 관성: '직장·명예·규칙·남편(여)', 인성: '학문·어머니·문서·인덕' };
    const rows = S.GROUPS.map(g => {
      const p = Math.round(gp[g] / total * 100);
      const members = S.TEN_GODS.filter(t => S.GROUP_OF[t] === g).map(t => `${t} ${a.tgCount[t]}`).join(' · ');
      return `<div class="tgrow"><b>${g}</b><div class="track"><div class="fill tg-${g}" style="width:${Math.max(2, p)}%"></div></div><span>${p}%</span><small>${members} — ${meaning[g]}</small></div>`;
    }).join('');
    const top = order[0], second = order[1];
    const topTG = S.TEN_GODS.filter(t => S.GROUP_OF[t] === top).sort((x, y) => a.tgCount[y] - a.tgCount[x])[0];
    const secTG = S.TEN_GODS.filter(t => S.GROUP_OF[t] === second).sort((x, y) => a.tgCount[y] - a.tgCount[x])[0];
    const missing = S.GROUPS.filter(g => gc[g] === 0);
    const combos = [];
    if (gp.식상 > 1.6 && gp.재성 > 1.6) combos.push('<b>식상생재</b> — 재주가 돈으로 이어지는 구조일세. 기술·콘텐츠·장사로 버는 힘이 있어.');
    if (gp.관성 > 1.6 && gp.인성 > 1.6) combos.push('<b>관인상생</b> — 직장과 명예가 배움과 이어지는 구조일세. 조직에서 차근차근 오르는 힘이 있지.');
    if (gp.식상 > 2.2 && gp.관성 > 1.2 && a.tgCount.상관 >= 1 && a.tgCount.정관 >= 1) combos.push('<b>상관견관</b>의 기미가 있네. 윗사람이나 규칙과 부딪히기 쉬우니 말을 아끼는 지혜가 필요해.');
    if (gp.재성 > 2.6 && a.strength.level <= 1) combos.push('<b>재다신약</b> — 재물은 눈앞에 많은데 쥘 힘이 부족한 형국일세. 욕심을 줄이고 실력을 먼저 키우게.');
    if (gp.비겁 > 3 && gp.재성 > 0.5) combos.push('<b>군비쟁재</b>의 기미 — 형제·동료가 많아 재물을 나누게 되기 쉽네. 동업·보증은 조심하게.');
    if (gp.인성 > 3.2 && gp.식상 < 0.8) combos.push('<b>인성 과다</b> — 생각과 공부는 깊은데 실행이 늦어지기 쉽네. 배운 것을 바로 써먹는 연습을 하게.');
    if (a.gender === 'female' && a.tgCount.정관 >= 1 && a.tgCount.편관 >= 1) combos.push('<b>관살혼잡</b> — 정관과 편관이 함께 있어 이성 인연이 다채롭고 선택에 고민이 많을 수 있네.');
    if (a.gender === 'male' && a.tgCount.정재 >= 1 && a.tgCount.편재 >= 1) combos.push('<b>정편재 혼잡</b> — 재물과 이성 인연이 여러 갈래로 들어오니 마음을 한곳에 두는 게 중요해.');
    const ar = archetypeOf(a), ht = hiddenTalents(a);
    return {
      say: [`십성으로 보면 **${top}**과 **${second}**이 자네 삶의 두 기둥이구먼. 한마디로 **${ar.name}**일세!`, missing.length ? `${missing.join('·')}은 비어 있으니, 그 몫은 운과 사람으로 채워야 하네.` : '다섯 가지 십성이 고루 들어 있어 쓰임새가 넓은 사주일세.'],
      html: `
        <div class="arche"><small>사주 유형 · ${ar.g1}+${ar.g2}</small><b>${ar.name}</b><p>${ar.desc}</p><span class="muted small">닮은 일 · ${ar.jobs}</span></div>
        <div class="tgrows">${rows}</div>
        <h4>가장 두드러진 기운 — ${topTG}</h4><p>${K.TG[topTG].strong}</p>
        <h4>두 번째 기운 — ${secTG}</h4><p>${K.TG[secTG].strong}</p>
        ${missing.length ? `<h4>비어 있는 자리</h4>${missing.map(g => { const t = S.TEN_GODS.find(x => S.GROUP_OF[x] === g && x.startsWith('정')) || S.TEN_GODS.find(x => S.GROUP_OF[x] === g); return `<p><b>${g}</b> — ${K.TG[t].none}</p>`; }).join('')}` : ''}
        ${combos.length ? `<h4>십성의 짜임</h4>${combos.map(x => `<p>${x}</p>`).join('')}` : ''}
        ${ht.length ? `<h4>지장간에 숨은 재능</h4>${ht.map(h => `<p><b>${h.g}</b> — ${h.t}. 천간엔 드러나지 않았지만 땅속에 품고 있어, 운에서 ${h.g}${pj(h.g, '이가')} 들어올 때 비로소 꽃피네.</p>`).join('')}` : ''}`,
    };
  }

  /* ── 4. 신살과 관계 ── */
  function sinsalSection(a) {
    const where = w => w.map(k => `${POSNAME[k]}`).join('·');
    const ss = a.sinsal.map(s => {
      const k = K.SINSAL[s.name];
      return `<div class="ss ss${k.good}"><span class="ic">${k.icon}</span><div><b>${s.name}</b> <span class="muted small">${where(s.where)}</span><p>${k.d}</p></div></div>`;
    }).join('');
    const rel = a.relations.map(r => {
      const base = K.REL[r.type] || '';
      let pos = '';
      if (r.a && r.b) pos = `${POSNAME[r.a]}(${a.pillars[r.a].palace.split('·')[0]})와 ${POSNAME[r.b]}(${a.pillars[r.b].palace.split('·')[0]}) 사이`;
      const sub = r.sub ? ` · ${K.HYUNG_SUB[r.sub]}` : '';
      const el = r.el ? ` → ${r.el}(${EL_H[r.el]})` : '';
      let extra = '';
      if (r.type === '충' && (r.a === 'day' || r.b === 'day')) extra = ' 일지가 흔들리니 배우자·거처의 변화를 겪기 쉽고, 마음이 늘 어딘가로 움직이네.';
      if (r.type === '충' && (r.a === 'year' || r.b === 'year') && (r.a === 'month' || r.b === 'month')) extra = ' 년월이 부딪히니 일찍 고향이나 부모 곁을 떠나 자립하기 쉽네.';
      if ((r.type === '육합' || r.type === '천간합') && (r.a === 'day' || r.b === 'day')) extra = ' 나와 합을 이루니 그 자리의 인연(사람·일)과 정이 깊네.';
      return `<div class="rel"><b>${r.chars} ${r.type}</b><span class="muted small">${pos}${sub}${el}</span><p>${base}${extra}</p></div>`;
    }).join('');
    const goods = a.sinsal.filter(s => K.SINSAL[s.name].good > 0).map(s => s.name);
    const notable = a.sinsal.filter(s => ['도화살', '역마살', '화개살', '괴강살', '양인살', '백호살', '홍염살'].includes(s.name)).map(s => s.name);
    return {
      say: [goods.length ? `오호, **${goods[0]}**이 들었구먼! ${goods[0] === '천을귀인' ? '어려울 때 반드시 돕는 사람이 나타나는 복이야.' : '복된 별일세.'}` : '귀인성은 드러나지 않았지만, 그만큼 스스로 일군 것이 온전히 자네 것이 되는 사주일세.', notable.length ? `그리고 **${notable.slice(0, 2).join('**과 **')}**이 보이네. 살(煞)이라고 겁먹을 것 없어. 쓰기에 따라 칼도 되고 보물도 되지.` : '거친 살은 크게 보이지 않으니 순탄한 편이구먼.'],
      html: `
        <h4>신살</h4>
        ${ss || '<p class="muted">두드러진 신살이 없어요.</p>'}
        <p class="muted small">신살은 사주 전체의 짜임 위에서 보조로 참고하는 표지예요. 같은 살도 용신이냐 기신이냐에 따라 복이 되기도, 짐이 되기도 해요.</p>
        <h4>합·충·형·파·해 — 기둥끼리의 관계</h4>
        ${rel || '<p class="muted">기둥끼리 크게 부딪히거나 묶인 곳이 없어 비교적 고요한 사주예요.</p>'}`,
    };
  }

  /* ── 5. 분야별 풀이 ── */
  function areaSection(a, fm) {
    const gp = a.groupPower, tc = a.tgCount, dm = K.DM[a.dm];
    const has = n => a.sinsal.some(s => s.name === n);
    const lv = a.strength.level;
    // 재물
    let money = [];
    if (gp.재성 < 0.6) money.push('사주에 재성이 약해, 돈을 좇기보다 실력과 명예를 쌓으면 돈이 뒤따라오는 구조일세. 큰 투기보다 전문성으로 받는 보수가 맞아.');
    else if (lv <= 1 && gp.재성 > 2.2) money.push('재물은 눈앞에 많은데 쥘 힘이 모자란 형국이네. 동료나 공부(비겁·인성)로 힘을 기른 뒤에 움켜쥐어야 새지 않아.');
    else if (lv >= 3 && gp.재성 > 1.2) money.push('일간이 튼튼하고 재성도 갖춰, 재물을 감당할 그릇이 있는 사주일세. 스스로 벌고 굴리는 힘이 있어.');
    else money.push('재물과 일간의 힘이 엇비슷하니, 무리하지 않으면 꾸준히 모이는 재물운일세.');
    if (tc.편재 > tc.정재) money.push('편재가 정재보다 강하니 월급보다는 사업·투자·부업처럼 움직이는 돈과 인연이 깊네. 들쭉날쭉한 만큼 비상금을 꼭 두게.');
    else if (tc.정재 > 0) money.push('정재가 자리를 잡아 성실하게 모으는 재물복이 있네. 적금과 내 집 마련처럼 차곡차곡 쌓는 방식이 맞아.');
    if (gp.식상 > 1.6 && gp.재성 > 0.8) money.push('식상이 재성을 생하니 재능과 기술이 곧 돈일세. 내 손으로 만든 것을 파는 일에 운이 따르네.');
    if (gp.비겁 > 2.8) money.push('비겁이 많아 돈이 사람을 따라 나가기 쉽네. 동업·보증·돈 빌려주기는 신중하게.');
    // 직업
    const strongestTG = S.TEN_GODS.slice().sort((x, y) => tc[y] - tc[x])[0];
    const jobs = new Set([...K.TG[strongestTG].jobs.split(', '), ...K.TG[a.gyeok.tg].jobs.split(', ')]);
    let work = [`격국은 ${a.gyeok.name}, 가장 많은 십성은 ${strongestTG}일세. ${dm.work}`];
    if (has('역마살')) work.push('역마가 있어 출장·해외·이동이 많은 일에서 오히려 기운이 살아나네.');
    if (has('화개살')) work.push('화개가 있어 예술·종교·철학·연구처럼 깊이 파고드는 분야에 재능이 있어.');
    if (has('문창귀인')) work.push('문창귀인이 있으니 글·강의·기획처럼 머리를 쓰는 일에 복이 있네.');
    if (has('도화살') || has('홍염살')) work.push('도화·홍염의 매력이 있어 사람 앞에 서는 일(방송·서비스·영업·뷰티)에서 빛을 보네.');
    if (has('양인살') || has('괴강살') || has('백호살')) work.push('강한 살을 품었으니 의료·법·군경·기술처럼 날카로운 칼을 쓰는 직업에서 그 기운이 복으로 바뀌네.');
    // 연애·결혼
    const dp = a.pillars.day;
    const spouseGroup = a.gender === 'male' ? '재성' : '관성';
    const spouseEl = S.elementOfGroup(a.dmEl, spouseGroup);
    let love = [dm.love, K.SPOUSE[dp.branchTG]];
    if (gp[spouseGroup] < 0.5) love.push(`${a.gender === 'male' ? '남자에게 아내를 뜻하는 재성' : '여자에게 남편을 뜻하는 관성'}이 약하니, 인연을 기다리기보다 직접 찾아 나서야 하네. 늦게 만나는 인연이 더 단단할 수 있어.`);
    else if (gp[spouseGroup] > 2.6) love.push(`${a.gender === 'male' ? '재성' : '관성'}이 많아 이성 인연이 풍성하네. 많은 만큼 고르는 눈이 중요해.`);
    else love.push(`배우자를 뜻하는 ${spouseGroup}(${spouseEl}) 기운이 알맞게 있어 인연이 자연스레 찾아오는 편이네.`);
    const dayClash = a.relations.filter(r => (r.a === 'day' || r.b === 'day') && ['충', '형'].includes(r.type));
    if (dayClash.length) love.push('일지가 다른 기둥과 부딪혀(충·형) 연애가 극적이거나 변화가 많을 수 있네. 결혼은 서두르지 말고 서로를 충분히 겪어 본 뒤에 하게.');
    if (has('도화살')) love.push('도화가 있어 이성에게 인기가 많네. 매력은 자산이지만 오해를 살 행동은 조심하게.');
    if (has('원진살')) love.push('원진이 있어 가까운 사이에 까닭 없는 서운함이 쌓이기 쉬우니, 감정은 그날그날 풀게.');
    // 건강
    const pct = a.power.pct;
    const sorted = S.ELEMENTS.slice().sort((x, y) => pct[x] - pct[y]);
    const weakE = sorted[0], strongE = sorted[4];
    let health = [`가장 약한 ${K.EL[weakE].name} 기운은 ${K.EL[weakE].organs}과 이어지고, 가장 강한 ${K.EL[strongE].name} 기운은 ${K.EL[strongE].organs}에 부담을 주기 쉽다고 봤네. 이 부위를 평소에 아껴 쓰게.`];
    if (has('백호살') || has('양인살')) health.push('강한 살이 있으니 운전·운동 중 부상과 수술수를 조심하고, 정기 검진을 거르지 말게.');
    if (has('귀문관살')) health.push('신경이 예민한 편이니 잠과 휴식을 잘 챙기게.');
    health.push('<span class="muted small">※ 전통 오행 의학의 상징적 연결일 뿐, 실제 건강 문제는 반드시 의료 전문가와 상의하세요.</span>');
    // 학업·인간관계
    let study = [];
    if (gp.인성 > 1.6) study.push('인성이 넉넉해 배움을 좋아하고 시험·자격증 운이 좋은 편이네.');
    else study.push('인성이 약해 오래 앉아 외우는 공부보다 직접 해 보며 익히는 공부가 맞아.');
    if (has('문창귀인')) study.push('문창귀인이 있어 총명하고 글재주가 있네.');
    if (gp.식상 > 1.6) study.push('식상이 있어 배운 것을 말과 글로 풀어내는 데 강하니, 가르치면서 배우는 게 최고일세.');
    let people = [];
    if (gp.비겁 > 2.2) people.push('비겁이 강해 친구와 동료가 많고 의리가 있네. 다만 내 편 네 편을 너무 가르지 말게.');
    else if (gp.비겁 < 0.6) people.push('비겁이 약해 무리 짓기보다 소수와 깊게 사귀는 편이네.');
    if (has('천을귀인')) people.push('천을귀인이 있어 위기 때 돕는 귀인이 꼭 나타나지. 평소 베푼 인연을 소중히 하게.');
    if (!people.length) people.push('사람과의 거리를 적당히 지키는 균형 잡힌 관계운일세.');
    const block = (t, arr) => `<div class="area"><h4>${t}</h4>${arr.map(x => `<p>${x}</p>`).join('')}</div>`;
    const ny = S.kstNow().y, evs = yearEvents(a, fm, ny, ny + 9);
    const yl = k => evs.filter(e => e[k]).map(e => `${e.y}`).slice(0, 5);
    const timing = [
      yl('love').length ? `💞 인연의 기운이 강하게 드는 해: <b>${yl('love').join('·')}년</b> — ${a.gender === 'male' ? '재성' : '관성'}이나 일지와 합하는 기운, 도화가 들어오는 해일세.` : '💞 앞으로 10년 안엔 인연의 별이 크게 드러나지 않으니, 사람이 모이는 곳에 스스로 나서게.',
      yl('money').length ? `💰 재물이 움직이는 해: <b>${yl('money').join('·')}년</b>` : '',
      yl('job').length ? `💼 자리·시험·문서의 해: <b>${yl('job').join('·')}년</b>` : '',
      yl('move').length ? `🧳 이동·변화가 큰 해: <b>${yl('move').join('·')}년</b> — 이사·이직·여행이 잦을 수 있네.` : '',
      yl('caution').length ? `⚠️ 몸과 일을 아껴야 할 해: <b>${yl('caution').join('·')}년</b>` : '',
    ].filter(Boolean);
    return {
      say: ['자, 이제 살림살이 얘기를 해 보세. **재물·직업·연애·건강**을 차례로 짚어 주지.'],
      html: block('💰 재물운', money) + block('💼 직업·적성', work.concat([`<span class="tag-list">${[...jobs].map(x => `<span class="tag">${x}</span>`).join('')}</span>`])) + block('💞 연애·결혼', love) + block('🩺 건강', health) + block('📖 학업·시험', study) + block('🤝 인간관계', people) + block(`📅 때를 짚어 보면 (${ny}~${ny + 9}년)`, timing),
    };
  }

  /* ── 6. 대운 ── */
  function daeunSection(a, fm) {
    if (!a.daeun) return { say: ['성별을 알아야 대운의 방향을 정할 수 있네.'], html: '<p>성별 정보가 없어요.</p>' };
    const d = a.daeun;
    const cards = d.list.slice(0, 9).map((x, i) => {
      const sc = pillarScore(a, fm, x);
      const [lab, cls] = flowLabel(sc);
      return `<button class="dcard ${cls}${i === d.current ? ' now' : ''}" data-i="${i}"><small>만 ${x.age}세~</small><b class="el-t-${x.stemEl}">${S.STEMS_H[S.si(x.stem)]}</b><b class="el-t-${x.branchEl}">${S.BRANCHES_H[S.bi(x.branch)]}</b><span>${x.stem}${x.branch}</span><em>${lab}</em>${i === d.current ? '<i>지금</i>' : ''}</button>`;
    }).join('');
    const detail = i => {
      const x = d.list[i];
      const sc = pillarScore(a, fm, x);
      const [lab] = flowLabel(sc);
      const rel = [];
      for (const k of ['day', 'month', 'year']) {
        if (!a.pillars[k]) continue;
        for (const r of S.branchRelations(x.branch, a.pillars[k].branch)) if (['충', '육합', '삼합', '형'].includes(r.type)) rel.push(`${x.branch}${a.pillars[k].branch} ${r.type}(${POSNAME[k]})`);
      }
      return `<h4>만 ${x.age}세 ~ ${x.age + 9}세 · ${x.stem}${x.branch}(${x.hanja}) 대운 <span class="flow">${lab}</span></h4>
        <p class="muted small">${x.fromYear}년 ${x.fromMonth}월경부터 · 천간 ${x.stem}(${x.stemEl}, ${FAV_NAME[fm[x.stemEl]]}) / 지지 ${x.branch}(${x.branchEl}, ${FAV_NAME[fm[x.branchEl]]}) · 12운성 ${x.stage}</p>
        <p><b>앞 5년 — ${x.stemTG}</b>: ${K.TG[x.stemTG].luck}</p>
        <p><b>뒤 5년 — ${x.branchTG}</b>: ${K.TG[x.branchTG].luck}</p>
        <p>이 시기 일간의 기운은 <b>${x.stage}</b>(${K.STAGE[x.stage].e})의 자리에 있네. ${K.STAGE[x.stage].d}</p>
        ${rel.length ? `<p>원국과의 관계: ${rel.join(', ')} — ${rel.some(r => r.includes('충')) ? '자리가 흔들리니 이사·이직·관계의 변화가 따르기 쉽네.' : '묶이고 합하니 사람과 일이 모여드는 때일세.'}</p>` : ''}`;
    };
    const cur = d.current >= 0 ? d.list[d.current] : null;
    return {
      detail,
      say: cur ? [`지금 자네는 **${cur.stem}${cur.branch} 대운**을 지나고 있구먼. ${flowLabel(pillarScore(a, fm, cur))[0]}이야.`, '대운은 10년마다 바뀌는 인생의 계절이지. 카드를 눌러 각 시기를 보게.'] : ['아직 첫 대운이 오기 전이구먼. 카드를 눌러 앞날의 계절을 미리 보게.'],
      html: `<p>대운은 태어난 달의 기둥에서 ${d.forward ? '앞으로(순행)' : '거꾸로(역행)'} 흘러가는 10년 단위의 큰 운이에요. 출생부터 ${d.forward ? '다음' : '이전'} 절기까지의 날수를 3으로 나눠 <b>${d.startYears}년 ${d.startMonths}개월</b>째에 첫 대운이 시작돼요.</p>
        <h4>인생 운의 흐름</h4>${lifeGraph(a, fm)}
        <div class="dcards">${cards}</div><div class="ddetail">${detail(Math.max(0, d.current))}</div>`,
    };
  }

  /* ── 7. 올해·내년 ── */
  const SAMJAE = { 해: '사오미', 묘: '사오미', 미: '사오미', 인: '신유술', 오: '신유술', 술: '신유술', 사: '해자축', 유: '해자축', 축: '해자축', 신: '인묘진', 자: '인묘진', 진: '인묘진' };
  function seunText(a, fm, s) {
    const out = [];
    const sc = pillarScore(a, fm, s);
    const [lab] = flowLabel(sc);
    out.push(`<p>${s.year}년 <b>${s.stem}${s.branch}(${s.hanja})년</b>은 자네에게 천간으로 <b>${s.stemTG}</b>, 지지로 <b>${s.branchTG}</b>의 해일세. 전체로는 <b>${lab}</b>이야.</p>`);
    out.push(`<p>${K.TG[s.stemTG].luck}</p>`);
    if (s.branchTG !== s.stemTG) out.push(`<p>${K.TG[s.branchTG].luck}</p>`);
    out.push(`<p>이 해 일간의 기운은 <b>${s.stage}</b>(${K.STAGE[s.stage].e}) — ${K.STAGE[s.stage].d}</p>`);
    const rels = s.relations.filter(r => !['귀문'].includes(r.type));
    const lines = [];
    for (const r of rels) {
      const pal = a.pillars[r.with].palace;
      if (r.type === '충') lines.push(`${s.branch}${a.pillars[r.with].branch} 충이 ${POSNAME[r.with]}(${pal})${pj(POSNAME[r.with], '을를')} 흔드네 → ${r.with === 'day' ? '배우자·거처·건강에 변동수' : r.with === 'month' ? '직장·사회적 자리의 이동수' : r.with === 'year' ? '집안 어른·고향 쪽의 변화' : '자녀·아랫사람·계획의 변화'}.`);
      else if (r.type === '육합' || r.type === '삼합') lines.push(`${s.branch}${a.pillars[r.with].branch} ${r.type}으로 ${POSNAME[r.with]}(${pal})${pj(POSNAME[r.with], '과와')} 손을 잡네 → 그 자리의 인연이 가까워지고 일이 모이지.`);
      else if (r.type === '형') lines.push(`${s.branch}${a.pillars[r.with].branch} 형이 ${POSNAME[r.with]}에 걸리네 → 다툼·서류·건강을 꼼꼼히 챙기게.`);
      else if (r.type === '원진') lines.push(`${s.branch}${a.pillars[r.with].branch} 원진 → 가까운 사람과 까닭 없는 서운함을 조심하게.`);
      else if (r.type === '천간합') lines.push(`천간 ${s.stem}${j(a.pillars[r.with].stem, '이가')} 합하네 → ${r.with === 'day' ? '나를 끌어당기는 인연(이성·제안)이 들어오지.' : '그 자리 사람과 손잡을 일이 생기지.'}`);
      else if (r.type === '천간충') lines.push(`천간 ${s.stem}${j(a.pillars[r.with].stem, '과와')} 부딪치네 → 생각의 충돌, 갑작스런 결정에 주의.`);
    }
    if (lines.length) out.push(`<ul class="tips">${[...new Set(lines)].map(x => `<li>${x}</li>`).join('')}</ul>`);
    // 분야별
    const tgs = [s.stemTG, s.branchTG];
    const g = tgs.map(t => S.GROUP_OF[t]);
    const area = [];
    if (g.includes('재성') || g.includes('식상')) area.push(['재물', '돈이 움직이는 해. ' + (a.strength.level >= 2 ? '버는 만큼 잡을 힘이 있으니 적극적으로 기회를 잡게.' : '들어오는 만큼 나가기도 쉬우니 지출 계획부터 세우게.')]);
    else if (g.includes('비겁')) area.push(['재물', '나가는 돈이 많아지는 해. 보증·동업·충동구매를 피하고 지키는 데 집중하게.']);
    else area.push(['재물', '큰 재물 변화보다는 기반을 다지는 해. 공부와 자격이 훗날 돈이 되네.']);
    if (g.includes('관성')) area.push(['직장', '책임과 자리가 커지는 해. 승진·이직·합격의 기회지만 과로를 조심하게.']);
    else if (g.includes('인성')) area.push(['직장', '윗사람의 도움과 문서운이 있는 해. 자격증·계약·부동산 서류에 좋아.']);
    else if (g.includes('식상')) area.push(['직장', '새로운 일을 벌이고 싶은 해. 아이디어를 실행하되 윗사람과의 마찰은 조심하게.']);
    else area.push(['직장', '동료와 경쟁 속에서 실력을 보여 주는 해. 협력하면 판이 커지네.']);
    const loveG = a.gender === 'male' ? '재성' : '관성';
    if (g.includes(loveG)) area.push(['연애', '이성 인연이 들어오는 해일세. 혼자라면 소개와 모임에 나가 보고, 짝이 있다면 결혼 이야기가 나올 수 있어.']);
    else if (s.relations.some(r => r.with === 'day' && r.type === '충')) area.push(['연애', '배우자 자리가 흔들리는 해. 다툼이 생기면 하룻밤 묵혀서 말하게.']);
    else area.push(['연애', '잔잔한 해. 새 인연보다는 지금의 관계를 다독이기 좋아.']);
    const gisinHit = s.stemEl === a.yongsin.gisin || s.branchEl === a.yongsin.gisin;
    area.push(['건강', gisinHit ? `기신인 ${a.yongsin.gisin} 기운이 들어오니 ${K.EL[a.yongsin.gisin].organs} 쪽 피로를 조심하게.` : '큰 무리가 없는 해. 규칙적인 생활로 리듬만 지키면 되네.']);
    out.push(`<div class="grid2">${area.map(([t, x]) => `<div class="mini"><h4>${t}</h4><p>${x}</p></div>`).join('')}</div>`);
    // 삼재
    const sj = SAMJAE[a.yearBranch];
    const k = sj.indexOf(s.branch);
    if (k >= 0) out.push(`<p class="samjae">⚠️ ${a.animal}띠에게 ${s.year}년은 <b>${['들삼재', '눌삼재', '날삼재'][k]}</b>일세. ${['삼재가 들어오는 해라 새 일은 신중히.', '삼재가 머무는 해라 무리한 확장을 피하게.', '삼재가 나가는 해라 마무리를 잘하면 복삼재가 되지.'][k]} 다만 사주 전체의 운이 좋으면 삼재도 크게 걱정할 것 없네.</p>`);
    return { html: out.join(''), score: sc, label: lab };
  }
  function monthTable(a, fm, year) {
    const ms = S.monthsOfYear(year);
    const rows = ms.map(m => {
      const p = S.describePillar(a.dm, { stem: m.stem, branch: m.branch });
      const sc = pillarScore(a, fm, p);
      const [lab, cls] = flowLabel(sc);
      const from = new Date(m.from.getTime() + 9 * 3600e3);
      const word = {
        비견: '동료와 함께 힘을 모으기', 겁재: '지출과 경쟁 조심', 식신: '즐겁게 재능 펼치기', 상관: '말조심, 아이디어는 메모', 편재: '돈 흐름이 활발', 정재: '알뜰하게 챙기면 남는 달',
        편관: '압박 속 돌파, 건강 주의', 정관: '인정과 승진의 기운', 편인: '공부·영감, 계획 변경 주의', 정인: '도움과 문서운',
      }[p.stemTG];
      return `<tr class="${cls}"><td>${from.getUTCMonth() + 1}/${from.getUTCDate()}~<br><small>${m.term}</small></td><td><b>${m.stem}${m.branch}</b><br><small>${p.stemTG}·${p.branchTG}</small></td><td><span class="flow">${lab}</span><br><small>${word}</small></td></tr>`;
    }).join('');
    return `<table class="months"><thead><tr><th>절기 달</th><th>월 간지</th><th>흐름</th></tr></thead><tbody>${rows}</tbody></table>`;
  }
  function yearSection(a, fm) {
    const [s1, s2] = a.seun;
    const t1 = seunText(a, fm, s1), t2 = seunText(a, fm, s2);
    return {
      say: [`올해 ${s1.year}년 ${s1.stem}${s1.branch}년은 자네에게 **${t1.label}**, 내년 ${s2.year}년 ${s2.stem}${s2.branch}년은 **${t2.label}**일세.`, '해마다의 운(세운)은 대운이라는 계절 위에 부는 바람이라 생각하게.'],
      html: `<div class="seun"><h3>${s1.year}년 · ${s1.stem}${s1.branch}(${s1.hanja})년</h3>${t1.html}</div>
        <div class="seun"><h3>${s2.year}년 · ${s2.stem}${s2.branch}(${s2.hanja})년</h3>${t2.html}
        <h4>${s2.year}년 달마다의 흐름</h4><p class="muted small">사주의 달은 양력 1일이 아니라 절기(입춘·경칩…)에 바뀌어요.</p>${monthTable(a, fm, s2.year)}</div>
        <div class="seun"><h3>앞으로 10년</h3>${decadeChart(yearEvents(a, fm, s1.year, s1.year + 9))}</div>
        <div class="seun year-pick"><h3>궁금한 해 골라 보기</h3><p class="muted small">결혼·이사·개업처럼 마음에 둔 해가 있으면 넣어 보게.</p>
          <div class="inline"><input type="number" id="ypick" min="1930" max="2100" value="${s1.year + 2}" aria-label="볼 해"><button class="btn small primary" id="ygo">그해 운 보기</button></div><div id="yout"></div></div>`,
      bind(box, dlg) {
        const go = async () => {
          const y = Math.max(1930, Math.min(2100, +box.querySelector('#ypick').value || s1.year));
          const sy = seunFor(a, y), t = seunText(a, fm, sy);
          box.querySelector('#yout').innerHTML = `<div class="fade-in"><h4>${y}년 · ${sy.stem}${sy.branch}(${sy.hanja})년 <span class="flow">${t.label}</span></h4>${t.html}</div>`;
          if (dlg) dlg.quiet(`${y}년 ${sy.stem}${sy.branch}년이라… 자네에겐 **${t.label}**일세.`, { expr: 'think' });
        };
        box.querySelector('#ygo').onclick = go;
        box.querySelector('#ypick').onkeydown = e => { if (e.key === 'Enter') go(); };
      },
    };
  }

  /* ── 8. 마무리 ── */
  function closing(a, fm) {
    const dm = K.DM[a.dm];
    const cur = a.daeun && a.daeun.current >= 0 ? a.daeun.list[a.daeun.current] : null;
    const curLab = cur ? flowLabel(pillarScore(a, fm, cur))[0] : null;
    const ye = K.EL[a.yongsin.el];
    const lines = [
      `${a.input.name ? a.input.name + ' ' : ''}자네는 ${dm.image} 같은 ${a.dm}${a.dmEl} 일간에, ${a.strength.name}한 사주일세.`,
      cur ? `지금 지나는 ${cur.stem}${cur.branch} 대운은 ${curLab}이니, ${['great', 'good'].includes(flowLabel(pillarScore(a, fm, cur))[1]) ? '망설이던 일이 있다면 이 계절에 씨를 뿌리게.' : '서두르기보다 뿌리를 깊게 내리는 데 힘쓰게.'}` : '',
      `늘 ${ye.color} 빛을 곁에 두고, ${ye.boost.split(', ')[0]} 같은 습관으로 ${a.yongsin.el} 기운을 북돋게.`,
      dm.advice,
      '팔자는 정해진 길이 아니라 타고난 지도일세. 지도를 읽었으니 이제 걸음은 자네 몫이야. 허허.',
    ].filter(Boolean);
    return lines;
  }

  /* ── 묻고 답하기 ── */
  function answer(a, fm, topic) {
    const s1 = a.seun[0], s2 = a.seun[1];
    const has = n => a.sinsal.some(s => s.name === n);
    const gp = a.groupPower;
    switch (topic) {
      case 'love': {
        const ny = S.kstNow().y, ly = yearEvents(a, fm, ny, ny + 9).filter(e => e.love).map(e => e.y).slice(0, 4);
        if (ly.length) return [`자네의 인연을 뜻하는 별은 **${a.gender === 'male' ? '재성' : '관성'}**일세.`, `앞으로 10년 중 인연의 기운이 강하게 드는 해는 **${ly.join('·')}년**이야. 그해엔 소개와 모임을 마다하지 말게.`, a.sinsal.some(x => x.name === '도화살') ? '도화가 있으니 사람 많은 곳에 나가면 인연은 절로 따라오네.' : '배움의 모임이나 지인의 소개에서 인연을 찾게.'];
        const g = a.gender === 'male' ? '재성' : '관성';
        const el = S.elementOfGroup(a.dmEl, g);
        const yr = a.seun.find(s => [S.GROUP_OF[s.stemTG], S.GROUP_OF[s.branchTG]].includes(g));
        return [`자네의 인연을 뜻하는 별은 **${g}**, 오행으로는 **${el}(${EL_H[el]})**일세.`,
          yr ? `${yr.year}년에 그 별이 들어오니, 그해에 좋은 인연을 만날 가능성이 크네.` : `올해와 내년엔 ${g}이 직접 들어오진 않지만, 일지와 합하는 달에 인연의 문이 열리지.`,
          has('도화살') ? '도화가 있으니 사람 많은 곳에 나가면 인연은 절로 따라오네.' : '사람을 소개받는 자리, 배움의 모임에서 인연을 찾게.'];
      }
      case 'money': {
        const ny2 = S.kstNow().y, my = yearEvents(a, fm, ny2, ny2 + 9).filter(e => e.money).map(e => e.y).slice(0, 4);
        if (my.length) return [a.groupPower.재성 > 1.6 ? '재성이 넉넉한 사주라 재물과 인연이 깊네.' : '재성이 많지 않으니 재물은 실력의 그림자처럼 따라오는 것일세.', `앞으로 10년 중 재물이 크게 움직이는 해는 **${my.join('·')}년**이야. 그때를 노려 준비해 두게.`, `재물을 부르는 방향은 ${K.EL[a.yongsin.el].dir}, 색은 ${K.EL[a.yongsin.el].color}이야.`];
        const yr = a.seun.find(s => ['재성', '식상'].includes(S.GROUP_OF[s.stemTG]) || ['재성', '식상'].includes(S.GROUP_OF[s.branchTG]));
        return [gp.재성 > 1.6 ? '재성이 넉넉한 사주라 재물과 인연이 깊네.' : '재성이 많지 않으니 재물은 실력의 그림자처럼 따라오는 것일세.',
          yr ? `${yr.year}년(${yr.stem}${yr.branch})에 돈의 흐름이 활발하니 그때를 노리게.` : '올해와 내년은 재물보다 기반을 다지는 때일세. 공부와 저축이 다음 운을 부르네.',
          `재물을 부르는 방향은 ${K.EL[a.yongsin.el].dir}, 색은 ${K.EL[a.yongsin.el].color}이야.`];
      }
      case 'work': {
        const yr = a.seun.find(s => ['관성', '인성'].includes(S.GROUP_OF[s.stemTG]));
        return [`${a.gyeok.name}의 그릇이니 ${K.GYEOK[a.gyeok.name] || ''}`,
          yr ? `${yr.year}년엔 ${yr.stemTG}의 기운이 들어 승진·합격·이직에 좋은 바람이 부네.` : `${s1.year}·${s2.year}년은 자리보다 실력을 쌓기 좋은 해야. 서두르지 말게.`,
          has('역마살') ? '역마가 있으니 이동과 변화가 오히려 길일세.' : '한 우물을 깊게 파는 쪽이 자네에게 맞아.'];
      }
      case 'health': {
        const pct = a.power.pct;
        const weak = S.ELEMENTS.slice().sort((x, y) => pct[x] - pct[y])[0];
        return [`자네 사주에서 가장 약한 기운은 ${weak}(${EL_H[weak]}), 몸으로는 ${K.EL[weak].organs}에 해당하지.`, `${K.EL[weak].boost.split(', ').slice(0, 2).join(', ')} 같은 습관이 도움이 될 걸세.`, '물론 몸이 아프면 의원(병원)을 먼저 찾게. 사주는 거울일 뿐이야.'];
      }
      case 'move': {
        const clash = a.seun.find(s => s.relations.some(r => r.type === '충'));
        return [has('역마살') ? '역마가 있어 이사와 이동이 많은 팔자일세.' : '역마가 크게 드러나지 않아 한곳에 정착할 때 운이 쌓이는 편이네.',
          clash ? `${clash.year}년엔 원국과 충이 걸려 움직임이 생기기 쉽네. 이사·이직이 그때 자연스럽게 찾아올 수 있어.` : '올해와 내년엔 크게 흔드는 충이 없으니, 이사는 서두를 필요 없겠네.',
          `옮긴다면 ${K.EL[a.yongsin.el].dir}이 자네에게 반가운 방향이야.`];
      }
      default: return closing(a, fm).slice(0, 3);
    }
  }

  function build(a) {
    const self = selfSection(a);
    const el = elementSection(a);
    const fm = el.fm;
    const ms = mulsang(a), ar = archetypeOf(a);
    return {
      fm,
      sections: [
        { key: 'chart', title: '원국', say: ['이것이 자네가 태어난 순간의 하늘과 땅, **여덟 글자**일세.', `한 폭의 그림으로 보면… ${ms.scene.split('. ')[0]}.`, ms.named.length ? `오호, **${ms.named[0].n}**의 짜임이 보이는구먼! ${ms.named[0].t}` : ms.judge, `자네 사주의 유형은 **${ar.name}**일세.`], html: `${sajuCard(a)}${infoHTML(a)}${chartHTML(a)}` },
        { key: 'self', title: '타고난 나', ...self },
        { key: 'element', title: '오행·용신', say: el.say, html: el.html },
        { key: 'tengod', title: '십성', ...tenGodSection(a) },
        { key: 'sinsal', title: '신살·관계', ...sinsalSection(a) },
        { key: 'area', title: '재물·직업·연애', ...areaSection(a, fm) },
        { key: 'daeun', title: '인생 그래프', ...daeunSection(a, fm) },
        { key: 'year', title: `${a.seun[0].year}·${a.seun[1].year}`, ...yearSection(a, fm) },
      ],
      closing: closing(a, fm),
      answer: topic => answer(a, fm, topic),
    };
  }

  window.SajuReading = { build, favMap, flowLabel, pillarScore, chartHTML, infoHTML, seunFor, yearEvents, seunText, pastHits, mulsang, archetypeOf, lifeGraph };
})();
