/* 달빛골목 입구 — 세 가게 정면과 오늘의 골목 소식 */
(function () {
  'use strict';
  const D = window.Dalbit, S = window.SajuCore, C = window.Characters;

  // 캐릭터 SVG 를 문 안쪽에 끼워 넣기
  const inset = (name, x, y, w, h) => C.ART[name]().replace('<svg viewBox', `<svg x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMax slice" viewBox`);

  const SHOPS = [
    {
      key: 'saju', href: 'saju.html', name: '청운 철학관', who: '청운 선생', role: '사주·궁합·만세력',
      hello: '허허, 어서 오시게. 자네 팔자 한번 펼쳐 보세나.',
      art: () => `
<svg viewBox="0 0 300 420" class="facade">
  <defs>
    <linearGradient id="hj" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff1c4"/><stop offset="1" stop-color="#f3c96a"/></linearGradient>
    <clipPath id="door-saju"><rect x="78" y="196" width="144" height="190"/></clipPath>
  </defs>
  <!-- 기단·벽 -->
  <rect x="20" y="380" width="260" height="40" fill="#5a4a3c"/>
  <rect x="30" y="180" width="240" height="206" fill="#d9c8a6"/>
  <!-- 문 안쪽 (캐릭터) -->
  <g clip-path="url(#door-saju)"><rect x="78" y="196" width="144" height="190" fill="#f6e3b0"/>${inset('cheongun', 70, 214, 160, 196)}</g>
  <!-- 미닫이 창호 두 짝 -->
  <g clip-path="url(#door-saju)"><g class="door-l"><rect x="78" y="196" width="72" height="190" fill="url(#hj)" stroke="#5b3b22" stroke-width="5"/>${lattice(78, 196, 72, 190)}</g>
  <g class="door-r"><rect x="150" y="196" width="72" height="190" fill="url(#hj)" stroke="#5b3b22" stroke-width="5"/>${lattice(150, 196, 72, 190)}</g></g>
  <!-- 기둥 -->
  <rect x="30" y="170" width="20" height="216" fill="#6b4428"/><rect x="250" y="170" width="20" height="216" fill="#6b4428"/>
  <!-- 세로 현판 -->
  <rect x="54" y="206" width="18" height="120" rx="2" fill="#2a1b12" stroke="#c8a24a" stroke-width="1.5"/>
  ${'靑雲哲學館'.split('').map((ch, i) => `<text x="63" y="${226 + i * 21}" fill="#f3e4b8" font-size="14" text-anchor="middle" font-family="Noto Serif KR, serif">${ch}</text>`).join('')}
  <!-- 처마와 기와 -->
  <path d="M-6 176 Q150 150 306 176 L292 150 Q150 118 8 150 Z" fill="#2f3542"/>
  <path d="M8 150 Q150 118 292 150 L270 108 Q150 80 30 108 Z" fill="#3c4456"/>
  ${Array.from({ length: 15 }, (_, i) => `<path d="M${14 + i * 19} ${172 - Math.sin((i / 14) * Math.PI) * 22} l0 -24" stroke="#232834" stroke-width="3"/>`).join('')}
  <path d="M30 108 Q150 80 270 108 L262 96 Q150 70 38 96 Z" fill="#1f2430"/>
  <!-- 홍등 -->
  <g transform="translate(262 196)"><g class="lantern"><line x1="0" y1="-14" x2="0" y2="0" stroke="#3a2a1a" stroke-width="2"/><ellipse cx="0" cy="18" rx="13" ry="18" fill="#d8402e"/><ellipse cx="0" cy="18" rx="7" ry="18" fill="#f06a4a" opacity=".6"/><rect x="-6" y="34" width="12" height="4" fill="#3a2a1a"/><line x1="0" y1="38" x2="0" y2="52" stroke="#e8b04a" stroke-width="2"/></g></g>
  <!-- 섬돌 -->
  <rect x="96" y="388" width="108" height="14" rx="3" fill="#8d8273"/>
</svg>`,
    },
    {
      key: 'tarot', href: 'tarot.html', name: '살롱 드 루나', who: '루나', role: '타로 리딩',
      hello: '어서 와요. 마음에 품은 질문, 카드에게 물어볼까요?',
      art: () => `
<svg viewBox="0 0 300 420" class="facade">
  <defs>
    <linearGradient id="vel" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3b1f5e"/><stop offset=".5" stop-color="#6a3c9c"/><stop offset="1" stop-color="#3b1f5e"/></linearGradient>
    <radialGradient id="glowp" cx=".5" cy=".6" r=".7"><stop offset="0" stop-color="#7b5ac0"/><stop offset="1" stop-color="#1c1240"/></radialGradient>
    <clipPath id="door-tarot"><path d="M84 386 L84 230 Q84 180 150 172 Q216 180 216 230 L216 386 Z"/></clipPath>
  </defs>
  <rect x="20" y="120" width="260" height="266" fill="#2a2348"/>
  <path d="M20 120 L280 120 L280 112 L20 112 Z" fill="#d8b45a"/>
  ${Array.from({ length: 6 }, (_, i) => `<rect x="${28 + i * 44}" y="130" width="2" height="250" fill="#3a3264"/>`).join('')}
  <!-- 문 안 -->
  <g clip-path="url(#door-tarot)"><rect x="84" y="170" width="132" height="216" fill="url(#glowp)"/>${inset('luna', 70, 210, 160, 196)}</g>
  <!-- 벨벳 커튼 -->
  <g clip-path="url(#door-tarot)"><g class="door-l"><path d="M84 170 L152 170 Q140 280 150 386 L84 386 Z" fill="url(#vel)"/><path d="M100 176 Q96 280 100 386 M118 176 Q114 280 120 386 M136 176 Q130 280 138 386" stroke="#2a1544" stroke-width="2" fill="none" opacity=".7"/></g></g>
  <g clip-path="url(#door-tarot)"><g class="door-r"><path d="M216 170 L148 170 Q160 280 150 386 L216 386 Z" fill="url(#vel)"/><path d="M200 176 Q204 280 200 386 M182 176 Q186 280 180 386 M164 176 Q170 280 162 386" stroke="#2a1544" stroke-width="2" fill="none" opacity=".7"/></g></g>
  <path d="M84 386 L84 230 Q84 180 150 172 Q216 180 216 230 L216 386" fill="none" stroke="#d8b45a" stroke-width="5"/>
  <!-- 간판: 초승달 네온 -->
  <g class="neon">
    <path d="M150 34 a30 30 0 1 0 22 50 a24 24 0 1 1 -22 -50" fill="none" stroke="#f3d98b" stroke-width="4"/>
    <text x="150" y="108" fill="#f6e7ff" font-size="21" text-anchor="middle" font-family="Cinzel, serif" letter-spacing="2">Salon de Luna</text>
  </g>
  <!-- 둥근 스테인드글라스 창 -->
  <g transform="translate(46 230)"><circle r="20" fill="#3d2b7a" stroke="#d8b45a" stroke-width="3"/><path d="M0 -20 V20 M-20 0 H20 M-14 -14 L14 14 M14 -14 L-14 14" stroke="#d8b45a" stroke-width="1.5"/><circle r="6" fill="#f3d98b"/></g>
  <g transform="translate(254 230)"><circle r="20" fill="#3d2b7a" stroke="#d8b45a" stroke-width="3"/><path d="M0 -20 V20 M-20 0 H20 M-14 -14 L14 14 M14 -14 L-14 14" stroke="#d8b45a" stroke-width="1.5"/><circle r="6" fill="#f3d98b"/></g>
  <!-- 촛대 -->
  ${[46, 254].map(x => `<g transform="translate(${x} 330)"><rect x="-4" y="0" width="8" height="40" fill="#efe6d2"/><path class="flame" d="M0 -16 C6 -8 5 -2 0 0 C-5 -2 -6 -8 0 -16 Z" fill="#ffcf5a"/><rect x="-10" y="40" width="20" height="5" fill="#d8b45a"/></g>`).join('')}
  <rect x="20" y="386" width="260" height="34" fill="#17122e"/>
</svg>`,
    },
    {
      key: 'unse', href: 'unse.html', name: '구슬이네 운세방', who: '구슬이', role: '오늘의 운세·띠·별자리·꿈해몽',
      hello: '어머, 손님! 오늘 운이 어떤지 구슬에 비춰 볼래요?',
      art: () => `
<svg viewBox="0 0 300 420" class="facade">
  <defs>
    <radialGradient id="warm" cx=".5" cy=".5" r=".6"><stop offset="0" stop-color="#ffe2a8"/><stop offset="1" stop-color="#f29a4a"/></radialGradient>
    <clipPath id="door-unse"><circle cx="150" cy="292" r="86"/></clipPath>
  </defs>
  <path d="M24 386 L24 170 Q24 150 44 150 L256 150 Q276 150 276 170 L276 386 Z" fill="#7a3b2e"/>
  <path d="M24 200 L276 200" stroke="#5e2c22" stroke-width="3"/>
  <!-- 둥근 문(월문) -->
  <g clip-path="url(#door-unse)"><rect x="60" y="200" width="180" height="190" fill="url(#warm)"/>${inset('guseul', 66, 214, 168, 196)}</g>
  <g clip-path="url(#door-unse)"><g class="door-l"><rect x="60" y="200" width="90" height="190" fill="#c8553a"/>${Array.from({ length: 5 }, (_, i) => `<line x1="${72 + i * 18}" y1="200" x2="${72 + i * 18}" y2="390" stroke="#a8402a" stroke-width="3"/>`).join('')}</g></g>
  <g clip-path="url(#door-unse)"><g class="door-r"><rect x="150" y="200" width="90" height="190" fill="#c8553a"/>${Array.from({ length: 5 }, (_, i) => `<line x1="${158 + i * 18}" y1="200" x2="${158 + i * 18}" y2="390" stroke="#a8402a" stroke-width="3"/>`).join('')}</g></g>
  <circle cx="150" cy="292" r="86" fill="none" stroke="#f5c46a" stroke-width="7"/>
  <!-- 지붕과 여우 귀 간판 -->
  <path d="M6 160 Q150 96 294 160 L276 170 Q150 116 24 170 Z" fill="#3b2a4a"/>
  <path d="M92 70 L108 24 L126 62 Z M208 70 L192 24 L174 62 Z" fill="#f08a3e"/>
  <path d="M100 64 L108 38 L118 60 Z M200 64 L192 38 L182 60 Z" fill="#fff1e2"/>
  <rect x="82" y="58" width="136" height="50" rx="24" fill="#f08a3e" stroke="#fff1e2" stroke-width="3"/>
  <text x="150" y="91" fill="#fff8ee" font-size="20" text-anchor="middle" font-family="Jua, sans-serif">구슬이네 운세방</text>
  <!-- 등롱 -->
  ${[44, 256].map((x, i) => `<g transform="translate(${x} 176)"><g class="lantern" style="animation-delay:${i * 0.7}s"><line x1="0" y1="-10" x2="0" y2="0" stroke="#3a2a1a" stroke-width="2"/><rect x="-12" y="0" width="24" height="34" rx="10" fill="#ffb44a"/><rect x="-12" y="0" width="24" height="34" rx="10" fill="none" stroke="#c8553a" stroke-width="2"/><text x="0" y="23" font-size="13" text-anchor="middle" fill="#8a2a1a" font-family="Noto Serif KR, serif">福</text></g></g>`).join('')}
  <!-- 여우불 -->
  ${[[40, 260], [262, 280], [70, 340], [236, 350]].map(([x, y], i) => `<circle class="foxfire" style="animation-delay:${i * 0.6}s" cx="${x}" cy="${y}" r="7" fill="#9fd4ff"/>`).join('')}
  <rect x="24" y="386" width="252" height="34" fill="#3a2230"/>
</svg>`,
    },
  ];

  function lattice(x, y, w, h) {
    let s = '';
    for (let i = 1; i < 4; i++) s += `<line x1="${x + (w * i) / 4}" y1="${y}" x2="${x + (w * i) / 4}" y2="${y + h}" stroke="#6b4428" stroke-width="2"/>`;
    for (let j = 1; j < 7; j++) s += `<line x1="${x}" y1="${y + (h * j) / 7}" x2="${x + w}" y2="${y + (h * j) / 7}" stroke="#6b4428" stroke-width="2"/>`;
    return s;
  }

  function buildShops() {
    const row = document.getElementById('shops');
    row.innerHTML = SHOPS.map(s => `
      <a class="shopfront shop-${s.key}" href="${s.href}" data-key="${s.key}" aria-label="${s.name} — ${s.who}, ${s.role}">
        <div class="bubble">${s.hello}</div>
        ${s.art()}
        <div class="plate"><strong>${s.name}</strong><span>${s.who} · ${s.role}</span></div>
      </a>`).join('');
    const fronts = [...row.querySelectorAll('.shopfront')];
    const openOnly = a => fronts.forEach(x => x.classList.toggle('open', x === a));
    fronts.forEach(a => {
      a.addEventListener('mouseenter', () => { if (!D.isPhone()) a.classList.add('open'); });
      a.addEventListener('mouseleave', () => { if (!D.isPhone() && !a.classList.contains('going')) a.classList.remove('open'); });
      a.addEventListener('focus', () => a.classList.add('open'));
      a.addEventListener('blur', () => { if (!D.isPhone()) a.classList.remove('open'); });
      a.addEventListener('click', e => {
        e.preventDefault();
        if (a.classList.contains('going')) return;
        // 휴대폰에서 아직 문이 닫힌 가게를 누르면 먼저 그 가게로 넘겨 문부터 연다
        if (D.isPhone() && !a.classList.contains('open')) { a.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' }); openOnly(a); return; }
        a.classList.add('open', 'going');
        D.sfx.bell();
        setTimeout(() => { location.href = a.getAttribute('href'); }, 750);
      });
    });
    // 휴대폰: 넘기는 카드의 가운데 가게가 문을 연다 + 점 표시
    const dots = document.createElement('div');
    dots.className = 'shop-dots';
    dots.innerHTML = fronts.map((_, i) => `<button aria-label="${SHOPS[i].name}"></button>`).join('');
    row.after(dots);
    const hint = document.createElement('p');
    hint.className = 'swipe-hint'; hint.textContent = '← 옆으로 넘겨 다른 가게 보기 →';
    dots.after(hint);
    const dotBtns = [...dots.children];
    dotBtns.forEach((b, i) => b.onclick = () => fronts[i].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' }));
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(es => {
        if (!D.isPhone()) return;
        for (const en of es) if (en.isIntersecting) { const i = fronts.indexOf(en.target); openOnly(en.target); dotBtns.forEach((b, k) => b.classList.toggle('on', k === i)); }
      }, { root: row, threshold: 0.75 });
      fronts.forEach(f => io.observe(f));
    }
  }

  // 오늘의 골목 소식: 날짜·음력·일진·절기
  function buildToday() {
    const now = D.kst();
    const p = S.pillarAt({ y: now.y, m: now.m, d: now.d, h: 12 });
    const lun = S.solarToLunar(now.y, now.m, now.d);
    const dow = '일월화수목금토'[now.dow];
    const dayH = S.hanja(p.day);
    const box = document.getElementById('today');
    const prof = D.profile();
    let dm = null, tg = null;
    if (prof) {
      try { const a = S.analyze(D.toSajuInput(prof)); dm = a.dm; tg = S.tenGod(dm, p.day.stem); } catch (e) { /* 프로필 오류 무시 */ }
    }
    const hint = {
      비견: '어깨를 나란히 할 사람이 곁에 오는 날', 겁재: '경쟁심이 일어나니 지갑 단속이 필요한 날', 식신: '먹고 즐기는 복이 따르는 날', 상관: '말 한마디가 빛나지만 날도 서는 날',
      편재: '뜻밖의 돈 흐름이 보이는 날', 정재: '차곡차곡 챙기면 남는 날', 편관: '책임이 몰려오니 숨 고르기가 필요한 날', 정관: '반듯하게 하면 인정받는 날',
      편인: '혼자만의 영감이 번뜩이는 날', 정인: '도움과 배움이 들어오는 날',
    };
    box.innerHTML = `
      <div class="today-date">
        <div class="big">${now.m}월 ${now.d}일 <small>${dow}요일</small></div>
        <div class="muted">음력 ${lun.isLeapMonth ? '윤' : ''}${lun.month}월 ${lun.day}일 · ${S.hanja(p.year)}년 ${S.hanja(p.month)}월 <b class="gold">${dayH}일</b></div>
      </div>
      <div class="today-note">
        ${prof && tg ? `<p><b>${D.esc(prof.name || '단골 손님')}</b>님에게 오늘의 일진 <b>${p.day.stem}${p.day.branch}</b>${D.j(p.day.stem + p.day.branch, '은는').slice(2)} <b>${tg}</b>의 기운 — ${hint[tg]}이에요.</p>
          <a class="btn small primary" href="unse.html#today">구슬이에게 자세히 듣기</a>`
        : `<p>오늘은 <b>${p.day.stem}${p.day.branch}일</b>. 생년월일을 한 번 알려 주면, 골목 어느 가게에서든 기억해 둘게요.</p>
          <a class="btn small primary" href="unse.html#today">오늘의 운세 보러 가기</a>`}
      </div>`;
  }

  function buildProfile() {
    const prof = D.profile();
    const el = document.getElementById('regular');
    if (!prof) { el.innerHTML = ''; return; }
    el.innerHTML = `<span class="tag">단골 손님 · ${D.esc(D.describeProfile(prof))}</span> <button class="btn small" id="forget">정보 지우기</button>`;
    el.querySelector('#forget').onclick = () => { if (confirm('저장된 생년월일 정보를 이 기기에서 지울까요?')) { localStorage.removeItem('dalbit:profile'); buildProfile(); buildToday(); } };
  }

  D.topbar();
  buildShops();
  buildToday();
  buildProfile();
  D.particles(document.getElementById('sky'), 'star');
})();
