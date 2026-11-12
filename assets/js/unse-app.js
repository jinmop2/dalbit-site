/* 구슬이네 운세방 — 오늘의 운세·띠·별자리·꿈해몽 */
(function () {
  'use strict';
  const D = window.Dalbit, S = window.SajuCore, U = window.UnseData, K = window.SajuData, R = window.SajuReading, AS = window.Astro;
  D.topbar();
  const actor = window.Characters.mount('guseul', document.getElementById('actor'));
  const dlg = D.Dialog(document.getElementById('dialog'), actor, { pitch: 900 });
  D.fitActor(document.querySelector('.stage'), 0.8); // 탁자가 가슴 높이에 오게
  const content = document.getElementById('content');
  D.particles(document.getElementById('foxfire'), 'fire');
  const visits = D.load('visits:unse', 0); D.save('visits:unse', visits + 1);
  const now = D.kst();
  const TODAY = { y: now.y, m: now.m, d: now.d };
  const ymd = o => `${o.y}-${String(o.m).padStart(2, '0')}-${String(o.d).padStart(2, '0')}`;
  const addDays = (o, n) => { const t = new Date(Date.UTC(o.y, o.m - 1, o.d + n)); return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() }; };
  const clamp = (x, a, b) => Math.max(a, Math.min(b, Math.round(x)));
  const EL_COLORS = { 목: ['초록', '민트', '청록'], 화: ['빨강', '주황', '코랄 핑크'], 토: ['노랑', '베이지', '황토색'], 금: ['흰색', '은색', '아이보리'], 수: ['검정', '네이비', '남색'] };
  const EL_NUM = { 목: [3, 8], 화: [2, 7], 토: [5, 10], 금: [4, 9], 수: [1, 6] };
  const SIJIN_T = ['23~01시', '01~03시', '03~05시', '05~07시', '07~09시', '09~11시', '11~13시', '13~15시', '15~17시', '17~19시', '19~21시', '21~23시'];

  let tab = (location.hash || '#today').slice(1);
  const toContent = () => { if (D.isPhone()) D.scrollToEl(content, 8); else window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const toDetail = () => { const d = content.querySelectorAll('.panel')[1]; if (d) D.scrollBelowTabs(d, content.querySelector('.tabs')); };
  let natal = null; // 내 사주 분석
  function loadNatal() {
    const p = D.profile();
    if (!p) { natal = null; return null; }
    try { natal = S.analyze(D.toSajuInput(p)); natal.name = p.name; natal.fm = R.favMap(natal); } catch (e) { natal = null; }
    return natal;
  }

  /* ── 일진 점수 ── */
  function dayScore(a, date) {
    const P = {}; for (const k of Object.keys(a.pillars)) P[k] = a.pillars[k];
    const di = S.dayInfo(a.dm, P, Object.assign({ h: 12 }, date));
    const fm = a.fm;
    const energy = K.STAGE[di.stage].energy;
    let rel = 0;
    const relTypes = [];
    for (const r of di.relations) {
      if (r.stemLevel) { if (r.type === '천간합' && r.with === 'day') rel += 4; if (r.type === '천간충') rel -= 3; continue; }
      const w = r.with === 'day' ? 1.3 : r.with === 'month' ? 1 : 0.7;
      const v = { 육합: 7, 삼합: 5, 충: -9, 형: -5, 원진: -4, 해: -3, 파: -3 }[r.type];
      if (v) { rel += v * w; relTypes.push(r); }
    }
    const rng = D.rng(ymd(date) + a.dm + a.dayPillar);
    const noise = () => rng() * 6 - 3;
    const total = clamp(58 + fm[di.stemEl] * 6 + fm[di.branchEl] * 7 + (energy - 6) * 2.2 + rel + noise(), 22, 98);
    const g1 = S.GROUP_OF[di.stemTG], g2 = S.GROUP_OF[di.branchTG];
    const has = g => g1 === g || g2 === g;
    const spouse = a.gender === 'male' ? '재성' : '관성';
    const dohwa = ['year', 'day'].some(k => S.sinsal12(a.pillars[k].branch, di.branch) === '년살');
    const dayClash = relTypes.some(r => r.with === 'day' && r.type === '충');
    const love = clamp(total + (has(spouse) ? 9 : 0) + (dohwa ? 6 : 0) - (dayClash ? 6 : 0) + noise(), 20, 99);
    const money = clamp(total + (has('재성') ? 10 : has('식상') ? 5 : has('비겁') ? -7 : 0) + noise(), 20, 99);
    const work = clamp(total + (has('관성') ? 8 : has('인성') ? 6 : g1 === '식상' && di.stemTG === '상관' ? -4 : 0) + noise(), 20, 99);
    const health = clamp(total * 0.6 + energy * 4 + (di.stemEl === a.yongsin.gisin || di.branchEl === a.yongsin.gisin ? -6 : 0) - (dayClash ? 4 : 0) + noise(), 20, 99);
    return { di, total, love, money, work, health, relTypes, dohwa, rng };
  }

  function lucky(a, sc) {
    const el = a.yongsin.el, rng = sc.rng;
    const color = EL_COLORS[el][Math.floor(rng() * 3)];
    const nums = EL_NUM[el];
    const num = rng() < 0.5 ? nums[0] : nums[1];
    const num2 = 1 + Math.floor(rng() * 45);
    const db = a.pillars.day.branch;
    const hs = S.BRANCHES.map((b, i) => {
      let s = a.fm[S.branchEl(b)] * 2;
      const rel = S.branchRelations(b, db);
      if (rel.some(r => r.type === '육합' || r.type === '삼합')) s += 2;
      if (rel.some(r => r.type === '충')) s -= 3;
      return { i, b, s };
    });
    const good = hs.slice().sort((x, y) => y.s - x.s).slice(0, 2).sort((x, y) => x.i - y.i);
    const bad = hs.slice().sort((x, y) => x.s - y.s)[0];
    return { color, num, num2, dir: K.EL[el].dir, good, bad };
  }

  /* ── 화면 틀 ── */
  function frame(inner) {
    const tabs = [['today', '🦊 오늘의 운세'], ['tti', '🐯 띠 운세'], ['star', '✨ 별자리'], ['dream', '🌙 꿈해몽']];
    content.innerHTML = `<nav class="tabs">${tabs.map(([k, l]) => `<button data-k="${k}" class="${k === tab ? 'on' : ''}">${l}</button>`).join('')}</nav><div id="pane">${inner}</div>`;
    content.querySelectorAll('.tabs button').forEach(b => b.onclick = () => { D.sfx.pick(); go(b.dataset.k); });
  }
  function go(k, initial) {
    tab = k; history.replaceState(null, '', '#' + k);
    ({ today: viewToday, tti: viewTti, star: viewStar, dream: viewDream })[k]();
    if (!initial) toContent();
  }

  /* ── 오늘의 운세 ── */
  async function needProfile(next, line) {
    frame(`<div class="panel"><h2>생년월일 알려 주기</h2><p class="muted small">시간은 몰라도 괜찮아요. 한 번 알려 주면 골목 가게들이 다 기억해요(이 기기에만 저장).</p><div id="bf"></div></div>`);
    dlg.quiet(line || '손님 생년월일을 알아야 구슬에 비춰 볼 수 있어요! 알려 줄래요?', { expr: 'normal' });
    await D.birthForm(content.querySelector('#bf'), { submitLabel: '구슬에 비춰 보기' });
    loadNatal();
    D.sfx.magic();
    next();
  }

  const ring = (v, label) => `<div class="ring" style="--v:${v}"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="52" class="bg"/><circle cx="60" cy="60" r="52" class="fg" style="stroke-dasharray:${(v / 100 * 326.7).toFixed(1)} 326.7"/></svg><div><b>${v}</b><small>${label}</small></div></div>`;
  const bar = (name, v, ic) => `<div class="abar"><span>${ic} ${name}</span><div class="track"><div class="fill" style="width:${v}%"></div></div><b>${v}</b></div>`;

  async function viewToday(date = TODAY) {
    if (!natal && !loadNatal()) return needProfile(() => viewToday(date));
    const a = natal;
    const sc = dayScore(a, date);
    const di = sc.di;
    const t = U.DAY_TG[di.stemTG];
    const lk = lucky(a, sc);
    const lun = S.solarToLunar(date.y, date.m, date.d);
    const isToday = ymd(date) === ymd(TODAY);
    const tomorrow = dayScore(a, addDays(date, 1));
    const relLines = [...new Set(sc.relTypes.map(r => r.type))].map(x => U.REL_DAY[x]).filter(Boolean);
    const totalTxt = t.total[Math.floor(sc.rng() * 2)];
    const grade = sc.total >= 85 ? '대길' : sc.total >= 72 ? '길' : sc.total >= 58 ? '보통' : sc.total >= 45 ? '주의' : '조심';
    frame(`<div class="panel today-card fade-in">
      <div class="today-head"><div><div class="date">${date.m}월 ${date.d}일 ${isToday ? '<span class="tag">오늘</span>' : ''}</div><div class="muted small">음력 ${lun.month}월 ${lun.day}일 · ${di.hanja}일(${di.stem}${di.branch}일)</div></div>
        <div class="who small muted">${D.esc(a.name || '손님')} · ${a.dm}${a.dmEl} 일간 <button class="btn small" id="chg">정보 바꾸기</button></div></div>
      <div class="score-row">${ring(sc.total, grade)}<div class="abars">${bar('애정', sc.love, '💞')}${bar('금전', sc.money, '💰')}${bar('직장·학업', sc.work, '💼')}${bar('건강', sc.health, '🍀')}</div></div>
      <h3>“${t.title}”</h3>
      <p>${totalTxt}</p>
      <p class="muted">오늘 일진 ${di.stem}${di.branch}는 ${D.esc(a.name || '손님')}에게 천간 <b>${di.stemTG}</b>, 지지 <b>${di.branchTG}</b>의 기운이에요. 일간의 기운은 ${U.STAGE_DAY[di.stage]}(${di.stage})예요.</p>
      ${relLines.map(l => `<p class="rel-note">🔮 ${l}</p>`).join('')}
      ${sc.dohwa ? '<p class="rel-note">🌸 오늘은 도화의 날! 평소보다 눈길을 끄는 매력이 살아나요.</p>' : ''}
      <div class="grid2 areas">
        <div class="mini"><h4>💞 애정운</h4><p>${t.love}</p></div>
        <div class="mini"><h4>💰 금전운</h4><p>${t.money}</p></div>
        <div class="mini"><h4>💼 직장·학업운</h4><p>${t.work}</p></div>
        <div class="mini"><h4>🍀 건강운</h4><p>${t.health}</p></div>
      </div>
      <div class="lucky">
        <div><small>행운의 색</small><b>${lk.color}</b></div><div><small>행운의 숫자</small><b>${lk.num} · ${lk.num2}</b></div><div><small>좋은 방향</small><b>${lk.dir}</b></div>
        <div><small>좋은 시간</small><b>${lk.good.map(g => `${g.b}시(${SIJIN_T[g.i]})`).join(', ')}</b></div><div><small>조심할 시간</small><b>${lk.bad.b}시(${SIJIN_T[lk.bad.i]})</b></div>
      </div>
      <div class="word">“${t.word}”</div>
      <div class="inline nav-days"><button class="btn small" id="prev">◀ 전날</button>${isToday ? '' : '<button class="btn small" id="tday">오늘로</button>'}<button class="btn small" id="next">다음날 ▶</button></div>
      <p class="small muted">내일(${addDays(date, 1).m}/${addDays(date, 1).d})은 ${tomorrow.total}점 — “${U.DAY_TG[tomorrow.di.stemTG].title}”</p>
    </div>
    <div class="panel"><h3>${date.m}월의 운세 달력</h3><div id="cal"></div><p class="muted small">★ 이달의 좋은 날 · ☂ 조심할 날. 숫자를 누르면 그날 운세를 볼 수 있어요.</p></div>
    <p class="muted small">오늘의 운세는 그날의 일진(간지)이 내 사주의 일간에 대해 갖는 십성과 12운성, 원국 지지와의 합·충, 용신과의 관계를 따져 계산해요.</p>`);
    content.querySelector('#chg').onclick = () => needProfile(() => viewToday(date), '그럼 새로 알려 주세요! 꼬리 쫑긋 듣고 있을게요.');
    content.querySelector('#prev').onclick = () => { D.sfx.flip(); viewToday(addDays(date, -1)); toContent(); };
    content.querySelector('#next').onclick = () => { D.sfx.flip(); viewToday(addDays(date, 1)); toContent(); };
    const td = content.querySelector('#tday'); if (td) td.onclick = () => { viewToday(TODAY); toContent(); };
    calendar(a, date);
    const expr = sc.total >= 80 ? 'happy' : sc.total >= 62 ? 'grin' : sc.total >= 48 ? 'normal' : 'sad';
    const open = sc.total >= 80 ? `우와! ${isToday ? '오늘' : '이날'}은 ${sc.total}점, 구슬이 반짝반짝 빛나요!` : sc.total >= 62 ? `${isToday ? '오늘' : '이날'}은 ${sc.total}점! 꽤 괜찮은 하루예요.` : sc.total >= 48 ? `${isToday ? '오늘' : '이날'}은 ${sc.total}점. 무난하게 흘러가는 날이에요.` : `음… ${isToday ? '오늘' : '이날'}은 ${sc.total}점이에요. 조심조심 다니면 괜찮아요!`;
    await dlg.say(open, { expr });
    await dlg.quiet(`${t.title}! 행운의 색은 **${lk.color}**, 좋은 시간은 **${lk.good[0].b}시**예요. ${t.word}`, { expr: 'wink' });
  }

  function calendar(a, date) {
    const first = new Date(Date.UTC(date.y, date.m - 1, 1));
    const days = new Date(Date.UTC(date.y, date.m, 0)).getUTCDate();
    const scores = [];
    for (let d = 1; d <= days; d++) scores.push(dayScore(a, { y: date.y, m: date.m, d }).total);
    const sorted = scores.map((s, i) => [s, i + 1]).sort((x, y) => y[0] - x[0]);
    const best = new Set(sorted.slice(0, 3).map(x => x[1])), worst = new Set(sorted.slice(-2).map(x => x[1]));
    let html = '<div class="cal">' + '일월화수목금토'.split('').map(x => `<div class="dow">${x}</div>`).join('');
    for (let i = 0; i < first.getUTCDay(); i++) html += '<div></div>';
    for (let d = 1; d <= days; d++) {
      const s = scores[d - 1];
      const lv = s >= 80 ? 'l4' : s >= 68 ? 'l3' : s >= 55 ? 'l2' : 'l1';
      const isT = date.y === TODAY.y && date.m === TODAY.m && d === TODAY.d;
      html += `<button class="cd ${lv}${d === date.d ? ' sel' : ''}${isT ? ' today' : ''}" data-d="${d}"><span>${d}</span><small>${best.has(d) ? '★' : worst.has(d) ? '☂' : s}</small></button>`;
    }
    html += '</div>';
    const box = content.querySelector('#cal'); box.innerHTML = html;
    box.querySelectorAll('.cd').forEach(b => b.onclick = () => { D.sfx.pick(); viewToday({ y: date.y, m: date.m, d: +b.dataset.d }); toContent(); });
  }

  /* ── 띠 운세 ── */
  const REL_ORDER = ['충', '삼합', '육합', '형', '원진', '해', '파'];
  function yearRel(yb, ab) {
    if (yb === ab) return '본명';
    const rel = S.branchRelations(yb, ab).map(r => r.type);
    return REL_ORDER.find(t => rel.includes(t)) || '평';
  }
  const SAMJAE = { 해: '사오미', 묘: '사오미', 미: '사오미', 인: '신유술', 오: '신유술', 술: '신유술', 사: '해자축', 유: '해자축', 축: '해자축', 신: '인묘진', 자: '인묘진', 진: '인묘진' };
  async function viewTti(sel) {
    const mine = natal || loadNatal();
    const myIdx = mine ? S.bi(mine.yearBranch) : -1;
    const idx = sel == null ? (myIdx >= 0 ? myIdx : null) : sel;
    const yrs = b => { const out = []; for (let y = 1936; y <= TODAY.y; y++) if ((y - 4) % 12 === b) out.push(y); return out; };
    let detail = '';
    if (idx != null) {
      const an = U.ANIMALS[idx];
      const ys = [TODAY.y, TODAY.y + 1].map(y => {
        const yp = S.yearPillar(y);
        const rt = yearRel(yp.branch, an.b);
        const r = U.YEAR_REL[rt];
        const sj = SAMJAE[an.b].indexOf(yp.branch);
        return { y, yp, rt, r, sj };
      });
      const dp = S.pillarAt({ y: TODAY.y, m: TODAY.m, d: TODAY.d, h: 12 }).day;
      const drt = yearRel(dp.branch, an.b);
      const dd = U.DAY_REL_ANIMAL[drt];
      detail = `<div class="panel fade-in tti-detail"><div class="tti-head"><span class="big-emoji">${an.e}</span><div><h2>${an.k}띠 <small class="muted">${S.BRANCHES_H[idx]}(${an.b})</small></h2><p class="muted small">${yrs(idx).slice(-7).join(' · ')}년생</p></div></div>
        <p>${an.trait}</p>
        <div class="mini"><h4>오늘(${TODAY.m}/${TODAY.d} ${dp.stem}${dp.branch}일)의 ${an.k}띠 <span class="pill">${dd[1]}점</span></h4><p>${dd[0]}</p></div>
        ${ys.map(x => `<div class="year-block"><h3>${x.y}년 ${x.yp.stem}${x.yp.branch}(${S.hanja(x.yp)})년 · ${x.r.title} <span class="pill">${x.r.score}점</span></h3>
          <p class="muted small">${U.YEAR_STEM[x.yp.stem]}이 흐르는 해예요.</p>
          <p>${x.r.total}</p>
          <div class="grid2"><div class="mini"><h4>💰 재물</h4><p>${x.r.money}</p></div><div class="mini"><h4>💞 애정</h4><p>${x.r.love}</p></div><div class="mini"><h4>🍀 건강</h4><p>${x.r.health}</p></div><div class="mini"><h4>🦊 구슬이의 팁</h4><p>${x.r.tip}</p></div></div>
          ${x.sj >= 0 ? `<p class="samjae">⚠️ ${an.k}띠는 ${x.y}년이 <b>${['들삼재', '눌삼재', '날삼재'][x.sj]}</b>예요. ${['삼재가 들어오는 해라 새 일은 신중하게!', '삼재가 머무는 해라 무리한 확장은 쉬어 가요.', '삼재가 나가는 해! 마무리만 잘하면 복삼재가 돼요.'][x.sj]}</p>` : ''}</div>`).join('')}
        <p class="muted small">띠는 양력 1월 1일이 아니라 입춘(2월 4일 무렵)에 바뀌어요. 1월~2월 초에 태어났다면 앞 띠일 수 있으니 '오늘의 운세'에 생년월일을 넣으면 정확한 띠로 봐 드려요.</p></div>`;
    }
    frame(`<div class="panel"><h2>띠별 운세</h2><div class="tti-grid">${U.ANIMALS.map((an, i) => `<button class="tti${i === idx ? ' on' : ''}${i === myIdx ? ' mine' : ''}" data-i="${i}"><span>${an.e}</span><b>${an.k}</b>${i === myIdx ? '<small>내 띠</small>' : ''}</button>`).join('')}</div></div>${detail}`);
    content.querySelectorAll('.tti').forEach(b => b.onclick = () => { D.sfx.pick(); viewTti(+b.dataset.i); setTimeout(toDetail, 30); });
    if (idx != null) {
      const an = U.ANIMALS[idx];
      const r0 = U.YEAR_REL[yearRel(S.yearPillar(TODAY.y).branch, an.b)];
      const r1 = U.YEAR_REL[yearRel(S.yearPillar(TODAY.y + 1).branch, an.b)];
      if (sel != null || mine) { await dlg.say(`${an.k}띠! ${TODAY.y}년은 “${r0.title.split(' — ')[1] || r0.title}”, ${TODAY.y + 1}년은 “${r1.title.split(' — ')[1] || r1.title}”예요.`, { expr: r1.score >= 70 ? 'grin' : 'normal' }); }
      await dlg.quiet(r1.tip, { expr: 'wink' });
    } else dlg.quiet('궁금한 띠를 골라 보세요! 친구 띠도, 가족 띠도 다 돼요.', { expr: 'grin' });
  }

  /* ── 별자리 ── */
  function retroNote(date) {
    const t = ymd(date);
    const cur = U.MERCURY_RETRO.find(([a, b]) => a <= t && t <= b);
    if (cur) return `☿ 지금은 <b>수성 역행</b> 중(${cur[0].slice(5)}~${cur[1].slice(5)})이에요. 연락·계약·전자기기 실수를 조심하고, 옛 인연·미뤄 둔 일을 다시 들여다보기 좋아요.`;
    const next = U.MERCURY_RETRO.find(([a]) => a > t);
    if (next) {
      const days = Math.round((Date.parse(next[0]) - Date.parse(t)) / 86400e3);
      if (days <= 10) return `☿ ${days}일 뒤(${next[0].slice(5)})부터 <b>수성 역행</b>이 시작돼요. 중요한 계약·구매는 그 전에 마무리해 두면 좋아요.`;
    }
    return '';
  }
  function starScore(si, date) {
    const sky = AS.skyOn(date.y, date.m, date.d);
    const house = ((sky.moonSign - si + 12) % 12) + 1;
    const H = U.HOUSE[house];
    const rng = D.rng(ymd(date) + 'star' + si);
    let s = U.ASPECT_SCORE[H.aspect] + (rng() * 10 - 5);
    if (sky.phase.idx === 4) s += 3;
    if (U.MERCURY_RETRO.some(([a, b]) => a <= ymd(date) && ymd(date) <= b)) s -= 4;
    return { sky, house, H, score: clamp(s, 35, 97), rng };
  }
  async function viewStar(sel) {
    const p = D.profile();
    let si = sel, mine = null;
    if (p) { const ss = AS.sunSignOfBirth(p.year, p.month, p.day); if (p.calendar === 'lunar') { const s = S.lunarToSolar(p.year, p.month, p.day, p.leap); mine = AS.sunSignOfBirth(s.year, s.month, s.day).idx; } else mine = ss.idx; }
    if (si == null) si = mine;
    let detail = '';
    if (si != null) {
      const sg = AS.SIGNS[si];
      const st = starScore(si, TODAY);
      const sky = st.sky;
      const ms = AS.SIGNS[sky.moonSign];
      const lk = U.SIGN_LUCKY[si];
      const week = Array.from({ length: 7 }, (_, k) => { const d = addDays(TODAY, k); const x = starScore(si, d); return `<div class="wk"><small>${k === 0 ? '오늘' : `${d.m}/${d.d}`}</small><b>${AS.SIGNS[x.sky.moonSign].sym}</b><span>${x.H.area}</span><em>${x.score}</em></div>`; }).join('');
      const rn = retroNote(TODAY);
      detail = `<div class="panel fade-in"><div class="tti-head"><span class="big-emoji sign">${sg.sym}</span><div><h2>${sg.ko} <small class="muted">${sg.en} · ${sg.dates}</small></h2><p class="muted small">${sg.el}의 별자리 · 수호성 ${sg.ruler}</p></div><div class="pill big">${st.score}점</div></div>
        <p>${U.SIGN_TRAIT[si]}</p>
        <div class="sky"><div><small>오늘 정오의 달</small><b>${ms.sym} ${ms.ko} ${Math.floor(sky.moonLon % 30)}°</b></div><div><small>달의 위상</small><b>${sky.phase.name} (${Math.round(sky.phase.illum * 100)}%)</b></div><div><small>${sg.ko}로부터</small><b>${st.house}번째 집 · ${st.H.area}</b></div></div>
        <p>${st.H.t}</p>
        <div class="grid2"><div class="mini"><h4>💞 사랑</h4><p>${st.H.love}</p></div><div class="mini"><h4>💼 일</h4><p>${st.H.work}</p></div></div>
        <p class="rel-note">🌙 ${U.PHASE_TEXT[sky.phase.idx]}</p>
        ${rn ? `<p class="rel-note">${rn}</p>` : ''}
        <div class="lucky"><div><small>행운의 색</small><b>${lk[0]}</b></div><div><small>행운의 숫자</small><b>${lk[1]} · ${1 + Math.floor(st.rng() * 30)}</b></div><div><small>달이 다음 별자리로</small><b>약 ${Math.round(sky.moonIngressH)}시간 뒤</b></div></div>
        <h3>이번 주 달의 길</h3><div class="week">${week}</div>
        <p class="muted small">별자리 운세는 그날 달이 지나는 별자리가 내 태양 별자리로부터 몇 번째 하우스(솔라 하우스)인지, 그리고 달의 위상으로 풀어요. 달과 해의 위치는 Meeus의 천문 알고리즘으로 실제로 계산해요.</p></div>`;
    }
    frame(`<div class="panel"><h2>별자리 운세</h2>${mine != null ? `<p class="muted small">생일로 계산한 태양 별자리: <b>${AS.SIGNS[mine].ko}</b></p>` : ''}<div class="tti-grid">${AS.SIGNS.map((s, i) => `<button class="tti${i === si ? ' on' : ''}${i === mine ? ' mine' : ''}" data-i="${i}"><span class="sign">${s.sym}</span><b>${s.ko}</b><small>${s.dates}</small></button>`).join('')}</div></div>${detail}`);
    content.querySelectorAll('.tti').forEach(b => b.onclick = () => { D.sfx.pick(); viewStar(+b.dataset.i); setTimeout(toDetail, 30); });
    if (si != null) {
      const st = starScore(si, TODAY);
      await dlg.say(`${AS.SIGNS[si].ko}! 오늘 달은 **${AS.SIGNS[st.sky.moonSign].ko}**를 지나고 있어요. ${AS.SIGNS[si].ko}에게는 **${st.H.area}**의 집이에요.`, { expr: 'grin' });
      await dlg.quiet(st.H.t.split('. ')[0] + '.', { expr: st.score >= 75 ? 'happy' : 'normal' });
    } else dlg.quiet('내 별자리를 골라 보세요! 오늘 달이 어디 있는지 구슬로 봐 줄게요.', { expr: 'grin' });
  }

  /* ── 꿈해몽 ── */
  const ONE = /^.$/;
  function dreamMatch(text) {
    const found = [];
    for (const d of U.DREAMS) {
      const hit = d[0].some(k => {
        if (ONE.test(k)) return new RegExp(`(^|[\\s,.!?'"“”])${k}(이|가|을|를|은|는|에|에서|에게|한테|과|와|도|만|의|랑|이랑|들|떼|\\s|$|[,.!?'"“”])`).test(text);
        return text.includes(k);
      });
      if (hit) found.push(d);
    }
    return found;
  }
  async function viewDream() {
    const cats = Object.keys(U.DREAM_TAG);
    frame(`<div class="panel"><h2>꿈해몽</h2>
      <div class="form"><label class="lbl" for="dt">간밤의 꿈 이야기를 들려주세요</label><textarea id="dt" maxlength="300" placeholder="예: 커다란 돼지가 집으로 들어오더니 내 품에 안겼어요"></textarea>
      <div class="inline"><button class="btn primary" id="dgo">구슬에 비춰 보기</button></div></div>
      <div class="chips">${cats.map(c => `<button class="btn small" data-c="${c}">${U.DREAM_TAG[c]}</button>`).join('')}<button class="btn small" data-c="all">전체 보기</button></div>
      <div id="dres"></div></div>`);
    const res = content.querySelector('#dres');
    const list = (arr, head) => { res.innerHTML = (head || '') + (arr.length ? arr.map(d => `<div class="dream fade-in"><b>${d[1]}</b> <span class="tag">${U.DREAM_TAG[d[3]]}</span><p>${d[2]}</p></div>`).join('') : '<p class="muted">구슬에 아무것도 비치지 않았어요. 꿈속에 나온 사물이나 동물을 넣어 다시 말해 줄래요?</p>'); };
    content.querySelector('#dgo').onclick = async () => {
      const txt = content.querySelector('#dt').value.trim();
      if (!txt) return dlg.quiet('꿈 이야기를 한 줄이라도 적어 줘요!', { expr: 'sad' });
      D.sfx.magic();
      const f = dreamMatch(txt);
      const kinds = f.map(d => d[3]);
      const verdict = kinds.includes('재물') ? '💰 재물이 들어올 기미가 보여요!' : kinds.includes('태몽') ? '👶 태몽일 수도 있는 꿈이에요. 주변에 기쁜 소식이 있나요?' : kinds.includes('길몽') ? '🌈 기분 좋은 길몽이에요!' : kinds.includes('주의') ? '⚠️ 조심하라는 신호가 섞여 있어요.' : f.length ? '🧠 마음이 보내는 신호에 가까운 꿈이에요.' : '';
      list(f, f.length ? `<div class="luna-says fade-in"><b>구슬이의 풀이</b><p>꿈속에서 <b>${f.map(d => d[1].replace(' 꿈', '')).join(', ')}</b>${D.j(f[f.length - 1][1].replace(' 꿈', ''), '이가').slice(f[f.length - 1][1].replace(' 꿈', '').length)} 보였어요. ${verdict}</p><p class="muted small">해몽은 같은 상징도 꿈속 분위기에 따라 달라져요. 깨어났을 때 기분이 좋았다면 길몽 쪽으로, 찜찜했다면 조심하라는 쪽으로 읽어요.</p></div>` : '');
      if (f.length) { await dlg.say(`오호! ${f[0][1]}이네요. ${verdict}`, { expr: kinds.includes('주의') ? 'surprise' : 'happy' }); await dlg.quiet(f[0][2].split('. ')[0] + '.', { expr: 'grin' }); }
      else dlg.quiet('음… 구슬이 뿌옇네요. 꿈에 나온 동물이나 물건 이름을 넣어 주면 더 잘 보여요!', { expr: 'sad' });
    };
    content.querySelectorAll('.chips button').forEach(b => b.onclick = () => { D.sfx.pick(); const c = b.dataset.c; list(c === 'all' ? U.DREAMS : U.DREAMS.filter(d => d[3] === c)); });
    dlg.quiet('간밤에 무슨 꿈 꿨어요? 구슬이가 풀어 줄게요! 돼지꿈이면 나도 좀 나눠 줘요. 히히.', { expr: 'smug' });
  }

  /* ── 시작 ── */
  async function greet() {
    content.innerHTML = '<div class="panel"><h2>구슬이네 운세방</h2><p class="muted">오늘의 운세 · 띠 운세 · 별자리 · 꿈해몽</p></div>';
    const t = D.timeGreeting();
    const first = {
      deep: '어머, 이 시간에 손님이? 여우는 밤이 제일 쌩쌩하거든요!', morning: '좋은 아침이에요! 오늘 하루 운, 구슬에 비춰 볼래요?', day: '어서 와요, 구슬이네 운세방이에요!',
      evening: '어서 와요! 저녁 먹었어요? 운세는 배부를 때 봐야 잘 맞는대요. 히히.', night: '어머, 손님! 달 밝은 밤엔 구슬이 더 반짝여요.',
    }[t];
    await dlg.say(first, { expr: 'grin' });
    if (visits === 0) await dlg.say('나는 천 년 묵은… 아니, 아직 구백 살밖에 안 된 구미호 구슬이예요. 이 여우구슬에 오늘의 기운이 비친답니다!', { expr: 'wink', after: 'grin' });
    loadNatal();
    go(tab, true);
  }
  greet();
})();
