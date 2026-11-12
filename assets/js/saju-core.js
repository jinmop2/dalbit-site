/* 달빛골목 — 사주 분석 엔진
 * 네 기둥(연·월·일·시)은 manseryeok(KASI 정본 절입표·음력) 으로 세우고,
 * 그 위에 십성·지장간·12운성·12신살·귀인/살·합충형파해·신강약·용신·격국·대운·세운을 얹는다.
 * 브라우저(window.SajuCore)와 node(require) 양쪽에서 쓴다. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('manseryeok'));
  else root.SajuCore = factory(root.Manseryeok);
})(typeof self !== 'undefined' ? self : this, function (M) {
  'use strict';

  const STEMS = '갑을병정무기경신임계'.split('');
  const STEMS_H = '甲乙丙丁戊己庚辛壬癸'.split('');
  const BRANCHES = '자축인묘진사오미신유술해'.split('');
  const BRANCHES_H = '子丑寅卯辰巳午未申酉戌亥'.split('');
  const ANIMALS = ['쥐', '소', '호랑이', '토끼', '용', '뱀', '말', '양', '원숭이', '닭', '개', '돼지'];
  const ELEMENTS = ['목', '화', '토', '금', '수'];
  const ELEMENTS_H = { 목: '木', 화: '火', 토: '土', 금: '金', 수: '水' };
  const STEM_EL = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4];
  const BRANCH_EL = [4, 2, 0, 0, 2, 1, 1, 2, 3, 3, 2, 4];
  // 지장간 [천간, 일수] — 여기·중기·정기 순 (마지막이 정기)
  const HIDDEN = [
    [['임', 10], ['계', 20]],
    [['계', 9], ['신', 3], ['기', 18]],
    [['무', 7], ['병', 7], ['갑', 16]],
    [['갑', 10], ['을', 20]],
    [['을', 9], ['계', 3], ['무', 18]],
    [['무', 7], ['경', 7], ['병', 16]],
    [['병', 10], ['기', 9], ['정', 11]],
    [['정', 9], ['을', 3], ['기', 18]],
    [['무', 7], ['임', 7], ['경', 16]],
    [['경', 10], ['신', 20]],
    [['신', 9], ['정', 3], ['무', 18]],
    [['무', 7], ['갑', 7], ['임', 16]],
  ];
  const TEN_GODS = ['비견', '겁재', '식신', '상관', '편재', '정재', '편관', '정관', '편인', '정인'];
  const TEN_GODS_H = { 비견: '比肩', 겁재: '劫財', 식신: '食神', 상관: '傷官', 편재: '偏財', 정재: '正財', 편관: '偏官', 정관: '正官', 편인: '偏印', 정인: '正印' };
  const GROUP_OF = { 비견: '비겁', 겁재: '비겁', 식신: '식상', 상관: '식상', 편재: '재성', 정재: '재성', 편관: '관성', 정관: '관성', 편인: '인성', 정인: '인성' };
  const GROUPS = ['비겁', '식상', '재성', '관성', '인성'];
  const TWELVE = ['장생', '목욕', '관대', '건록', '제왕', '쇠', '병', '사', '묘', '절', '태', '양'];
  const TWELVE_START = [11, 6, 2, 9, 2, 9, 5, 0, 8, 3]; // 천간별 장생 지지
  const SINSAL12 = ['지살', '년살', '월살', '망신살', '장성살', '반안살', '역마살', '육해살', '화개살', '겁살', '재살', '천살'];
  const POS = ['year', 'month', 'day', 'hour'];
  const POS_KO = { year: '년주', month: '월주', day: '일주', hour: '시주' };
  const PALACE = {
    year: '조상·유년기',
    month: '부모·형제·사회·청년기',
    day: '나 자신·배우자·중년기',
    hour: '자녀·결실·말년',
  };
  // 『궁통보감(窮通寶鑑)』 조후용신표 — 일간별·태어난 달별로 먼저 쓸 천간(앞이 우선)
  const JOHU = {
    갑: { 인: '병계', 묘: '경병정무기', 진: '경정임', 사: '계경정', 오: '계경정', 미: '계경정', 신: '경정임', 유: '경정병', 술: '경갑정임계', 해: '경정병무', 자: '정경병', 축: '정경병' },
    을: { 인: '병계', 묘: '병계', 진: '계병무', 사: '계', 오: '계병', 미: '계병', 신: '병계기', 유: '계병정', 술: '계신', 해: '병무', 자: '병', 축: '병' },
    병: { 인: '임경', 묘: '임기', 진: '임갑', 사: '임계경', 오: '임경', 미: '임경', 신: '임무', 유: '임계', 술: '갑임', 해: '갑무경임', 자: '임무기', 축: '임갑' },
    정: { 인: '갑경', 묘: '경갑', 진: '갑경', 사: '갑경', 오: '임경계', 미: '갑임경', 신: '갑경병무', 유: '갑경병무', 술: '갑경무', 해: '갑경', 자: '갑경', 축: '갑경' },
    무: { 인: '병갑계', 묘: '병갑계', 진: '갑병계', 사: '갑병계', 오: '임갑병', 미: '계병갑', 신: '병계갑', 유: '병계', 술: '갑병계', 해: '갑병', 자: '병갑', 축: '병갑' },
    기: { 인: '병경갑', 묘: '갑계병', 진: '병계갑', 사: '계병', 오: '계병', 미: '계병', 신: '병계', 유: '병계', 술: '갑병계', 해: '병갑무', 자: '병갑무', 축: '병갑무' },
    경: { 인: '무갑임병정', 묘: '정갑경병', 진: '갑정임계', 사: '임무병정', 오: '임계', 미: '정갑', 신: '정갑', 유: '정갑병', 술: '갑임', 해: '정병', 자: '정갑병', 축: '병정갑' },
    신: { 인: '기임경', 묘: '임갑', 진: '임갑', 사: '임갑계', 오: '임기계', 미: '임경갑', 신: '임갑무', 유: '임갑', 술: '임갑', 해: '임병', 자: '병무임갑', 축: '임무기' },
    임: { 인: '경병무', 묘: '무신경', 진: '갑경', 사: '임신경계', 오: '계경신', 미: '신갑', 신: '무정', 유: '갑경', 술: '갑병', 해: '무병경', 자: '무병', 축: '병정갑' },
    계: { 인: '신병', 묘: '경신', 진: '병신갑', 사: '신', 오: '경신임계', 미: '경신임계', 신: '정', 유: '신병', 술: '신갑임계', 해: '경신무정', 자: '병신', 축: '병정' },
  };
  const SEASON = { 인: '이른 봄(寅月)', 묘: '한봄(卯月)', 진: '늦봄(辰月)', 사: '초여름(巳月)', 오: '한여름(午月)', 미: '늦여름(未月)', 신: '초가을(申月)', 유: '한가을(酉月)', 술: '늦가을(戌月)', 해: '초겨울(亥月)', 자: '한겨울(子月)', 축: '늦겨울(丑月)' };
  // 출생지 경도 (진태양시 보정용)
  const PLACES = [
    ['서울', 126.978], ['인천', 126.705], ['수원', 127.029], ['춘천', 127.730], ['강릉', 128.876],
    ['청주', 127.489], ['대전', 127.385], ['천안', 127.114], ['전주', 127.148], ['광주', 126.852],
    ['목포', 126.392], ['대구', 128.601], ['포항', 129.343], ['울산', 129.311], ['부산', 129.075],
    ['창원', 128.681], ['진주', 128.108], ['제주', 126.531], ['평양', 125.762], ['해외/모름', 127.5],
  ];

  // 조사 (받침 있으면 앞, 없으면 뒤)
  const bat = w => { const t = String(w), c = t.charCodeAt(t.length - 1); return c >= 0xac00 && c <= 0xd7a3 ? (c - 0xac00) % 28 : 0; };
  const jo = (w, p) => w + ({ 이가: ['이', '가'], 과와: ['과', '와'], 을를: ['을', '를'], 은는: ['은', '는'] }[p][bat(w) ? 0 : 1]);
  const si = s => STEMS.indexOf(s);
  const bi = b => BRANCHES.indexOf(b);
  const stemEl = s => ELEMENTS[STEM_EL[si(s)]];
  const branchEl = b => ELEMENTS[BRANCH_EL[bi(b)]];
  const stemYang = s => si(s) % 2 === 0;
  const elIdx = e => ELEMENTS.indexOf(e);
  const mainQi = b => HIDDEN[bi(b)][HIDDEN[bi(b)].length - 1][0];

  // 일간(dm) 기준으로 대상 천간의 십성
  function tenGod(dm, target) {
    const a = STEM_EL[si(dm)], b = STEM_EL[si(target)];
    const same = stemYang(dm) === stemYang(target);
    const d = (b - a + 5) % 5;
    return TEN_GODS[d * 2 + (same ? 0 : 1)];
  }
  const branchTenGod = (dm, b) => tenGod(dm, mainQi(b));
  // 일간 오행과 대상 오행 사이의 십성 그룹
  function groupOfElement(dmEl, el) {
    return GROUPS[(elIdx(el) - elIdx(dmEl) + 5) % 5];
  }
  function elementOfGroup(dmEl, group) {
    return ELEMENTS[(elIdx(dmEl) + GROUPS.indexOf(group)) % 5];
  }
  function twelveStage(stem, branch) {
    const s = si(stem), b = bi(branch), st = TWELVE_START[s];
    const k = s % 2 === 0 ? (b - st + 12) % 12 : (st - b + 12) % 12;
    return TWELVE[k];
  }
  // 삼합 기준 12신살 (기준 지지 = 년지 또는 일지)
  function sinsal12(baseBranch, branch) {
    // 삼합 그룹의 생지가 지살: 인오술→인, 신자진→신, 사유축→사, 해묘미→해
    const groupStart = [8, 5, 2, 11][bi(baseBranch) % 4];
    return SINSAL12[(bi(branch) - groupStart + 12) % 12];
  }
  const ganjiIdx = (s, b) => { for (let i = 0; i < 60; i++) if (i % 10 === si(s) && i % 12 === bi(b)) return i; return -1; };
  const hanja = p => STEMS_H[si(p.stem)] + BRANCHES_H[bi(p.branch)];

  /* ---------- 관계(합충형파해) ---------- */
  const STEM_HAP = [[0, 5, '토'], [1, 6, '금'], [2, 7, '수'], [3, 8, '목'], [4, 9, '화']];
  const STEM_CHUNG = [[0, 6], [1, 7], [2, 8], [3, 9]];
  const YUKHAP = [[0, 1, '토'], [2, 11, '목'], [3, 10, '화'], [4, 9, '금'], [5, 8, '수'], [6, 7, '화']];
  const SAMHAP = [[8, 0, 4, '수'], [11, 3, 7, '목'], [2, 6, 10, '화'], [5, 9, 1, '금']];
  const BANGHAP = [[2, 3, 4, '목'], [5, 6, 7, '화'], [8, 9, 10, '금'], [11, 0, 1, '수']];
  const HYUNG_PAIRS = [[2, 5, '무은지형'], [5, 8, '무은지형'], [2, 8, '무은지형'], [1, 10, '지세지형'], [10, 7, '지세지형'], [1, 7, '지세지형'], [0, 3, '무례지형']];
  const SELF_HYUNG = [4, 6, 9, 11];
  const PA = [[0, 9], [1, 4], [2, 11], [3, 6], [5, 8], [7, 10]];
  const HAE = [[0, 7], [1, 6], [2, 5], [3, 4], [8, 11], [9, 10]];
  const WONJIN = [[0, 7], [1, 6], [2, 9], [3, 8], [4, 11], [5, 10]];
  const GWIMUN = [[0, 9], [1, 6], [2, 7], [3, 8], [4, 11], [5, 10]];
  const pairIn = (list, a, b) => list.find(p => (p[0] === a && p[1] === b) || (p[0] === b && p[1] === a));

  // 두 지지 사이의 관계 목록
  function branchRelations(b1, b2) {
    const a = bi(b1), b = bi(b2), out = [];
    let p;
    if ((p = pairIn(YUKHAP, a, b))) out.push({ type: '육합', el: p[2] });
    for (const s of SAMHAP) if (a !== b && s.slice(0, 3).includes(a) && s.slice(0, 3).includes(b)) { out.push({ type: '삼합', el: s[3] }); break; }
    if (Math.abs(a - b) === 6) out.push({ type: '충' });
    if ((p = pairIn(HYUNG_PAIRS, a, b))) out.push({ type: '형', sub: p[2] });
    if (a === b && SELF_HYUNG.includes(a)) out.push({ type: '형', sub: '자형' });
    if (pairIn(PA, a, b)) out.push({ type: '파' });
    if (pairIn(HAE, a, b)) out.push({ type: '해' });
    if (pairIn(WONJIN, a, b)) out.push({ type: '원진' });
    if (pairIn(GWIMUN, a, b)) out.push({ type: '귀문' });
    return out;
  }
  function stemRelations(s1, s2) {
    const a = si(s1), b = si(s2), out = [];
    let p;
    if ((p = pairIn(STEM_HAP, a, b))) out.push({ type: '천간합', el: p[2] });
    if (pairIn(STEM_CHUNG, a, b)) out.push({ type: '천간충' });
    return out;
  }

  /* ---------- 신살 ---------- */
  const CHEONEUL = { 갑: '축미', 무: '축미', 경: '축미', 을: '자신', 기: '자신', 병: '해유', 정: '해유', 신: '인오', 임: '묘사', 계: '묘사' };
  const MUNCHANG = { 갑: '사', 을: '오', 병: '신', 정: '유', 무: '신', 기: '유', 경: '해', 신: '자', 임: '인', 계: '묘' };
  const YANGIN = { 갑: '묘', 병: '오', 무: '오', 경: '유', 임: '자' };
  const HONGYEOM = { 갑: '오', 을: '신', 병: '인', 정: '미', 무: '진', 기: '진', 경: '술', 신: '유', 임: '자', 계: '신' };
  const GOEGANG = ['경진', '경술', '임진', '임술', '무술'];
  const BAEKHO = ['갑진', '을미', '병술', '정축', '무진', '임술', '계축'];
  // 월덕귀인(월지 삼합 → 천간), 천덕귀인(월지 → 천간/지지)
  const WOLDEOK = { 인: '병', 오: '병', 술: '병', 신: '임', 자: '임', 진: '임', 해: '갑', 묘: '갑', 미: '갑', 사: '경', 유: '경', 축: '경' };
  const CHEONDEOK = { 인: '정', 묘: '신', 진: '임', 사: '신', 오: '해', 미: '갑', 신: '계', 유: '인', 술: '병', 해: '을', 자: '사', 축: '경' };

  const HAKDANG = { 갑: '해', 을: '오', 병: '인', 정: '유', 무: '인', 기: '유', 경: '사', 신: '자', 임: '신', 계: '묘' };
  const GEUMYEO = { 갑: '진', 을: '사', 병: '미', 정: '신', 무: '미', 기: '신', 경: '술', 신: '해', 임: '축', 계: '인' };
  const AMROK = { 갑: '해', 을: '술', 병: '신', 정: '미', 무: '신', 기: '미', 경: '사', 신: '진', 임: '인', 계: '축' };
  // 고신·과숙: 년지의 방합(계절) 기준
  const GOSIN = { 해: ['인', '술'], 자: ['인', '술'], 축: ['인', '술'], 인: ['사', '축'], 묘: ['사', '축'], 진: ['사', '축'], 사: ['신', '진'], 오: ['신', '진'], 미: ['신', '진'], 신: ['해', '미'], 유: ['해', '미'], 술: ['해', '미'] };
  function findSinsal(P, hasHour) {
    const out = [];
    const dm = P.day.stem;
    const used = POS.filter(k => hasHour || k !== 'hour');
    const add = (name, where, extra) => {
      const ex = out.find(o => o.name === name);
      if (ex) { for (const w of where) if (!ex.where.includes(w)) ex.where.push(w); }
      else out.push(Object.assign({ name, where: where.slice() }, extra || {}));
    };
    // 천을귀인·문창·양인·홍염: 일간 기준으로 네 지지를 본다
    for (const k of used) {
      const b = P[k].branch;
      if (CHEONEUL[dm].includes(b)) add('천을귀인', [k]);
      if (MUNCHANG[dm] === b) add('문창귀인', [k]);
      if (YANGIN[dm] === b) add('양인살', [k]);
      if (HONGYEOM[dm] === b) add('홍염살', [k]);
      if (HAKDANG[dm] === b) add('학당귀인', [k]);
      if (GEUMYEO[dm] === b) add('금여록', [k]);
      if (AMROK[dm] === b) add('암록', [k]);
    }
    // 천의성: 월지 바로 앞 지지 / 고신·과숙: 년지 계절 기준
    const cheonui = BRANCHES[(bi(P.month.branch) + 11) % 12];
    const [gosin, gwasuk] = GOSIN[P.year.branch];
    for (const k of used) {
      if (k !== 'month' && P[k].branch === cheonui) add('천의성', [k]);
      if (k !== 'year' && P[k].branch === gosin) add('고신살', [k]);
      if (k !== 'year' && P[k].branch === gwasuk) add('과숙살', [k]);
    }
    // 현침살: 바늘 모양 글자(甲·辛·卯·午·申)가 둘 이상
    const needle = [];
    for (const k of used) { if ('갑신'.includes(P[k].stem) && (P[k].stem === '갑' || P[k].stem === '신')) needle.push(k); if (['묘', '오', '신'].includes(P[k].branch)) needle.push(k); }
    if (needle.length >= 2) add('현침살', [...new Set(needle)]);
    // 도화·역마·화개: 년지와 일지 두 기준
    for (const base of ['year', 'day']) {
      for (const k of used) {
        if (k === base) continue;
        const name = sinsal12(P[base].branch, P[k].branch);
        if (name === '년살') add('도화살', [k]);
        if (name === '역마살') add('역마살', [k]);
        if (name === '화개살') add('화개살', [k]);
      }
    }
    // 괴강·백호 (기둥 단위)
    if (GOEGANG.includes(P.day.stem + P.day.branch)) add('괴강살', ['day']);
    for (const k of used) if (BAEKHO.includes(P[k].stem + P[k].branch)) add('백호살', [k]);
    // 월덕·천덕: 월지 기준, 천간에 있으면
    const md = P.month.branch;
    for (const k of used) {
      if (WOLDEOK[md] === P[k].stem) add('월덕귀인', [k]);
      const cd = CHEONDEOK[md];
      if (cd === P[k].stem || (k !== 'month' && cd === P[k].branch)) add('천덕귀인', [k]);
    }
    // 원진·귀문 (지지 쌍)
    for (let i = 0; i < used.length; i++) for (let j = i + 1; j < used.length; j++) {
      const a = bi(P[used[i]].branch), b = bi(P[used[j]].branch);
      if (pairIn(WONJIN, a, b)) add('원진살', [used[i], used[j]]);
      if (pairIn(GWIMUN, a, b)) add('귀문관살', [used[i], used[j]]);
    }
    return out;
  }

  /* ---------- 오행 세력과 신강약 ---------- */
  const W_STEM = { year: 0.7, month: 1.0, hour: 0.9 };
  const W_BRANCH = { year: 0.9, month: 2.5, day: 1.4, hour: 1.0 };

  function elementPower(P, hasHour) {
    const pw = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
    const count = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
    for (const k of POS) {
      if (k === 'hour' && !hasHour) continue;
      count[stemEl(P[k].stem)]++;
      count[branchEl(P[k].branch)]++;
      if (k !== 'day') pw[stemEl(P[k].stem)] += W_STEM[k];
      const hs = HIDDEN[bi(P[k].branch)];
      const tot = hs.reduce((s, h) => s + h[1], 0);
      for (const [s, d] of hs) pw[stemEl(s)] += W_BRANCH[k] * d / tot;
    }
    // 합의 힘: 세 지지가 다 모인 삼합·방합은 그 오행을 크게, 왕지(자오묘유)가 낀 반합은 조금 키운다
    const bset = POS.filter(k => P[k] && (k !== 'hour' || hasHour)).map(k => bi(P[k].branch));
    const boost = [];
    for (const sh of SAMHAP) {
      const have = sh.slice(0, 3).filter(x => bset.includes(x));
      if (have.length === 3) { pw[sh[3]] += 1.6; boost.push({ type: '삼합국', el: sh[3] }); }
      else if (have.length === 2 && have.includes(sh[1])) { pw[sh[3]] += 0.6; boost.push({ type: '반합', el: sh[3] }); }
    }
    for (const bh of BANGHAP) if (bh.slice(0, 3).every(x => bset.includes(x))) { pw[bh[3]] += 1.2; boost.push({ type: '방합국', el: bh[3] }); }
    // 일간 자신도 세력에 넣어 백분율을 만든다(표시용)
    const shown = Object.assign({}, pw);
    shown[stemEl(P.day.stem)] += 1.0;
    const sum = Object.values(shown).reduce((a, b) => a + b, 0);
    const pct = {};
    for (const e of ELEMENTS) pct[e] = Math.round(shown[e] / sum * 1000) / 10;
    return { raw: pw, count, pct, boost };
  }

  // 지지 세력 비율의 분포로 맞춘 경계(tools/check.js 의 무작위 표본으로 보정)
  const STRENGTH_CUT = [0.18, 0.33, 0.46, 0.63]; // 대략 10·25·30·25·10% 로 나뉜다
  const STRENGTH_LV = ['극신약', '신약', '중화', '신강', '극신강'];

  function strengthOf(P, hasHour, power) {
    const dmEl = stemEl(P.day.stem);
    let support = 0, total = 0;
    for (const e of ELEMENTS) {
      const g = groupOfElement(dmEl, e);
      total += power.raw[e];
      if (g === '비겁' || g === '인성') support += power.raw[e];
    }
    const ratio = total ? support / total : 0.5;
    // 득령·득지·득세
    const monthG = groupOfElement(dmEl, ELEMENTS[STEM_EL[si(mainQi(P.month.branch))]]);
    const dayG = groupOfElement(dmEl, ELEMENTS[STEM_EL[si(mainQi(P.day.branch))]]);
    const deukryeong = monthG === '비겁' || monthG === '인성';
    const deukji = dayG === '비겁' || dayG === '인성';
    const stage = twelveStage(P.day.stem, P.month.branch);
    let level = 0;
    while (level < 4 && ratio >= STRENGTH_CUT[level]) level++;
    return { ratio: Math.round(ratio * 1000) / 1000, level, name: STRENGTH_LV[level], deukryeong, deukji, monthStage: stage };
  }

  // 십성 그룹 세력
  function groupPower(dmEl, power) {
    const g = { 비겁: 0, 식상: 0, 재성: 0, 관성: 0, 인성: 0 };
    for (const e of ELEMENTS) g[groupOfElement(dmEl, e)] += power.raw[e];
    return g;
  }

  /* ---------- 일간의 뿌리(통근) ---------- */
  function rootsOf(P) {
    const dmEl = stemEl(P.day.stem), out = [];
    for (const k of POS) {
      if (!P[k]) continue;
      const hs = HIDDEN[bi(P[k].branch)];
      hs.forEach(([st], i) => {
        if (stemEl(st) !== dmEl) return;
        const main = i === hs.length - 1;
        out.push({ pos: k, branch: P[k].branch, stem: st, kind: main ? '정기' : i === 0 ? '여기' : '중기', w: (main ? 1 : 0.45) * (k === 'month' ? 1.6 : k === 'day' ? 1.25 : 1) });
      });
    }
    const score = Math.round(out.reduce((a, r) => a + r.w, 0) * 100) / 100;
    return { list: out, score, level: score >= 2 ? '강한 뿌리' : score >= 1 ? '든든한 뿌리' : score > 0 ? '가는 뿌리' : '뿌리 없음' };
  }

  /* ---------- 조후 (궁통보감) ---------- */
  function johuOf(P) {
    const list = JOHU[P.day.stem][P.month.branch].split('');
    const shownStems = ['year', 'month', 'hour'].filter(k => P[k]).map(k => P[k].stem);
    const hiddenAll = POS.filter(k => P[k]).flatMap(k => HIDDEN[bi(P[k].branch)].map(h => h[0]));
    const items = list.map(st => ({ stem: st, stemH: STEMS_H[si(st)], el: stemEl(st), tg: tenGod(P.day.stem, st), shown: shownStems.includes(st), hidden: !shownStems.includes(st) && hiddenAll.includes(st) }));
    const f = items[0];
    const grade = f.shown ? 3 : f.hidden || items.slice(1, 3).some(x => x.shown) ? 2 : 1;
    return { items, grade, season: SEASON[P.month.branch] };
  }

  /* ---------- 용신: 억부·조후·통관을 함께 저울질, 극단이면 종격 ---------- */
  const HOT = [5, 6, 7], COLD = [11, 0, 1];
  function yongsinOf(P, strength, gp, power, johu, roots) {
    const dmEl = stemEl(P.day.stem), pct = power.pct, mb = bi(P.month.branch);
    const fin = (el, method, reason, extra) => {
      let huisin = ELEMENTS[(elIdx(el) + 4) % 5];
      if (pct[huisin] >= 38 && method !== '종격') huisin = ELEMENTS[(elIdx(el) + 1) % 5];
      const gisin = ELEMENTS[(elIdx(el) + 3) % 5];
      const j1 = johu.items[0];
      const johuCompat = { el: j1.el, stems: johu.items.slice(0, 3).map(x => x.stem), why: `『궁통보감』은 ${johu.season}에 태어난 ${P.day.stem}${dmEl}에게 ${johu.items.slice(0, 3).map(x => x.stemH + '(' + x.stem + ')').join('·')}${jo(johu.items.slice(0, 3).slice(-1)[0].stem, '을를').slice(-1)} 먼저 쓰라 했네` };
      return Object.assign({ el, group: groupOfElement(dmEl, el), reason, method, huisin, gisin, johu: johuCompat }, extra || {});
    };
    // 1) 종격: 한쪽으로 크게 치우쳐 거스를 수 없을 때
    const drainTop = ['식상', '재성', '관성'].sort((a, b) => gp[b] - gp[a])[0];
    if (strength.ratio < 0.11 && roots.score < 0.5) {
      const name = { 식상: '종아격', 재성: '종재격', 관성: '종살격' }[drainTop];
      return fin(elementOfGroup(dmEl, drainTop), '종격', `일간의 뿌리가 거의 없고 ${drainTop}의 기운이 사주를 뒤덮었으니, 억지로 버티기보다 그 큰 흐름을 따르는 ${name}(從格)으로 보네`, { jong: name });
    }
    if (strength.ratio > 0.82 && gp.관성 < 0.45) {
      const grp = gp.인성 > gp.비겁 ? '인성' : '비겁';
      const name = grp === '인성' ? '종강격' : '종왕격';
      return fin(elementOfGroup(dmEl, grp), '종격', `나를 돕는 기운이 사주를 가득 채워 거스를 것이 없으니, 그 왕성한 흐름을 따르는 ${name}(從格)으로 보네`, { jong: name });
    }
    // 2) 억부
    let eok, eokReason;
    if (strength.level <= 1) {
      if (drainTop === '재성') { eok = '비겁'; eokReason = '재성이 무거워 일간이 감당하기 벅차니, 같은 기운(비겁)으로 힘을 보태야 하네'; }
      else { eok = '인성'; eokReason = drainTop === '관성' ? '관살의 압박이 크니 인성으로 그 힘을 받아 일간을 살려야 하네(살인상생)' : '식상으로 힘이 많이 빠지니 인성으로 근원을 채워야 하네'; }
    } else if (strength.level >= 3) {
      if (gp.인성 > gp.비겁) { eok = '재성'; eokReason = '인성이 지나쳐 기운이 고이니 재성으로 인성을 덜어내야 하네'; }
      else if (gp.관성 >= gp.식상 && gp.관성 > 0.6) { eok = '관성'; eokReason = '비겁이 많아 다투는 형국이니 관성으로 질서를 세워야 하네'; }
      else { eok = '식상'; eokReason = '넘치는 힘을 식상으로 흘려보내야 재능이 꽃피네'; }
    } else {
      const weakest = ELEMENTS.slice().sort((a, b) => gp[groupOfElement(dmEl, a)] - gp[groupOfElement(dmEl, b)])[0];
      eok = groupOfElement(dmEl, weakest); eokReason = '전체가 고르게 짜여 있으니 가장 모자란 기운을 채워 균형을 지키면 되네';
    }
    const eEl = elementOfGroup(dmEl, eok);
    // 3) 저울질
    const score = {}; for (const e of ELEMENTS) score[e] = 0;
    score[eEl] += 3; score[ELEMENTS[(elIdx(eEl) + 4) % 5]] += 0.8;
    const seasonal = HOT.includes(mb) || COLD.includes(mb);
    const [j1, j2] = johu.items;
    score[j1.el] += seasonal ? 2.6 : 1.5;
    // 한겨울에 불이 전혀 없거나 한여름에 물이 전혀 없으면 조후가 급하다(調候爲急)
    const urgent = (COLD.includes(mb) && pct.화 < 5) || (HOT.includes(mb) && pct.수 < 5);
    if (urgent) score[COLD.includes(mb) ? '화' : '수'] += 2.4;
    if (j2) score[j2.el] += 0.9;
    let tong = null;
    const sorted = ELEMENTS.slice().sort((a, b) => pct[b] - pct[a]);
    const [a1, a2] = sorted;
    if (pct[a1] >= 26 && pct[a2] >= 22) {
      const ia = elIdx(a1), ib = elIdx(a2);
      let ctrl = null, ctd = null;
      if ((ia + 2) % 5 === ib) { ctrl = a1; ctd = a2; } else if ((ib + 2) % 5 === ia) { ctrl = a2; ctd = a1; }
      if (ctrl) { const mid = ELEMENTS[(elIdx(ctrl) + 1) % 5]; score[mid] += 1.4; tong = { el: mid, a: ctrl, b: ctd }; }
    }
    for (const e of ELEMENTS) if (pct[e] >= 36) score[e] -= 1.8;
    const best = ELEMENTS.slice().sort((x, y) => score[y] - score[x])[0];
    const method = best === eEl && best === j1.el ? '억부·조후' : best === eEl ? '억부' : best === j1.el ? '조후' : tong && best === tong.el ? '통관' : '억부';
    const why = [];
    why.push(`억부로 보면 ${eokReason}(→ ${eEl}).`);
    why.push(`조후로 보면 ${johu.season}이라 ${jo(j1.stem + j1.el + (j2 ? '·' + j2.stem + j2.el : ''), '이가')} 먼저 필요하네(→ ${j1.el}).${urgent ? (COLD.includes(mb) ? ' 더구나 한겨울인데 불이 하나도 없으니 볕이 무엇보다 급하네(조후위급).' : ' 더구나 한여름인데 물이 하나도 없으니 물이 무엇보다 급하네(조후위급).') : ''}`);
    if (tong) why.push(`또 ${jo(tong.a, '과와')} ${jo(tong.b, '이가')} 크게 맞서니 둘 사이에 ${tong.el}${tong.el === '목' || tong.el === '금' ? '으로' : '로'} 다리를 놓는 통관(通關)도 생각해야 하네.`);
    return fin(best, method, why.join(' '), { eok: { el: eEl, group: eok, reason: eokReason }, tong, score, urgent });
  }

  /* ---------- 격국 (월지 기준, 투출 우선) ---------- */
  function gyeokOf(P) {
    const dm = P.day.stem;
    const hs = HIDDEN[bi(P.month.branch)].map(h => h[0]);
    const stems = [P.year.stem, P.month.stem, P.hour ? P.hour.stem : null].filter(Boolean);
    // 비겁이 아닌 지장간 중 천간에 드러난(투출) 것을 정기→여기 순으로 먼저 잡고, 없으면 정기
    let pick = null;
    for (let i = hs.length - 1; i >= 0; i--) {
      if (GROUP_OF[tenGod(dm, hs[i])] === '비겁') continue;
      if (stems.includes(hs[i])) { pick = hs[i]; break; }
    }
    if (!pick) pick = hs[hs.length - 1];
    const tg = tenGod(dm, pick);
    if (tg === '비견') return { name: '건록격', tg };
    if (tg === '겁재') return { name: stemYang(dm) ? '양인격' : '월겁격', tg };
    return { name: tg + '격', tg };
  }

  /* ---------- 대운·세운·월운 ---------- */
  function pillarAt(date) {
    // date: KST 기준 연월일시
    const r = M.calculateFourPillars({ year: date.y, month: date.m, day: date.d, hour: date.h || 12, minute: date.mi || 0 });
    return {
      year: { stem: r.year.heavenlyStem, branch: r.year.earthlyBranch },
      month: { stem: r.month.heavenlyStem, branch: r.month.earthlyBranch },
      day: { stem: r.day.heavenlyStem, branch: r.day.earthlyBranch },
    };
  }
  function describePillar(dm, p) {
    return {
      stem: p.stem, branch: p.branch, hanja: hanja(p),
      stemEl: stemEl(p.stem), branchEl: branchEl(p.branch),
      stemTG: tenGod(dm, p.stem), branchTG: branchTenGod(dm, p.branch),
      stage: twelveStage(dm, p.branch),
    };
  }
  function kstNow() {
    const n = new Date(Date.now() + 9 * 3600e3);
    return { y: n.getUTCFullYear(), m: n.getUTCMonth() + 1, d: n.getUTCDate(), h: n.getUTCHours(), mi: n.getUTCMinutes() };
  }
  // 그 해 절기 달(인월~축월)의 경계와 월주
  function monthsOfYear(year) {
    const terms = M.getSolarTermsOfYear(year).concat(M.getSolarTermsOfYear(year + 1));
    const out = [];
    // 절(節)만: 입춘(2) 경칩(4) 청명(6) 입하(8) 망종(10) 소서(12) 입추(14) 백로(16) 한로(18) 입동(20) 대설(22) 다음해 소한(0)
    const jeol = [];
    for (let i = 0; i < terms.length; i++) if (terms[i].index % 2 === 0) jeol.push(terms[i]);
    const start = jeol.findIndex(t => t.index === 2 && kstYear(t.date) === year);
    for (let k = 0; k < 12; k++) {
      const a = jeol[start + k], b = jeol[start + k + 1];
      const mid = new Date((a.date.getTime() + b.date.getTime()) / 2 + 9 * 3600e3);
      const p = pillarAt({ y: mid.getUTCFullYear(), m: mid.getUTCMonth() + 1, d: mid.getUTCDate(), h: 12 });
      out.push({ from: a.date, to: b.date, term: a.name, stem: p.month.stem, branch: p.month.branch });
    }
    return out;
  }
  function kstYear(d) { return new Date(d.getTime() + 9 * 3600e3).getUTCFullYear(); }
  function yearPillar(year) {
    const p = pillarAt({ y: year, m: 7, d: 1, h: 12 });
    return p.year;
  }

  /* ---------- 진태양시 보정 표시용 ---------- */
  function seoulOffsetMinutes(y, m, d, h, mi) {
    // 그 순간 Asia/Seoul 의 UTC 오프셋(분). 서머타임·1954~61년 UTC+8:30 판별용.
    try {
      const guess = Date.UTC(y, m - 1, d, h - 9, mi);
      const f = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Seoul', hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' });
      const parts = Object.fromEntries(f.formatToParts(new Date(guess)).map(p => [p.type, p.value]));
      const asUtc = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute);
      return Math.round((asUtc - guess) / 60000);
    } catch (e) { return 540; }
  }

  /* ---------- 종합 분석 ---------- */
  function analyze(input) {
    const hasHour = !input.timeUnknown;
    const lon = input.longitude == null ? 127.5 : input.longitude;
    let solar = { y: input.year, m: input.month, d: input.day };
    let lunar = null;
    if (input.isLunar) {
      const s = M.lunarToSolar(input.year, input.month, input.day, !!input.isLeapMonth);
      solar = { y: s.year, m: s.month, d: s.day };
      lunar = { y: input.year, m: input.month, d: input.day, leap: !!input.isLeapMonth };
    } else {
      const l = M.solarToLunar(input.year, input.month, input.day);
      lunar = { y: l.year, m: l.month, d: l.day, leap: !!l.isLeapMonth };
    }
    const hour = hasHour ? input.hour : 12, minute = hasHour ? input.minute : 0;
    const opts = {
      year: solar.y, month: solar.m, day: solar.d, hour, minute,
      gender: input.gender === 'female' ? 'female' : 'male',
      dayBoundary: input.dayBoundary || 'midnight',
    };
    if (hasHour && input.trueSolar !== false) {
      opts.trueSolarTime = { longitude: lon, applyEquationOfTime: true, applyHistoricalDst: true };
    } else {
      // 시를 모르면 보정 없이 일주까지만, 연·월주는 서머타임만 보정
      opts.trueSolarTime = { longitude: 135, applyEquationOfTime: false, applyHistoricalDst: true };
    }
    const r = M.calculateFourPillars(opts);
    const P = {};
    for (const k of POS) P[k] = { stem: r[k].heavenlyStem, branch: r[k].earthlyBranch };
    if (!hasHour) delete P.hour;
    const dm = P.day.stem;
    const dmEl = stemEl(dm);

    // 보정 설명
    let correction = null;
    if (hasHour) {
      const off = seoulOffsetMinutes(solar.y, solar.m, solar.d, hour, minute);
      const lonMin = input.trueSolar === false ? 0 : (lon - 135) * 4;
      const eot = input.trueSolar === false ? 0 : (M.equationOfTimeMinutes ? M.equationOfTimeMinutes(new Date(Date.UTC(solar.y, solar.m - 1, solar.d, hour - 9, minute))) : 0);
      const dst = off - 540; // 표준시와 서머타임으로 앞당겨진 분
      const total = Math.round(-dst + lonMin + eot);
      let t = hour * 60 + minute + total;
      t = ((t % 1440) + 1440) % 1440;
      correction = {
        offset: off, dstMin: dst, lonMin: Math.round(lonMin), eotMin: Math.round(eot * 10) / 10,
        totalMin: total, solarTime: `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`,
      };
    }

    const pillars = {};
    for (const k of POS) {
      if (!P[k]) continue;
      const p = P[k];
      const hidden = HIDDEN[bi(p.branch)];
      const tot = hidden.reduce((s, h) => s + h[1], 0);
      pillars[k] = {
        key: k, label: POS_KO[k], palace: PALACE[k],
        stem: p.stem, branch: p.branch, stemH: STEMS_H[si(p.stem)], branchH: BRANCHES_H[bi(p.branch)],
        stemEl: stemEl(p.stem), branchEl: branchEl(p.branch),
        stemYang: stemYang(p.stem), branchYang: bi(p.branch) % 2 === 0,
        stemTG: k === 'day' ? '일간' : tenGod(dm, p.stem),
        branchTG: branchTenGod(dm, p.branch),
        hidden: hidden.map(([s, d]) => ({ stem: s, stemH: STEMS_H[si(s)], el: stemEl(s), tg: tenGod(dm, s), ratio: d / tot })),
        stage: twelveStage(dm, p.branch),
        selfStage: twelveStage(p.stem, p.branch),
        sinsal12: sinsal12(P.year.branch, p.branch),
        gongmang: r.voidBranches.includes(p.branch) && k !== 'day',
      };
    }

    const power = elementPower(P, hasHour);
    const strength = strengthOf(P, hasHour, power);
    const gp = groupPower(dmEl, power);
    const roots = rootsOf(P);
    const johu = johuOf(P);
    const yongsin = yongsinOf(P, strength, gp, power, johu, roots);
    const gyeok = gyeokOf(P);

    // 십성 개수 (일간 제외 7~5글자, 천간+지지 정기)
    const tgCount = {};
    for (const t of TEN_GODS) tgCount[t] = 0;
    for (const k of POS) {
      if (!pillars[k]) continue;
      if (k !== 'day') tgCount[pillars[k].stemTG]++;
      tgCount[pillars[k].branchTG]++;
    }
    const groupCount = { 비겁: 0, 식상: 0, 재성: 0, 관성: 0, 인성: 0 };
    for (const t of TEN_GODS) groupCount[GROUP_OF[t]] += tgCount[t];

    // 기둥 사이 관계
    const relations = [];
    const keys = POS.filter(k => pillars[k]);
    for (let i = 0; i < keys.length; i++) for (let j = i + 1; j < keys.length; j++) {
      const a = keys[i], b = keys[j];
      for (const rel of stemRelations(P[a].stem, P[b].stem)) relations.push(Object.assign({ a, b, chars: P[a].stem + P[b].stem, level: 'stem' }, rel));
      for (const rel of branchRelations(P[a].branch, P[b].branch)) {
        if (rel.type === '원진' || rel.type === '귀문') continue; // 신살 쪽에서 다룸
        relations.push(Object.assign({ a, b, chars: P[a].branch + P[b].branch, level: 'branch' }, rel));
      }
    }
    // 삼합·방합 완성
    const bset = keys.map(k => bi(P[k].branch));
    for (const s of SAMHAP) if (s.slice(0, 3).every(x => bset.includes(x))) relations.push({ type: '삼합국', el: s[3], chars: s.slice(0, 3).map(x => BRANCHES[x]).join(''), level: 'branch', full: true });
    for (const s of BANGHAP) if (s.slice(0, 3).every(x => bset.includes(x))) relations.push({ type: '방합국', el: s[3], chars: s.slice(0, 3).map(x => BRANCHES[x]).join(''), level: 'branch', full: true });

    const sinsal = findSinsal(P, hasHour);
    if (r.voidBranches) {
      const gw = keys.filter(k => k !== 'day' && r.voidBranches.includes(P[k].branch));
      if (gw.length) sinsal.push({ name: '공망', where: gw, branches: r.voidBranches });
    }

    // 대운
    let daeun = null;
    if (r.luckPillars) {
      const lp = r.luckPillars;
      const startMs = Date.UTC(solar.y, solar.m - 1, solar.d) + (lp.startYears * 365.2422 + lp.startMonths * 30.44 + lp.startDays) * 86400e3;
      const list = lp.pillars.map((x, i) => {
        const p = { stem: x.pillar.heavenlyStem, branch: x.pillar.earthlyBranch };
        const from = new Date(startMs + i * 10 * 365.2422 * 86400e3);
        return Object.assign(describePillar(dm, p), { age: lp.startYears + i * 10, fromYear: from.getUTCFullYear(), fromMonth: from.getUTCMonth() + 1 });
      });
      const now = kstNow();
      const nowMs = Date.UTC(now.y, now.m - 1, now.d);
      let cur = -1;
      list.forEach((x, i) => { if (Date.UTC(x.fromYear, x.fromMonth - 1, 1) <= nowMs) cur = i; });
      daeun = { forward: lp.forward, startAge: lp.startAge, startYears: lp.startYears, startMonths: lp.startMonths, startDays: lp.startDays, list, current: cur };
    }

    // 세운 (올해·내년) 과 원국과의 관계
    const now = kstNow();
    const seun = [now.y, now.y + 1].map(y => {
      const p = yearPillar(y);
      const d = describePillar(dm, p);
      const rel = [];
      for (const k of keys) {
        for (const x of branchRelations(p.branch, P[k].branch)) rel.push(Object.assign({ with: k }, x));
        for (const x of stemRelations(p.stem, P[k].stem)) rel.push(Object.assign({ with: k, stemLevel: true }, x));
      }
      return Object.assign(d, { year: y, relations: rel });
    });

    const age = now.y - solar.y; // 세는 나이 - 1 (만 나이 근사)
    return {
      input, hasHour, solar, lunar, correction,
      pillars, dm, dmEl, dmYang: stemYang(dm), dmH: STEMS_H[si(dm)],
      dayPillar: P.day.stem + P.day.branch,
      animal: ANIMALS[bi(P.year.branch)], yearBranch: P.year.branch,
      power, strength, groupPower: gp, yongsin, gyeok, tgCount, groupCount, roots, johu,
      relations, sinsal, gongmang: r.voidBranches, daeun, seun, age,
      gender: opts.gender,
    };
  }

  // 특정 날짜의 일진과 그것이 내 사주에 주는 관계 (오늘의 운세용)
  function dayInfo(dm, natal, date) {
    const p = pillarAt(date);
    const d = describePillar(dm, p.day);
    const rel = [];
    if (natal) {
      for (const k of Object.keys(natal)) {
        for (const x of branchRelations(p.day.branch, natal[k].branch)) rel.push(Object.assign({ with: k }, x));
        for (const x of stemRelations(p.day.stem, natal[k].stem)) rel.push(Object.assign({ with: k, stemLevel: true }, x));
      }
    }
    return Object.assign(d, { relations: rel, month: p.month, year: p.year });
  }

  return {
    STEMS, STEMS_H, BRANCHES, BRANCHES_H, ANIMALS, ELEMENTS, ELEMENTS_H, TEN_GODS, TEN_GODS_H, GROUP_OF, GROUPS,
    TWELVE, SINSAL12, POS, POS_KO, PALACE, PLACES, HIDDEN, JOHU, SEASON,
    si, bi, stemEl, branchEl, stemYang, tenGod, branchTenGod, groupOfElement, elementOfGroup, twelveStage, sinsal12,
    branchRelations, stemRelations, ganjiIdx, hanja, mainQi, jo,
    analyze, dayInfo, pillarAt, yearPillar, monthsOfYear, describePillar, kstNow, seoulOffsetMinutes,
    STRENGTH_CUT, STRENGTH_LV,
    lunarToSolar: M.lunarToSolar, solarToLunar: M.solarToLunar,
  };
});
