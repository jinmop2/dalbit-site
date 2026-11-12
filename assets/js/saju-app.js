/* 청운 철학관 — 상담 흐름 */
(function () {
  'use strict';
  const D = window.Dalbit, S = window.SajuCore, R = window.SajuReading, K = window.SajuData;
  D.topbar();
  const actor = window.Characters.mount('cheongun', document.getElementById('actor'));
  const dlg = D.Dialog(document.getElementById('dialog'), actor, { pitch: 300 });
  D.fitActor(document.querySelector('.stage'), 0.82); // 탁자가 가슴 높이에 오게
  const content = document.getElementById('content');
  const visits = D.load('visits:saju', 0);
  D.save('visits:saju', visits + 1);

  const show = (html, scroll = true) => { content.innerHTML = html; if (!scroll) return; if (D.isPhone()) D.scrollToEl(content, 8); else window.scrollTo({ top: 0, behavior: 'smooth' }); };

  /* ── 인사 ── */
  /* ── 등잔불: 저녁·밤엔 어두운 방에서 시작해, 선생이 말하는 순간 불을 붙인다 ── */
  const stageEl = document.querySelector('.stage');
  const lampFlame = document.querySelector('.lamp-layer .flame');
  function placeGlow() {
    const r = lampFlame.getBoundingClientRect(), sr = stageEl.getBoundingClientRect();
    if (!sr.width) return;
    stageEl.style.setProperty('--lx', ((r.left + r.width / 2 - sr.left) / sr.width * 100).toFixed(1) + '%');
    stageEl.style.setProperty('--ly', ((r.top + r.height / 2 - sr.top) / sr.height * 100).toFixed(1) + '%');
  }
  function lamp(on) {
    placeGlow();
    stageEl.classList.toggle('lit', on);
    stageEl.classList.toggle('dark', !on); // 이 방은 등잔이 꺼지면 언제나 어둑하다
    if (on) D.sfx.light(); else D.sfx.whoosh();
  }
  window.addEventListener('resize', placeGlow);
  let lampTalked = false;
  document.querySelector('.lamp-layer .hit').addEventListener('click', () => {
    const on = !stageEl.classList.contains('lit');
    lamp(on);
    if (!lampTalked) { lampTalked = true; dlg.quiet(on ? (stageEl.classList.contains('evening') ? '그래, 불이 있어야 팔자도 잘 보이지.' : '허허, 대낮에 등잔이라니. 그래도 운치는 있구먼.') : '불을 끄니 달빛이 더 잘 드는구먼.', { expr: 'smile' }); }
  });

  async function greet() {
    const t = D.timeGreeting();
    const prof = D.profile();
    // 어느 시간에 와도 어둑한 방에서 시작해, 인사 뒤 선생이 등잔에 불을 붙인다(클릭 없이 저절로)
    const dusk = ['evening', 'night', 'deep'].includes(t);
    stageEl.classList.add('dark');
    stageEl.classList.toggle('evening', dusk);
    stageEl.classList.toggle('daytime', !dusk);
    const open = {
      deep: ['이 깊은 밤에 찾아온 걸 보니, 잠 못 들 고민이 있는 게로구먼.', '잠깐, 등잔불부터 밝히고 보세.'],
      morning: ['아침 일찍 오셨구먼. 차 한 잔 우려 놓았네.', '방이 아직 어둑하니 등잔부터 밝히세.'],
      day: ['허허, 어서 오시게. 청운 철학관일세.', '이 방은 한낮에도 볕이 잘 안 들어서 말이야. 등잔부터 밝히겠네.'],
      evening: ['해 질 녘에 오셨구먼. 어둑해서 얼굴도 잘 안 보이네.', '어디, 등잔불부터 밝히겠네.'],
      night: ['달 밝은 밤이구먼. 어서 들어와 앉으시게.', '어두우니 등잔불부터 켜세.'],
    }[t];
    await dlg.quiet(open[0], { expr: 'smile' });
    await D.sleep(900);
    await dlg.quiet(open[1], { expr: 'normal' });
    await D.sleep(350);
    lamp(true);
    await D.sleep(1400);
    if (prof && visits > 0) {
      await dlg.say(`가만… 지난번에 왔던 ${prof.name ? `**${D.esc(prof.name)}** 손님` : '그 손님'} 아니신가? 얼굴이 낯익구먼.`, { expr: 'surprise', after: 'normal' });
    } else if (prof) {
      await dlg.say('골목 어귀에서 자네 생년월일을 들었다더군. 그걸로 바로 볼 수도 있네.', { expr: 'normal' });
    } else {
      await dlg.say('나는 이 골목에서 사십 년째 팔자를 봐 온 청운이라 하네. 만세력 한 권과 붓 한 자루면 사람의 사계절이 보이지.', { expr: 'normal' });
    }
    menu();
  }

  async function menu() {
    actor.set('normal');
    show(`<div class="panel menu-board"><h2>靑雲哲學館</h2><p class="muted">사주 · 궁합 · 만세력</p>
      <div class="grid2" style="text-align:left;margin-top:14px">
        <div class="mini"><h4>평생사주</h4><p class="small">초년·청년·중년·말년의 인생 4막, 전성기와 고비, 평생 재물·직업·결혼·자녀·건강을 한 편의 글로 풀어 드립니다.</p></div>
        <div class="mini"><h4>사주 풀이</h4><p class="small">여덟 글자로 타고난 성품, 오행과 용신, 십성, 신살, 대운과 올해·내년 운을 봅니다.</p></div>
        <div class="mini"><h4>궁합</h4><p class="small">두 사람의 일간·일지·띠·오행이 서로를 어떻게 돕고 부딪히는지 봅니다.</p></div>
        <div class="mini"><h4>사주 상식</h4><p class="small">사주가 무엇인지, 진태양시와 야자시는 왜 따지는지 선생이 설명합니다.</p></div>
      </div></div>`, false);
    const prof = D.profile();
    const items = [];
    if (prof) items.push({ label: `지난 정보로 보기 (${prof.name || prof.year + '년생'})`, value: 'saved', primary: true });
    if (prof) items.push({ label: '지난 정보로 평생사주', value: 'savedLife' });
    items.push({ label: prof ? '새로 입력해서 보기' : '사주 보러 왔어요', value: 'new', primary: !prof }, { label: '평생사주 보기', value: 'life' }, { label: '궁합 보러 왔어요', value: 'compat' }, { label: '사주가 뭔가요?', value: 'learn' });
    const v = await dlg.choose(items, '그래, 무엇이 궁금해서 오셨나?', { expr: 'normal' });
    if (v === 'saved') return reading(prof);
    if (v === 'savedLife') return reading(prof, 'life');
    if (v === 'new') return askBirth();
    if (v === 'life') return askBirth('life');
    if (v === 'compat') return compat();
    if (v === 'learn') return learn();
  }

  /* ── 생년월일 받기 ── */
  async function askBirth(mode) {
    show('<div class="panel" id="formbox"></div>');
    dlg.quiet('태어난 해와 달, 날과 시를 일러 주게. 시를 모르면 모른다 해도 괜찮네. 음력이면 윤달인지도 알려 주고.', { expr: 'normal' });
    let p;
    try { p = await D.birthForm(document.getElementById('formbox'), { title: '생년월일시 적기', submitLabel: '선생님, 봐 주세요', cancelLabel: '돌아가기', initial: D.profile() || undefined }); }
    catch (e) { return menu(); }
    return reading(p, mode);
  }

  /* ── 붓으로 여덟 글자 쓰기 ── */
  async function writeChars(a) {
    const cols = ['hour', 'day', 'month', 'year'].filter(k => a.pillars[k]);
    show(`<div class="panel writing"><p class="muted">만세력을 넘겨 여덟 글자를 적는 중<span class="loading-dots"></span></p>
      <div class="sheet">${cols.map(k => `<div class="col"><div class="ch" data-k="${k}s">${a.pillars[k].stemH}</div><div class="ch" data-k="${k}b">${a.pillars[k].branchH}</div><div class="lab">${S.POS_KO[k]}</div></div>`).join('')}</div></div>`);
    dlg.quiet('어디 보자… 만세력을 좀 넘겨 보세.', { expr: 'think' });
    await D.sleep(900);
    const order = cols.slice().reverse(); // 년→월→일→시 (오른쪽부터)
    for (const k of order) {
      for (const part of ['s', 'b']) {
        const el = content.querySelector(`[data-k="${k}${part}"]`);
        el.classList.add('on'); D.sfx.brush();
        await D.sleep(420);
      }
    }
    await D.sleep(500);
  }

  /* ── 풀이 ── */
  let current = null;
  async function reading(p, mode) {
    let a;
    try { a = S.analyze(Object.assign(D.toSajuInput(p), { name: p.name })); a.input.name = p.name; }
    catch (e) { console.error(e); await dlg.say('허, 만세력에 없는 날짜로구먼. 다시 한번 일러 주게.', { expr: 'surprise' }); return askBirth(); }
    await writeChars(a);
    const rd = R.build(a);
    current = { a, rd };
    const dmd = K.DM[a.dm];
    // 첫인상 한마디
    const st = a.strength.name;
    const first = {
      극신약: '여린 듯해도 사람 복으로 피어나는 사주로구먼.', 신약: '섬세하고 정이 많은 사주로구먼.', 중화: '허, 고르게 잘 짜인 사주로구먼!', 신강: '기운이 튼튼한 사주로구먼!', 극신강: '허허, 이것 참 기운이 넘치는 사주로구먼!',
    }[st];
    await dlg.say(`옳거니. ${a.dm}${a.dmEl}(${a.dmH}) 일간, ${dmd.image}이로구먼. ${first}`, { expr: 'surprise', after: 'smile' });
    if (a.correction && a.correction.dstMin) await dlg.say(`그리고 자네가 태어난 해엔 ${a.correction.dstMin === 60 ? '서머타임' : '지금과 다른 표준시'}이 쓰였네. 그만큼 시계를 되돌려 셈했으니 안심하게.`, { expr: 'normal' });
    else if (a.correction && Math.abs(a.correction.totalMin) >= 20 && a.hasHour) await dlg.say(`시계로는 ${String(a.input.hour).padStart(2, '0')}시 ${String(a.input.minute).padStart(2, '0')}분이지만, 태어난 곳의 해 기준으론 **${a.correction.solarTime}**일세. 시주는 이 진태양시로 세웠네.`, { expr: 'normal' });
    await pastGame(a, rd);
    if (mode === 'life') openLife(); else openTabs(0);
  }

  // 평생사주: 한 편의 글로 이어 읽기
  let lifeToken = 0;
  async function openLife() {
    const my = ++lifeToken;
    const { a, rd } = current;
    const L = window.SajuLife.build(a, rd.fm, R);
    const nums = '一二三四五六七八九十';
    content.innerHTML = `<div class="panel life-doc fade-in">
      <div class="life-title"><small>靑雲哲學館</small><h2>평생사주</h2><p class="muted">${D.esc(a.input.name || '손님')} · ${a.solar.y}.${a.solar.m}.${a.solar.d} · ${a.dayPillar}일주 · ${a.animal}띠</p></div>
      <nav class="life-nav">${L.chapters.map((c, i) => `<a href="#life-${c.key}" data-i="${i}">${nums[i] || i + 1}. ${c.title.split(' — ')[0]}</a>`).join('')}</nav>
      ${L.chapters.map((c, i) => `<section class="life-ch" id="life-${c.key}" data-i="${i}"><h3><span class="num">${nums[i] || i + 1}</span>${c.title}</h3>${c.html}</section>`).join('')}
      <div class="inline life-btns"><button class="btn primary" id="lcopy">📋 평생사주 복사</button><button class="btn" id="ltabs">자세한 분석 보기</button><button class="btn" id="lhome">처음으로</button></div>
    </div>`;
    if (D.isPhone()) D.scrollToEl(content, 8); else window.scrollTo({ top: 0, behavior: 'smooth' });
    content.querySelector('#lcopy').onclick = async () => { try { await navigator.clipboard.writeText(L.plain); D.toast('평생사주를 복사했어요'); } catch (e) { D.toast('복사하지 못했어요'); } };
    content.querySelector('#ltabs').onclick = () => openTabs(0);
    content.querySelector('#lhome').onclick = () => menu();
    const speak = async i => { const c = L.chapters[i]; if (!c) return; for (let k = 0; k < c.say.length - 1; k++) { await dlg.say(c.say[k], { expr: k ? 'normal' : 'think' }); if (my !== lifeToken) return; } dlg.quiet(c.say[c.say.length - 1], { expr: 'smile' }); };
    content.querySelectorAll('.life-nav a').forEach(el => el.onclick = ev => { ev.preventDefault(); D.sfx.flip(); const sec = content.querySelector('#life-' + L.chapters[+el.dataset.i].key); sec.scrollIntoView({ behavior: 'smooth', block: 'start' }); speak(+el.dataset.i); });
    // 장을 읽어 내려가면 선생이 그 장의 첫마디를 건넨다
    const told = new Set([0]);
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(es => { for (const e of es) { const i = +e.target.dataset.i; if (e.isIntersecting && !told.has(i) && my === lifeToken) { told.add(i); dlg.quiet(L.chapters[i].say[0], { expr: 'normal' }); } } }, { threshold: 0.35 });
      content.querySelectorAll('.life-ch').forEach(sec => io.observe(sec));
    }
    D.sfx.chime();
    await dlg.say('자, 이제 자네의 평생을 한 권의 책처럼 풀어 보세.', { expr: 'smile' });
    if (my !== lifeToken) return;
    speak(0);
  }

  // 철학관식 '지난 해 맞히기'
  async function pastGame(a, rd) {
    const hits = R.pastHits(a, rd.fm);
    if (!hits.length) return;
    const go = await dlg.choose([{ label: '좋아요, 맞혀 보세요', value: 'y', primary: true }, { label: '바로 풀이 볼래요', value: 'n' }], '풀이에 앞서, 자네가 지나온 해를 내가 한번 맞혀 볼까?', { expr: 'smile' });
    if (go !== 'y') return;
    const box = content.querySelector('.writing');
    if (box) box.insertAdjacentHTML('beforeend', '<div class="past-box fade-in"><h4>지나온 해 맞히기</h4><ol id="pastlist"></ol></div>');
    let hit = 0;
    for (const h of hits) {
      const ans = await dlg.choose([{ label: '맞아요!', value: 'yes' }, { label: '글쎄요', value: 'maybe' }, { label: '아니요', value: 'no' }], h.q, { expr: 'think' });
      const li = document.getElementById('pastlist');
      if (li) li.insertAdjacentHTML('beforeend', `<li><b>${h.y}년</b> — ${ans === 'yes' ? '✔ 맞음' : ans === 'no' ? '✘ 아님' : '… 글쎄'}<br><span class="muted small">${h.why}</span></li>`);
      if (ans === 'yes') { hit++; D.sfx.chime(); await dlg.say(`허허, 역시. ${h.why}`, { expr: 'smile' }); }
      else if (ans === 'maybe') await dlg.say(`기억이 가물가물하면 그해 사진첩을 한번 들춰 보게. ${h.why}`, { expr: 'normal' });
      else await dlg.say(`그런가? 그렇다면 그 기운이 겉보다 마음속 변화로 왔을 게야. ${h.why}`, { expr: 'think' });
    }
    await dlg.say(hit === hits.length ? '팔자는 속이지 못하는 법이지. 자, 이제 본격적으로 풀어 보세.' : '허허, 사람 일이 다 팔자대로만 가는 건 아니지. 그게 또 사는 재미 아닌가. 자, 이제 풀어 보세.', { expr: 'smile' });
  }

  function openTabs(idx) {
    const { rd } = current;
    const secs = rd.sections;
    content.innerHTML = `<nav class="tabs" role="tablist">${secs.map((s, i) => `<button role="tab" data-i="${i}">${s.title}</button>`).join('')}<button role="tab" data-i="life">평생사주</button><button role="tab" data-i="end">마무리</button></nav><div id="sec"></div>`;
    content.querySelectorAll('.tabs button').forEach(b => b.onclick = () => { D.sfx.flip(); b.dataset.i === 'end' ? finish() : b.dataset.i === 'life' ? openLife() : section(+b.dataset.i); });
    section(idx);
  }

  async function section(i) {
    const { rd } = current;
    const s = rd.sections[i];
    content.querySelectorAll('.tabs button').forEach(b => b.classList.toggle('on', b.dataset.i === String(i)));
    const box = document.getElementById('sec');
    const next = i < rd.sections.length - 1 ? `<button class="btn primary" id="nextSec">다음: ${rd.sections[i + 1].title} ▶</button>` : '<button class="btn primary" id="nextSec">선생님의 마무리 말씀 ▶</button>';
    box.innerHTML = `<div class="panel fade-in"><h2>${s.title}</h2>${s.html}<div class="next-sec">${next}</div></div>`;
    box.querySelector('#nextSec').onclick = () => { D.sfx.flip(); i < rd.sections.length - 1 ? section(i + 1) : finish(); };
    if (s.bind) s.bind(box, dlg);
    if (s.key === 'daeun' && s.detail) {
      box.querySelectorAll('.dcard').forEach(c => c.onclick = () => {
        box.querySelectorAll('.dcard').forEach(x => x.classList.remove('sel')); c.classList.add('sel');
        box.querySelector('.ddetail').innerHTML = s.detail(+c.dataset.i); D.sfx.pick();
      });
      const nowCard = box.querySelector('.dcard.now'), row = box.querySelector('.dcards'); if (nowCard && row) row.scrollLeft = nowCard.offsetLeft - row.offsetLeft - row.clientWidth / 2 + nowCard.clientWidth / 2;
    }
    const tabs = content.querySelector('.tabs');
    D.scrollBelowTabs(box, tabs);
    // 선생의 말
    const exprs = ['normal', 'smile', 'think', 'serious'];
    for (let k = 0; k < s.say.length; k++) {
      const last = k === s.say.length - 1;
      if (last) await dlg.quiet(s.say[k], { expr: exprs[(i + k) % exprs.length] });
      else await dlg.say(s.say[k], { expr: exprs[(i + k) % exprs.length] });
      if (!document.body.contains(box) || box.querySelector('h2').textContent !== s.title) return;
    }
  }

  async function finish() {
    const { a, rd } = current;
    content.querySelectorAll('.tabs button').forEach(b => b.classList.toggle('on', b.dataset.i === 'end'));
    const box = document.getElementById('sec');
    box.innerHTML = `<div class="panel fade-in"><h2>선생님의 마무리 말씀</h2><div class="closing">${rd.closing.map(x => `<p>${x}</p>`).join('')}</div>
      <h4>더 여쭤보기</h4><div class="qa" id="qa"></div><div id="ans"></div></div>`;
    for (const l of rd.closing.slice(0, -1)) await dlg.say(l, { expr: 'normal' });
    await dlg.say(rd.closing[rd.closing.length - 1], { expr: 'smile' });
    qa();
  }

  function qa() {
    const { a, rd } = current;
    const qaBox = document.getElementById('qa');
    if (!qaBox) return;
    const items = [['life', '평생사주 보기'], ['love', '연애·결혼운은요?'], ['money', '돈은 언제 들어와요?'], ['work', '직장·진로는요?'], ['health', '건강은요?'], ['move', '이사·이직해도 될까요?'], ['compat', '궁합도 볼래요'], ['again', '다른 사람 사주 보기']];
    qaBox.innerHTML = items.map(([k, l]) => `<button class="btn" data-k="${k}">${l}</button>`).join('');
    qaBox.querySelectorAll('button').forEach(b => b.onclick = async () => {
      D.sfx.pick();
      const k = b.dataset.k;
      if (k === 'compat') return compat(a.input);
      if (k === 'again') return askBirth();
      if (k === 'life') return openLife();
      const lines = rd.answer(k);
      const ans = document.getElementById('ans');
      ans.innerHTML = `<div class="mini fade-in" style="margin-top:12px"><h4>${b.textContent}</h4>${lines.map(x => `<p>${x.replace(/\*\*/g, '')}</p>`).join('')}</div>`;
      for (const l of lines.slice(0, -1)) await dlg.say(l, { expr: 'think' });
      await dlg.quiet(lines[lines.length - 1], { expr: 'smile' });
    });
  }

  /* ── 사주 상식 ── */
  async function learn() {
    show(`<div class="panel"><h2>사주(四柱)란</h2>
      <p>태어난 <b>해·달·날·시</b> 네 기둥(四柱)을 각각 하늘의 글자(천간) 하나와 땅의 글자(지지) 하나로 적으면 여덟 글자(八字)가 됩니다. 그래서 사주팔자라 해요.</p>
      <h4>왜 절기로 해와 달을 가르나요?</h4><p>사주의 한 해는 양력 1월 1일도, 음력 설날도 아닌 <b>입춘</b>에 시작하고, 달도 경칩·청명 같은 <b>절기</b>에 바뀝니다. 태양의 위치로 계절을 재는 달력이기 때문이에요. 이곳은 한국천문연구원(KASI)과 분 단위로 맞춘 절입 시각을 씁니다.</p>
      <h4>진태양시는 왜 따지나요?</h4><p>한국 표준시는 동경 135°(일본 아카시) 기준이라, 서울(약 127°)의 실제 해는 시계보다 약 32분 늦게 뜹니다. 또 1948~51, 1955~60, 1987~88년엔 서머타임이, 1954~61년엔 동경 127.5° 표준시가 쓰였어요. 시주가 바뀔 수 있어 이를 보정합니다.</p>
      <h4>야자시·조자시는요?</h4><p>밤 11시~새벽 1시(자시)에 태어났을 때 날짜를 언제 넘길지 학파마다 달라요. 기본은 자정에 날이 바뀌는 방식이고, '전문 설정'에서 23시에 바꾸는 정자시나 야자시 방식을 고를 수 있어요.</p>
      <h4>음양오행과 십성</h4><p>여덟 글자는 목·화·토·금·수 다섯 기운(오행)과 음양으로 나뉘고, 태어난 날의 천간(일간 = 나)과의 관계에 따라 비견·겁재·식신·상관·편재·정재·편관·정관·편인·정인의 열 가지 이름(십성)을 얻습니다.</p>
      <h4>대운과 세운</h4><p>대운은 10년마다 바뀌는 인생의 계절, 세운은 해마다 부는 바람이에요. 같은 사주라도 어떤 운을 지나느냐에 따라 쓰임이 달라집니다.</p></div>`);
    await dlg.say('사주란 태어난 순간 하늘과 땅의 기운을 여덟 글자로 받아 적은 것일세.', { expr: 'normal' });
    await dlg.say('운명을 못 박는 판결문이 아니라, 내가 어떤 씨앗인지 알려 주는 씨앗 봉투의 설명서 같은 것이지. 허허.', { expr: 'smile' });
    const v = await dlg.choose([{ label: '그럼 제 사주 봐 주세요', value: 'go', primary: true }, { label: '처음으로', value: 'menu' }], '자, 이제 자네 씨앗을 한번 볼 텐가?');
    return v === 'go' ? askBirth() : menu();
  }

  /* ── 궁합 ── */
  function gunghap(a, b) {
    const f = [];
    const add = (pt, t) => f.push({ pt, t });
    const ea = a.dmEl, eb = b.dmEl, E = S.ELEMENTS;
    const ia = E.indexOf(ea), ib = E.indexOf(eb);
    const sr = S.stemRelations(a.dm, b.dm);
    if (sr.some(r => r.type === '천간합')) add(18, `두 사람의 일간 ${D.j(a.dm + b.dm, '이가')} <b>천간합</b>을 이루네. 처음 만났을 때부터 끌리는, 하늘이 맺어 준 짝의 표식일세.`);
    else if (sr.some(r => r.type === '천간충')) add(-6, `일간 ${D.j(a.dm, '과와')} ${D.j(b.dm, '이가')} 정면으로 부딪히는 <b>천간충</b>이네. 생각이 달라 다툼이 잦을 수 있으나, 서로에게 없는 것을 배우는 인연이기도 하지.`);
    if (ia === ib) add(6, `같은 ${ea} 기운의 일간이라 친구처럼 말이 잘 통하네. 다만 둘 다 고집을 세우면 물러설 사람이 없지.`);
    else if ((ia + 1) % 5 === ib) add(10, `${a.name}의 ${D.j(ea, '이가')} ${b.name}의 ${D.j(eb, '을를')} 낳아 주는 <b>상생</b> 관계일세. ${D.j(a.name, '이가')} 베풀고 ${D.j(b.name, '이가')} 받아 크는 사이지.`);
    else if ((ib + 1) % 5 === ia) add(10, `${b.name}의 ${D.j(eb, '이가')} ${a.name}의 ${D.j(ea, '을를')} 낳아 주는 <b>상생</b> 관계일세. ${D.j(b.name, '이가')} 든든한 버팀목이 되어 주지.`);
    else if ((ia + 2) % 5 === ib) add(a.gender === 'male' && b.gender === 'female' ? 4 : -3, `${a.name}의 ${D.j(ea, '이가')} ${b.name}의 ${D.j(eb, '을를')} 다스리는 <b>상극</b> 관계일세. ${a.gender === 'male' ? '남자가 여자를 재성으로 보는 자리라 예부터 무난하다 했지만,' : ''} 한쪽이 끌고 가려 하면 다른 쪽이 숨이 막히니 존중이 필요해.`);
    else add(b.gender === 'male' && a.gender === 'female' ? 4 : -3, `${b.name}의 ${D.j(eb, '이가')} ${a.name}의 ${D.j(ea, '을를')} 다스리는 <b>상극</b> 관계일세. 긴장감이 있는 만큼 서로를 단련시키는 사이지.`);
    // 일지
    const da = a.pillars.day.branch, db = b.pillars.day.branch;
    const dr = S.branchRelations(da, db);
    const has = t => dr.some(r => r.type === t);
    if (has('육합')) add(15, `배우자 자리인 일지끼리 ${da}${db} <b>육합</b>일세. 함께 있으면 편안하고 몸과 마음이 잘 맞는 최고의 표식이야.`);
    else if (has('삼합')) add(10, `일지끼리 ${da}${db} <b>삼합</b>을 이루네. 같은 목표를 향해 손발이 잘 맞는 동지 같은 부부일세.`);
    if (has('충')) add(-14, `일지끼리 ${da}${db} <b>충</b>일세. 생활 습관과 리듬이 부딪히기 쉬우니, 각자의 공간과 시간을 인정해 주는 게 해법이야.`);
    if (has('형')) add(-8, `일지끼리 ${da}${db} <b>형</b>이 걸리네. 서로를 고치려 들면 상처가 나니, 있는 그대로 봐 주게.`);
    if (has('원진')) add(-10, `일지끼리 ${da}${db} <b>원진</b>이네. 까닭 없이 서운함이 쌓이기 쉬우니, 그날의 감정은 그날 풀게.`);
    if (has('해')) add(-5, `일지끼리 ${da}${db} 해(害)가 있어 사소한 오해가 생기기 쉽네.`);
    if (da === db && !has('형')) add(4, `일지가 ${D.j(da, '으로')} 같아 생활 방식이 닮았네.`);
    if (!dr.length && da !== db) add(2, `일지끼리는 부딪힘도 묶임도 없는 담백한 사이일세.`);
    // 띠
    const ya = a.pillars.year.branch, yb = b.pillars.year.branch;
    const yr = S.branchRelations(ya, yb);
    if (yr.some(r => r.type === '육합' || r.type === '삼합')) add(8, `${a.animal}띠와 ${b.animal}띠는 ${yr.find(r => r.type === '육합' || r.type === '삼합').type}으로 띠궁합이 좋은 사이일세. 집안끼리도 잘 어울리지.`);
    else if (yr.some(r => r.type === '충')) add(-6, `${a.animal}띠와 ${b.animal}띠는 서로 마주 보는 충의 띠라, 집안 문화나 가치관 차이를 조율해야 하네.`);
    else if (yr.some(r => r.type === '원진')) add(-5, `${a.animal}띠와 ${b.animal}띠는 원진 관계라, 사소한 말투에 상처받기 쉽네.`);
    // 용신 보완
    if (b.power.pct[a.yongsin.el] >= 24) add(9, `${b.name}의 사주에 ${a.name}에게 약이 되는 ${a.yongsin.el}(용신) 기운이 넉넉하네. 곁에만 있어도 ${a.name}의 운이 살아나지.`);
    if (a.power.pct[b.yongsin.el] >= 24) add(9, `${a.name}의 사주엔 ${b.name}에게 필요한 ${b.yongsin.el}(용신) 기운이 넉넉하네. ${b.name}에게 복을 주는 사람일세.`);
    const strongB = E.slice().sort((x, y) => b.power.pct[y] - b.power.pct[x])[0];
    const strongA = E.slice().sort((x, y) => a.power.pct[y] - a.power.pct[x])[0];
    if (strongB === a.yongsin.gisin) add(-5, `${b.name}에게 가장 강한 ${strongB} 기운이 ${a.name}에겐 기신이라, 함께 지칠 때가 있겠네. 각자 충전할 시간을 두게.`);
    if (strongA === b.yongsin.gisin) add(-5, `${a.name}에게 가장 강한 ${strongA} 기운이 ${b.name}에겐 부담이 되기도 하네.`);
    // 배우자 별
    const spouseEl = x => S.elementOfGroup(x.dmEl, x.gender === 'male' ? '재성' : '관성');
    if (spouseEl(a) === eb) add(7, `${b.name}의 일간 ${D.j(eb, '이가')} 바로 ${a.name} 사주의 배우자 별(${a.gender === 'male' ? '재성' : '관성'})이네. 짝으로 알아보는 인연일세.`);
    if (spouseEl(b) === ea) add(7, `${a.name}의 일간 ${D.j(ea, '이가')} ${b.name} 사주의 배우자 별이네. ${b.name}에게 ${D.j(a.name, '은는')} 운명 같은 사람이지.`);
    const sum = f.reduce((s, x) => s + x.pt, 0);
    const score = Math.max(38, Math.min(98, Math.round(62 + sum * 0.9)));
    const label = score >= 90 ? '천생연분' : score >= 80 ? '찰떡궁합' : score >= 70 ? '좋은 인연' : score >= 60 ? '가꿀수록 좋은 인연' : score >= 50 ? '서로 배워 가는 인연' : '결이 다른 인연';
    return { score, label, factors: f };
  }

  async function compat(me) {
    show(`<div class="panel"><h2>궁합 보기</h2><div id="fA"></div></div>`);
    let pa = me ? D.profile() : null;
    if (!pa) {
      dlg.quiet('먼저 자네의 생년월일시부터 일러 주게.', { expr: 'normal' });
      try { pa = await D.birthForm(document.getElementById('fA'), { title: '나', submitLabel: '다음: 상대방', cancelLabel: '돌아가기', initial: D.profile() || undefined }); } catch (e) { return menu(); }
    }
    show(`<div class="panel"><h2>궁합 보기</h2><p class="muted small">나: ${D.esc(D.describeProfile(pa))}</p><div id="fB"></div></div>`);
    dlg.quiet('이제 상대의 생년월일시를 일러 주게. 시를 모르면 모른다 해도 되네.', { expr: 'smile' });
    let pb;
    const other = D.load('partner', null);
    try { pb = await D.birthForm(document.getElementById('fB'), { title: '상대방', submitLabel: '궁합 보기', cancelLabel: '돌아가기', save: false, initial: other || { gender: pa.gender === 'male' ? 'female' : 'male', year: pa.year, name: '' } }); } catch (e) { return menu(); }
    D.save('partner', pb);
    let a, b;
    try {
      a = S.analyze(D.toSajuInput(pa)); b = S.analyze(D.toSajuInput(pb));
    } catch (e) { await dlg.say('허, 날짜가 이상하구먼. 다시 일러 주게.', { expr: 'surprise' }); return compat(); }
    a.name = pa.name || '자네'; b.name = pb.name || '상대';
    show(`<div class="panel writing"><p class="muted">두 사람의 여덟 글자를 나란히 놓는 중<span class="loading-dots"></span></p></div>`);
    await dlg.say('어디, 두 사람의 팔자를 나란히 놓아 보세…', { expr: 'think' });
    D.sfx.brush(); await D.sleep(700);
    const g = gunghap(a, b);
    const pillarLine = x => ['hour', 'day', 'month', 'year'].filter(k => x.pillars[k]).map(k => S.hanja(x.pillars[k])).join(' ');
    show(`<div class="panel fade-in">
      <div class="compat-score"><div class="big">${g.score}</div><div class="lab">${g.label}</div></div>
      <div class="pair"><div class="who"><small>${D.esc(a.name)}</small><b class="el-t-${a.dmEl}">${a.dmH}</b><small>${a.dm}${a.dmEl} · ${a.animal}띠</small><div class="small muted">${pillarLine(a)}</div></div><div class="heart">❤</div>
        <div class="who"><small>${D.esc(b.name)}</small><b class="el-t-${b.dmEl}">${b.dmH}</b><small>${b.dm}${b.dmEl} · ${b.animal}띠</small><div class="small muted">${pillarLine(b)}</div></div></div>
      <h4>궁합을 이루는 것들</h4>
      ${g.factors.map(x => `<div class="factor"><span class="pt ${x.pt >= 0 ? 'plus' : 'minus'}">${x.pt > 0 ? '+' : ''}${x.pt}</span><p>${x.t}</p></div>`).join('')}
      <h4>선생의 당부</h4>
      <p>${g.score >= 80 ? '타고난 궁합이 좋으니, 서로를 당연하게 여기지만 않으면 오래도록 좋은 짝일세.' : g.score >= 60 ? '좋은 점과 부딪히는 점이 함께 있는 보통의 인연이네. 궁합은 반이 타고나고 반은 가꾸는 것이지.' : '타고난 결은 다르지만, 다른 결끼리 만나야 옷감이 질겨지는 법일세. 서로의 다름을 존중하면 오히려 단단해지네.'}</p>
      <p class="muted small">궁합 점수는 일간·일지·띠·용신 보완·배우자 별을 전통 궁합법에 따라 더하고 뺀 참고 지표예요. 두 사람의 마음과 노력이 언제나 가장 큰 변수랍니다.</p>
      <div class="qa"><button class="btn" id="again">다른 사람과 보기</button><button class="btn" id="mine">내 사주 풀이 보기</button><button class="btn" id="home">처음으로</button></div></div>`);
    content.querySelector('#again').onclick = () => compat(true);
    content.querySelector('#mine').onclick = () => reading(pa);
    content.querySelector('#home').onclick = () => menu();
    const top = g.factors.slice().sort((x, y) => Math.abs(y.pt) - Math.abs(x.pt))[0];
    await dlg.say(`허허, **${g.label}**이로구먼. 점수로는 ${g.score}점일세.`, { expr: g.score >= 70 ? 'smile' : 'normal' });
    if (top) await dlg.quiet(top.t.replace(/<[^>]+>/g, ''), { expr: top.pt >= 0 ? 'smile' : 'serious' });
  }

  greet();
})();
