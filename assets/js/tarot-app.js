/* 살롱 드 루나 — 타로 상담 흐름 */
(function () {
  'use strict';
  const D = window.Dalbit, T = window.TarotData, A = window.TarotArt, TR = window.TarotReading, X = window.TarotDeep;
  D.topbar();
  document.body.insertAdjacentHTML('afterbegin', A.defs());
  const actor = window.Characters.mount('luna', document.getElementById('actor'));
  const dlg = D.Dialog(document.getElementById('dialog'), actor, { pitch: 720 });
  D.fitActor(document.querySelector('.stage'), 0.84); // 탁자가 가슴 높이에 오게
  const content = document.getElementById('content');
  const stage = document.querySelector('.stage');
  D.particles(document.getElementById('sparkle'), 'dust');
  const BY_ID = TR.BY;
  const visits = D.load('visits:tarot', 0); D.save('visits:tarot', visits + 1);
  const toTop = () => { if (D.isPhone()) D.scrollToEl(content, 8); else window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const show = (html, scroll = true) => { content.innerHTML = html; if (scroll) toTop(); };
  const md = s => String(s).replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');

  const TOPICS = [
    { key: 'love', label: '💞 연애·관계', field: 'love', ex: ['그 사람과 가까워지려면 무엇을 해야 할까?', '우리 관계는 어떻게 흘러갈까?', '그 사람은 지금 나를 어떻게 생각할까?', '헤어진 그 사람과 다시 만날 수 있을까?'] },
    { key: 'work', label: '💼 일·진로', field: 'work', ex: ['지금 회사에 계속 있어도 될까?', '이 프로젝트를 성공시키려면?', '나에게 맞는 진로는?', '이직을 하면 어떨까?'] },
    { key: 'money', label: '💰 금전·재물', field: 'work', ex: ['이번 달 돈의 흐름은?', '이 투자를 해도 괜찮을까?', '돈을 모으려면 무엇을 바꿔야 할까?'] },
    { key: 'people', label: '🤝 사람·가족', field: 'love', ex: ['그 친구와의 갈등을 어떻게 풀까?', '가족에게 어떻게 다가가면 좋을까?', '새 모임에서 잘 지낼 수 있을까?'] },
    { key: 'self', label: '🌙 나 자신', field: 'gen', ex: ['요즘 나에게 필요한 것은?', '지금 내가 놓치고 있는 것은?', '나는 어떤 방향으로 가야 할까?'] },
    { key: 'free', label: '✨ 그 밖의 질문', field: 'gen', ex: ['이 선택이 나에게 좋을까?', '앞으로 석 달의 흐름은?', 'A와 B 중 무엇을 고를까?'] },
  ];

  /* ── 덱 ── */
  function newDeck() { return T.CARDS.map(c => ({ id: c.id, rev: false })); }
  // 손으로 섞듯: 무작위 크기의 뭉치를 떼어 다시 쌓고, 가끔 뭉치를 돌려 놓는다(역방향이 생기는 원리)
  function shuffleOnce(deck, allowRev) {
    const r = D.secureRandom;
    let rest = deck.slice(), out = [];
    while (rest.length) {
      const k = Math.min(rest.length, 3 + Math.floor(r() * 9));
      let chunk = rest.splice(0, k);
      if (allowRev && r() < 0.28) chunk = chunk.reverse().map(x => ({ id: x.id, rev: !x.rev }));
      out = chunk.concat(out);
    }
    const half = Math.floor(out.length / 2 + (r() - 0.5) * 8);
    const L = out.slice(0, half), Rr = out.slice(half), res = [];
    while (L.length || Rr.length) { const n1 = 1 + Math.floor(r() * 3); res.push(...L.splice(0, n1)); const n2 = 1 + Math.floor(r() * 3); res.push(...Rr.splice(0, n2)); }
    return res;
  }

  const cardEl = (entry, opts = {}) => {
    const c = BY_ID[entry.id];
    return `<div class="tcard${entry.rev ? ' rev' : ''}${opts.flipped ? ' flipped' : ''}" data-id="${c.id}"><div class="inner"><div class="side">${A.back()}</div><div class="side front-side">${A.face(c)}</div></div></div>`;
  };
  const today = () => { const k = D.kst(); return `${k.y}-${String(k.m).padStart(2, '0')}-${String(k.d).padStart(2, '0')}`; };

  /* ── 인사·메뉴 ── */
  async function greet() {
    show(`<div class="panel"><h2>Salon de Luna</h2><p class="muted">촛불 아래 78장의 카드가 당신의 질문을 기다리고 있어요.</p></div>`, false);
    const t = D.timeGreeting();
    const first = {
      deep: '이렇게 깊은 밤엔… 카드도 더 솔직해져요. 어서 와요.',
      morning: '아침 햇살이 들기 전에 왔네요. 맑은 마음일 때 카드가 잘 읽혀요.',
      day: '어서 와요. 살롱 드 루나에 온 걸 환영해요.',
      evening: '노을이 지는 시간… 하루의 질문을 내려놓기 좋은 때예요.',
      night: '어서 와요. 촛불이 당신을 기다리고 있었어요.',
    }[t];
    await dlg.say(first, { expr: 'mystic' });
    if (visits > 0) await dlg.say('또 와 줬네요. 카드들이 당신을 기억하고 있어요.', { expr: 'smile', after: 'normal' });
    else await dlg.say('나는 루나. 백 년 넘게 전해 내려온 라이더-웨이트 카드 78장과 함께, 별의 말을 옮기는 사람이에요.', { expr: 'normal' });
    menu();
  }

  async function menu() {
    actor.set('normal'); stage.classList.remove('charged');
    const hist = D.load('tarot:history', []);
    const daily = D.load('tarot:daily', null);
    show(`<div class="panel"><h2>Salon de Luna</h2><p class="muted">마음에 품은 질문을 카드에게 물어보세요.</p>
      <div class="menu-grid">
        <button class="menu-card" data-v="ask"><b>🔮 고민 상담 리딩</b><span>주제와 질문을 정하고, 직접 섞고 떼고 골라서 루나와 한 장씩 읽어요.</span></button>
        <button class="menu-card" data-v="daily"><b>🌙 오늘의 카드</b><span>하루에 한 장, 오늘을 위한 메시지.</span></button>
        <button class="menu-card" data-v="pile"><b>🕯️ 세 묶음 중 고르기</b><span>유튜브 타로처럼 직감으로 한 묶음을 골라요.</span></button>
        <button class="menu-card" data-v="library"><b>📚 카드 도감</b><span>1909년 원본 78장의 그림과 의미를 둘러봐요.</span></button>
        <button class="menu-card" data-v="learn"><b>📖 타로 이야기</b><span>타로의 역사, 메이저와 마이너, 역방향의 의미.</span></button>
      </div>
      ${hist.length ? `<h3 style="margin-top:18px">지난 리딩</h3><ul class="history">${hist.slice(0, 5).map(h => `<li><span class="muted small">${h.date}</span> ${D.esc(h.q || h.topic)} — ${h.cards.map(([id, rv]) => BY_ID[id].name + (rv ? '(역)' : '')).join(', ')}</li>`).join('')}</ul>` : ''}
    </div>`, false);
    content.querySelectorAll('.menu-card').forEach(b => b.onclick = () => { D.sfx.pick(); route(b.dataset.v); });
    const v = await dlg.choose([
      { label: '고민이 있어요', value: 'ask', primary: true }, { label: daily && daily.date === today() ? '오늘의 카드 다시 보기' : '오늘의 카드 한 장', value: 'daily' }, { label: '세 묶음 고르기', value: 'pile' }, { label: '카드 도감', value: 'library' },
    ], '오늘은 무엇을 물어보러 왔나요?', { expr: 'normal' });
    route(v);
  }
  let routing = false;
  function route(v) {
    if (routing) return; routing = true; setTimeout(() => routing = false, 300);
    ({ ask: askTopic, daily: dailyCard, pile: pickPile, learn, library })[v]();
  }

  /* ── 고민 상담: 주제·질문·배열 ── */
  let session = null;
  async function askTopic() {
    session = { topic: null, q: '', spread: null, deck: newDeck(), allowRev: true };
    show(`<div class="panel"><h2>Question</h2><p class="muted">어떤 이야기를 물어볼까요?</p><div class="topics">${TOPICS.map(t => `<button class="btn" data-k="${t.key}">${t.label}</button>`).join('')}</div></div>`);
    content.querySelectorAll('.topics button').forEach(b => b.onclick = () => { D.sfx.pick(); pickTopic(b.dataset.k); });
    const k = await dlg.choose(TOPICS.map(t => ({ label: t.label, value: t.key })), '어떤 마음이 당신을 여기로 데려왔나요?', { expr: 'mystic' });
    pickTopic(k);
  }
  let topicPicked = false;
  async function pickTopic(k) {
    if (topicPicked) return; topicPicked = true; setTimeout(() => topicPicked = false, 500);
    session.topic = TOPICS.find(t => t.key === k);
    const tp = session.topic;
    show(`<div class="panel"><h2>Question</h2><form class="form" id="qf">
      <div class="row"><label class="lbl" for="q">${tp.label} — 마음속 질문을 적어 주세요 <span class="small">(비워 둬도 돼요)</span></label>
      <textarea id="q" maxlength="120" placeholder="예: ${tp.ex[0]}"></textarea>
      <div class="examples">${tp.ex.map(e => `<button type="button">${e}</button>`).join('')}</div></div>
      <label class="check"><input type="checkbox" id="rv" checked> 역방향 카드도 읽기 (카드가 거꾸로 나오면 막힘·내면의 의미)</label>
      <div class="inline"><button class="btn primary" type="submit">이 질문으로</button><button class="btn" type="button" id="back">처음으로</button></div></form></div>`);
    const f = content.querySelector('#qf');
    f.querySelectorAll('.examples button').forEach(b => b.onclick = () => { f.q.value = b.textContent; f.q.focus(); });
    f.querySelector('#back').onclick = () => menu();
    dlg.quiet('질문을 구체적으로 할수록 카드가 또렷하게 대답해요. "될까, 안 될까?"보다 "어떻게 하면 좋을까?"처럼 열린 질문이 좋아요.', { expr: 'normal' });
    await new Promise(res => f.onsubmit = e => { e.preventDefault(); res(); });
    session.q = f.q.value.trim();
    session.allowRev = f.querySelector('#rv').checked;
    chooseSpread();
  }

  async function chooseSpread() {
    const q = session.q;
    const rec = /아니면|vs|중에|둘 중|중 무엇|할까 말까|A와 B|A랑 B/.test(q) ? 'choice' : (session.topic.key === 'love' || session.topic.key === 'people') ? 'love' : q.length > 25 ? 'celtic' : 'three';
    show(`<div class="panel"><h2>Spread</h2><p class="muted">카드를 어떤 모양으로 펼칠까요?</p><div class="spread-list">${Object.entries(T.SPREADS).map(([k, s]) => `<button class="spread-opt${k === rec ? ' rec' : ''}" data-k="${k}"><span class="n">${s.n}</span><span><b>${s.name}</b>${k === rec ? '<em>루나 추천</em>' : ''}<small>${s.desc} · ${s.pos.map(p => p[0]).join(' → ')}</small></span></button>`).join('')}</div></div>`);
    dlg.quiet(`그 질문이라면… **${T.SPREADS[rec].name}** 배열이 잘 어울려요. 물론 마음이 끌리는 걸 골라도 돼요.`, { expr: 'mystic' });
    const k = await new Promise(res => content.querySelectorAll('.spread-opt').forEach(b => b.onclick = () => { D.sfx.pick(); res(b.dataset.k); }));
    session.spread = k;
    shuffleStep();
  }

  /* ── 섞기·떼기·고르기 ── */
  async function shuffleStep() {
    const need = 7;
    let count = 0;
    show(`<div class="panel" style="text-align:center"><h2>Shuffle</h2><p class="muted">질문을 마음속으로 되뇌며 카드를 섞어 주세요.<br>버튼을 누르고 있는 동안 섞여요. 충분하다고 느껴질 때 멈추세요.</p>
      <div class="deck-area"><div class="deck" id="deck">${Array.from({ length: 8 }, (_, i) => `<div class="dc" style="transform:translate(${i * 0.8}px,${-i * 0.8}px)">${A.back()}</div>`).join('')}</div></div>
      <div class="shuffle-meter"><div id="meter"></div></div>
      <div class="inline" style="justify-content:center"><button class="btn primary hold-btn" id="hold">✋ 누르고 섞기</button><button class="btn" id="stop" disabled>이제 됐어요</button></div></div>`);
    dlg.quiet(session.q ? `"${session.q}"… 이 질문을 떠올리면서 섞어 주세요.` : '지금 마음에 걸리는 일을 떠올리면서 섞어 주세요.', { expr: 'mystic' });
    stage.classList.add('charged');
    const deckEl = content.querySelector('#deck'), meter = content.querySelector('#meter'), hold = content.querySelector('#hold'), stop = content.querySelector('#stop');
    let timer = null;
    const once = () => {
      session.deck = shuffleOnce(session.deck, session.allowRev);
      count++; meter.style.width = Math.min(100, count / need * 100) + '%';
      deckEl.classList.remove('shuffling'); void deckEl.offsetWidth; deckEl.classList.add('shuffling');
      D.sfx.shuffle();
      if (count >= 3) stop.disabled = false;
      if (count === need) dlg.quiet('카드가 당신의 기운을 충분히 머금었어요. 멈추고 싶을 때 멈추세요.', { expr: 'smile' });
    };
    const start = e => { e.preventDefault(); hold.classList.add('holding'); once(); clearInterval(timer); timer = setInterval(once, 520); };
    const end = () => { hold.classList.remove('holding'); clearInterval(timer); };
    hold.addEventListener('pointerdown', start); hold.addEventListener('pointerup', end); hold.addEventListener('pointerleave', end); hold.addEventListener('pointercancel', end);
    hold.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); once(); } });
    await new Promise(res => stop.onclick = res);
    end();
    cutStep();
  }

  async function cutStep() {
    const deck = session.deck, r = D.secureRandom;
    const a = 22 + Math.floor(r() * 10), b = a + 22 + Math.floor(r() * 10);
    const piles = [deck.slice(0, a), deck.slice(a, b), deck.slice(b)];
    show(`<div class="panel" style="text-align:center"><h2>Cut</h2><p class="muted">덱을 세 더미로 나눴어요. 마음이 가는 더미 하나를 골라 주세요.<br>그 더미가 맨 위로 올라가요.</p>
      <div class="piles">${piles.map((p, i) => `<button class="pile" data-i="${i}"><div class="stack">${Array.from({ length: 4 }, (_, k) => `<div style="position:absolute;inset:0;transform:translate(${k}px,${-k}px)">${A.back()}</div>`).join('')}</div><span>${['I', 'II', 'III'][i]}</span></button>`).join('')}</div></div>`);
    dlg.quiet('덱을 셋으로 나눴어요. 직감으로 하나를 골라요. 생각하지 말고, 손이 가는 대로.', { expr: 'normal' });
    const i = await new Promise(res => content.querySelectorAll('.pile').forEach(b => b.onclick = () => { D.sfx.flip(); res(+b.dataset.i); }));
    session.deck = piles[i].concat(piles.filter((_, k) => k !== i).flat());
    pickStep();
  }

  async function pickStep() {
    const sp = T.SPREADS[session.spread];
    const picked = [];
    show(`<div class="panel"><h2>Choose</h2><p class="pick-count"><span id="pc">0</span> / ${sp.n}</p>
      <p class="muted small" style="text-align:center">끌리는 카드를 ${sp.n}장 골라 주세요. 고른 순서대로 자리에 놓여요.</p>
      <div class="fan" id="fan">${session.deck.map((x, i) => `<button class="fc" data-i="${i}" aria-label="${i + 1}번째 카드">${A.back()}</button>`).join('')}</div>
      <div class="spread s-${session.spread}" id="spr">${sp.pos.map(p => `<div class="slot"><div class="empty"></div><div class="plabel">${p[0]}</div></div>`).join('')}</div></div>`);
    dlg.quiet(`이제 펼쳐진 카드 중에서 **${sp.n}장**을 골라요. 손끝이 따뜻해지는 카드가 있을 거예요.`, { expr: 'mystic' });
    await new Promise(res => {
      content.querySelectorAll('.fc').forEach(b => b.onclick = () => {
        if (picked.length >= sp.n) return;
        const i = +b.dataset.i; picked.push(session.deck[i]); b.classList.add('taken'); D.sfx.pick();
        content.querySelector('#pc').textContent = picked.length;
        const slot = content.querySelectorAll('#spr .slot')[picked.length - 1];
        slot.querySelector('.empty').outerHTML = cardEl(picked[picked.length - 1]);
        if (picked.length === sp.n) setTimeout(res, 500);
      });
    });
    session.picked = picked;
    A.preload(picked.map(x => x.id));
    revealStep();
  }

  /* ── 뒤집기 ── */
  async function revealStep() {
    const sp = T.SPREADS[session.spread];
    show(`<div class="panel"><h2>Reveal</h2><p class="muted small" style="text-align:center">카드를 하나씩 눌러 뒤집어 보세요.</p>
      <div class="spread s-${session.spread}" id="spr">${session.picked.map((x, i) => `<div class="slot">${cardEl(x)}<div class="plabel">${i + 1}. ${sp.pos[i][0]}</div></div>`).join('')}</div>
      <div class="inline" style="justify-content:center;margin-top:10px"><button class="btn" id="all">모두 뒤집기</button></div></div>`);
    dlg.quiet('준비됐나요? 첫 번째 카드부터 천천히 열어 봐요.', { expr: 'normal' });
    const cards = [...content.querySelectorAll('#spr .tcard')];
    let opened = 0, done = false;
    const finish = async () => { if (done) return; done = true; await D.sleep(900); session.reads = session.picked.map((x, i) => TR.readCard(x, session.spread, i, session.topic.field)); session.answers = []; readingStep(0); };
    const flip = async (el, i, talk) => {
      if (el.classList.contains('flipped')) return;
      el.classList.add('flipped'); D.sfx.flip(); opened++;
      if (opened === cards.length) return finish();
      if (talk) { const c = BY_ID[session.picked[i].id]; dlg.quiet(`${sp.pos[i][0]} — **${c.name}**${session.picked[i].rev ? ', 거꾸로…' : '.'}`, { expr: c.arcana === 'major' ? 'surprise' : session.picked[i].rev ? 'serious' : 'smile' }); }
    };
    cards.forEach((el, i) => el.onclick = () => flip(el, i, true));
    content.querySelector('#all').onclick = async () => { for (let i = 0; i < cards.length; i++) { if (!cards[i].classList.contains('flipped')) { flip(cards[i], i, false); await D.sleep(240); } } };
  }

  /* ── 한 장씩 읽기 ── */
  let stepToken = 0;
  async function readingStep(i) {
    const my = ++stepToken;
    const reads = session.reads, r = reads[i], n = reads.length;
    const last = i === n - 1;
    show(`<div class="panel reading-step fade-in">
      <div class="step-head"><span class="pos-no">${i + 1} / ${n}</span><div class="dots">${reads.map((x, k) => `<button class="dot${k === i ? ' on' : ''}${k < i ? ' seen' : ''}" data-k="${k}" aria-label="${k + 1}번째 카드">${k + 1}</button>`).join('')}</div></div>
      <div class="step-grid">
        <div class="step-card">${cardEl({ id: r.c.id, rev: r.rev }, { flipped: true })}</div>
        <div>
          <div class="pos">${r.posName} · ${r.posDesc}</div>
          <h3>${r.c.name} <small>${r.c.en}</small><span class="orient ${r.rev ? 'rev' : 'up'}">${r.rev ? '역방향' : '정방향'}</span></h3>
          <div class="kw">${r.rev ? r.c.rkw : r.c.kw} · ${r.c.astro} · ${r.el}의 원소</div>
          <div class="read-lines">${r.lines.map((l, k) => `<p class="${k === 0 ? 'lead-line' : k === 2 ? 'muted small' : ''}">${md(l)}</p>`).join('')}</div>
          ${r.advice ? `<p class="advice-line">✦ 조언 — ${r.advice}.</p>` : ''}
          <details class="look"><summary>👁 그림 읽기</summary><p>${r.look}</p></details>
        </div>
      </div>
      <div class="ask-box"><p class="q">🔮 ${r.q}</p><p class="reply" id="reply"></p></div>
      <div class="inline step-nav">${i > 0 ? '<button class="btn" id="prev">◀ 이전 카드</button>' : ''}<button class="btn primary" id="next">${last ? '종합 리딩 보기 ✨' : '다음 카드 ▶'}</button><button class="btn small" id="skip">한 번에 보기</button></div>
    </div>`);
    content.querySelectorAll('.dot').forEach(b => b.onclick = () => { D.sfx.flip(); readingStep(+b.dataset.k); });
    const prev = content.querySelector('#prev'); if (prev) prev.onclick = () => { D.sfx.flip(); readingStep(i - 1); };
    content.querySelector('#next').onclick = () => { D.sfx.flip(); last ? finalReading() : readingStep(i + 1); };
    content.querySelector('#skip').onclick = () => finalReading();
    // 루나의 말
    const expr = r.c.arcana === 'major' ? (r.rev ? 'serious' : 'surprise') : r.rev ? 'serious' : 'smile';
    await dlg.say(r.lead, { expr });
    if (my !== stepToken) return;
    await dlg.say(r.lines[0], { expr: 'mystic' });
    if (my !== stepToken) return;
    const ans = await dlg.choose([{ label: '맞아요', value: 'yes' }, { label: '글쎄요', value: 'maybe' }, { label: '아니에요', value: 'no' }], r.q, { expr: 'normal' });
    if (my !== stepToken) return;
    session.answers[i] = ans;
    const reply = TR.pick(TR.REPLY[ans]);
    const rp = content.querySelector('#reply'); if (rp) rp.textContent = `루나: ${reply}`;
    await dlg.say(reply, { expr: ans === 'yes' ? 'smile' : 'mystic' });
    if (my !== stepToken) return;
    dlg.quiet(last ? '이제 카드들을 하나로 꿰어 볼게요. "종합 리딩 보기"를 눌러요.' : '다음 카드로 넘어가 볼까요?', { expr: 'normal' });
  }

  /* ── 종합 리딩 ── */
  async function finalReading() {
    ++stepToken;
    const sp = T.SPREADS[session.spread];
    const reads = session.reads;
    const syn = TR.synthesize(session.spread, reads, session.answers.filter(Boolean));
    const v = syn.verdict;
    const heart = syn.heart ? `<div class="gauge-box"><h4>💗 그 사람 마음의 온도</h4><div class="thermo"><div class="tfill" style="width:${syn.heart.t}%"></div><span>${syn.heart.t}°</span></div><p class="small">${reads[1].c.name}${reads[1].rev ? '(역)' : ''}${reads[1].c.name.match(/[가-힣]$/) ? D.j(reads[1].c.name, '이가').slice(reads[1].c.name.length) : '가'} 말하는 그 사람의 마음은 — <b>${syn.heart.lab}</b>.</p></div>` : '';
    show(`<div class="panel final-reading fade-in"><h2>Reading</h2>${session.q ? `<p class="muted">질문: “${D.esc(session.q)}”</p>` : ''}
      <div class="thumbs">${reads.map((r, i) => `<button class="thumb" data-k="${i}"><div class="tw">${cardEl({ id: r.c.id, rev: r.rev }, { flipped: true })}</div><small>${i + 1}. ${r.posName}</small></button>`).join('')}</div>
      <div class="luna-says story"><b>루나가 꿰어 본 이야기</b>${syn.story.map(s => `<p>${md(s)}</p>`).join('')}</div>
      ${heart}
      ${syn.choice ? `<div class="luna-says"><b>⚖️ 두 길의 무게</b><p>${syn.choice}</p></div>` : ''}
      ${syn.combos.length ? `<div class="combos"><h4>🔗 카드 조합</h4>${syn.combos.map(([a, b, t, d]) => `<div class="combo"><span>${BY_ID[a].name} + ${BY_ID[b].name}</span><b>${t}</b><p>${d}</p></div>`).join('')}</div>` : ''}
      ${syn.patterns.length || syn.flow.length ? `<div class="patterns"><h4>🔎 카드가 보여 주는 흐름</h4>${syn.patterns.concat(syn.flow).map(p => `<p>${p}</p>`).join('')}</div>` : ''}
      <div class="gauge-box"><h4>🌗 흐름의 방향</h4><div class="vmeter"><div class="vfill" style="width:${v.pct}%"></div></div><div class="yesno">${v.yn[0]}</div><p style="text-align:center">${v.yn[1]}</p></div>
      <p class="timing">⏳ ${syn.timing}</p>
      ${syn.resonance ? `<p class="muted">${syn.resonance}</p>` : ''}
      <div class="luna-says"><b>마지막으로</b><p>${syn.last.c.name}${syn.last.rev ? '(역)' : ''}의 조언 — “${syn.last.c.advice[syn.last.rev ? 1 : 0]}”</p><p>카드는 정해진 미래가 아니라, 지금 걷는 길의 지도예요. 지도를 읽었으니 이제 걸음은 당신 몫이에요.</p></div>
      <div class="inline final-btns"><button class="btn primary" id="adv">✨ 조언 카드 한 장 더</button><button class="btn" id="copy">📋 리딩 복사</button><button class="btn" id="again">다른 질문하기</button><button class="btn" id="home">처음으로</button></div>
      <div id="advbox"></div>
      <details class="all-cards"><summary>카드별 풀이 한눈에 보기</summary>${reads.map((r, i) => `<div class="card-read"><div>${cardEl({ id: r.c.id, rev: r.rev }, { flipped: true })}</div><div><div class="pos">${i + 1}. ${r.posName}</div><h3>${r.c.name}<span class="orient ${r.rev ? 'rev' : 'up'}">${r.rev ? '역방향' : '정방향'}</span></h3>${r.lines.map(l => `<p>${md(l)}</p>`).join('')}</div></div>`).join('')}</details>
    </div>`);
    content.querySelectorAll('.thumb').forEach(b => b.onclick = () => { D.sfx.flip(); readingStep(+b.dataset.k); });
    content.querySelector('#again').onclick = () => askTopic();
    content.querySelector('#home').onclick = () => menu();
    content.querySelector('#copy').onclick = async () => {
      const txt = TR.plainText(session.q, sp.name, reads, syn);
      try { await navigator.clipboard.writeText(txt); D.toast('리딩을 복사했어요'); } catch (e) { D.toast('복사하지 못했어요'); }
    };
    content.querySelector('#adv').onclick = async e => {
      e.currentTarget.disabled = true;
      const used = new Set(session.picked.map(x => x.id));
      const ad = session.deck.find(x => !used.has(x.id));
      const c = BY_ID[ad.id], s = TR.slot(c.id, ad.rev);
      content.querySelector('#advbox').innerHTML = `<div class="card-read fade-in"><div>${cardEl(ad, { flipped: true })}</div><div><div class="pos">조언 카드 · 덱 맨 위에서</div><h3>${c.name}<span class="orient ${ad.rev ? 'rev' : 'up'}">${ad.rev ? '역방향' : '정방향'}</span></h3><p><b>지금 필요한 건 ${s.a}${D.j(s.a, '이에요').slice(s.a.length)}.</b></p><p>${ad.rev ? c.rev : c.up}</p><p class="muted small">${c.img}</p></div></div>`;
      D.sfx.magic();
      await dlg.say(`조언 카드는 **${c.name}**${ad.rev ? ' 역방향' : ''}이에요.`, { expr: 'surprise' });
      await dlg.quiet(`지금 당신에게 필요한 건 **${s.a}**${D.j(s.a, '이에요').slice(s.a.length)}.`, { expr: 'mystic' });
    };
    const hist = D.load('tarot:history', []);
    if (!session.saved) { hist.unshift({ date: today(), q: session.q, topic: session.topic.label, spread: sp.name, cards: session.picked.map(x => [x.id, x.rev]) }); D.save('tarot:history', hist.slice(0, 20)); session.saved = true; }
    stage.classList.remove('charged');
    D.sfx.chime();
    await dlg.say(syn.story[0], { expr: 'mystic' });
    for (const l of syn.story.slice(1, -1)) await dlg.say(l, { expr: 'normal' });
    if (syn.story.length > 1) await dlg.say(syn.story[syn.story.length - 1], { expr: v.pct >= 60 ? 'smile' : 'serious' });
    if (syn.combos.length) await dlg.say(`그리고… **${syn.combos[0][2]}**. ${syn.combos[0][3]}`, { expr: 'surprise' });
    dlg.quiet(`정리하면 ${v.yn[0]}. ${v.yn[1]}`, { expr: 'smile' });
  }

  /* ── 오늘의 카드 ── */
  async function dailyCard() {
    let d = D.load('tarot:daily', null);
    const fresh = !d || d.date !== today();
    if (fresh) { let deck = newDeck(); for (let i = 0; i < 5; i++) deck = shuffleOnce(deck, true); d = { date: today(), id: deck[0].id, rev: deck[0].rev }; }
    const c = BY_ID[d.id], s = TR.slot(c.id, d.rev);
    A.preload([c.id]);
    show(`<div class="panel" style="text-align:center"><h2>Card of the Day</h2><p class="muted">${today()} · 하루에 한 장</p>
      <div class="big-card">${cardEl({ id: d.id, rev: d.rev })}</div><p class="muted small" id="tap">카드를 눌러 뒤집어 보세요</p><div id="dres"></div></div>`);
    dlg.quiet(fresh ? '오늘 하루를 위한 카드를 한 장 꺼내 뒀어요. 눌러서 열어 봐요.' : '오늘의 카드는 이미 나왔어요. 다시 한번 볼까요?', { expr: 'mystic' });
    const el = content.querySelector('.big-card .tcard');
    await new Promise(res => el.onclick = res);
    el.classList.add('flipped'); D.sfx.flip(); D.save('tarot:daily', d);
    content.querySelector('#tap').remove();
    content.querySelector('#dres').innerHTML = `<div class="fade-in" style="text-align:left"><h3>${c.name} <small class="muted">${c.en}</small> <span class="orient ${d.rev ? 'rev' : 'up'}">${d.rev ? '역방향' : '정방향'}</span></h3><div class="kw muted small">${d.rev ? c.rkw : c.kw}</div>
      <div class="luna-says"><b>오늘의 키워드 — ${s.e}</b><p>${d.rev ? c.rev : c.up}</p><p>오늘 하루 필요한 건 <b>${s.a}</b>${D.j(s.a, '이에요').slice(s.a.length)}. ${s.o}</p></div>
      <div class="grid2"><div class="mini"><b>사랑</b><p class="small">${c.love[d.rev ? 1 : 0]}</p></div><div class="mini"><b>일·돈</b><p class="small">${c.work[d.rev ? 1 : 0]}</p></div></div>
      <details class="look"><summary>👁 그림 읽기</summary><p>${TR.lookLine(c, d.rev)}</p></details>
      <p class="reply" id="dreply"></p>
      <div class="inline" style="justify-content:center;margin-top:12px"><button class="btn" id="home">처음으로</button><button class="btn primary" id="ask">고민 상담하기</button></div></div>`;
    content.querySelector('#home').onclick = () => menu();
    content.querySelector('#ask').onclick = () => askTopic();
    await dlg.say(`오늘의 카드는 **${c.name}**${d.rev ? ', 거꾸로예요' : '예요'}. 오늘의 키워드는 **${s.e}**.`, { expr: c.arcana === 'major' ? 'surprise' : 'smile' });
    const ans = await dlg.choose([{ label: '맞아요', value: 'yes' }, { label: '글쎄요', value: 'maybe' }, { label: '아니에요', value: 'no' }], s.q, { expr: 'mystic' });
    const reply = TR.pick(TR.REPLY[ans]);
    const rp = content.querySelector('#dreply'); if (rp) rp.textContent = `루나: ${reply}`;
    await dlg.say(reply, { expr: 'smile' });
    dlg.quiet(c.advice[d.rev ? 1 : 0], { expr: 'mystic' });
  }

  /* ── 세 묶음 고르기 ── */
  const PILE_THEMES = [
    { key: 'heart', label: '그 사람의 속마음', pos: ['그 사람이 보는 나', '그 사람의 진짜 마음', '앞으로 다가올 것'], kinds: ['seen', 'other', 'future'], field: 'love' },
    { key: 'month', label: '다가올 한 달의 흐름', pos: ['이번 달의 분위기', '조심할 것', '선물처럼 올 것'], kinds: ['present', 'obstacle', 'future'], field: 'gen' },
    { key: 'msg', label: '지금 나에게 필요한 메시지', pos: ['지금의 나', '내려놓을 것', '붙잡을 것'], kinds: ['present', 'release', 'hold'], field: 'gen' },
  ];
  async function pickPile() {
    const th = await dlg.choose(PILE_THEMES.map(t => ({ label: t.label, value: t.key })), '어떤 주제로 골라 볼까요?', { expr: 'mystic' });
    const theme = PILE_THEMES.find(t => t.key === th);
    let deck = newDeck(); for (let i = 0; i < 7; i++) deck = shuffleOnce(deck, true);
    const piles = [deck.slice(0, 3), deck.slice(3, 6), deck.slice(6, 9)];
    A.preload(piles.flat().map(x => x.id));
    const icons = ['🌙', '🔮', '🕯️'];
    show(`<div class="panel" style="text-align:center"><h2>Pick a Pile</h2><p class="muted">${theme.label}</p>
      <div class="piles">${piles.map((p, i) => `<button class="pile" data-i="${i}"><div class="stack">${[0, 1, 2].map(k => `<div style="position:absolute;inset:0;transform:translate(${k * 2}px,${-k * 2}px) rotate(${(k - 1) * 3}deg)">${A.back()}</div>`).join('')}</div><span>${icons[i]} ${i + 1}번</span></button>`).join('')}</div>
      <p class="muted small">숨을 한 번 고르고, 눈에 먼저 들어온 묶음을 골라요.</p><div id="pres"></div></div>`);
    dlg.quiet('세 묶음 중에 끌리는 하나를 골라요. 영상 너머의 사람들도 다 이렇게 고르죠. 후후.', { expr: 'smile' });
    const pileLines = p => p.map((x, k) => { const c = BY_ID[x.id]; return { c, rev: x.rev, line: TR.positionLine(theme.kinds[k], c, x.rev), extra: theme.field === 'love' ? c.love[x.rev ? 1 : 0] : (x.rev ? c.rev : c.up) }; });
    const pick = async i => {
      const p = piles[i];
      content.querySelector('.piles').outerHTML = `<div class="spread s-three" style="margin-top:16px">${p.map((x, k) => `<div class="slot">${cardEl(x)}<div class="plabel">${theme.pos[k]}</div></div>`).join('')}</div>`;
      const els = [...content.querySelectorAll('.spread .tcard')];
      for (const el of els) { await D.sleep(450); el.classList.add('flipped'); D.sfx.flip(); }
      await D.sleep(500);
      const L = pileLines(p);
      const last = L[2];
      content.querySelector('#pres').innerHTML = `<div class="fade-in" style="text-align:left"><h3>${icons[i]} ${i + 1}번을 고른 당신에게</h3>
        ${L.map((x, k) => `<div class="card-read"><div>${cardEl(p[k], { flipped: true })}</div><div><div class="pos">${theme.pos[k]}</div><h3>${x.c.name}<span class="orient ${x.rev ? 'rev' : 'up'}">${x.rev ? '역' : '정'}</span></h3><p>${md(x.line)}</p><p class="muted small">${x.extra}</p></div></div>`).join('')}
        <div class="luna-says"><b>루나의 한마디</b><p>${last.c.advice[last.rev ? 1 : 0]}</p></div>
        <div class="inline" style="justify-content:center"><button class="btn" id="others">다른 묶음도 열어 보기</button><button class="btn" id="home">처음으로</button></div></div>`;
      content.querySelector('#home').onclick = () => menu();
      content.querySelector('#others').onclick = () => {
        content.querySelector('#others').remove();
        const more = [0, 1, 2].filter(k => k !== i).map(k => `<h3>${icons[k]} ${k + 1}번이었다면</h3>${pileLines(piles[k]).map((x, q) => `<p class="small"><b>${theme.pos[q]} · ${x.c.name}${x.rev ? '(역)' : ''}</b> — ${md(x.line)}</p>`).join('')}`).join('');
        content.querySelector('#pres').insertAdjacentHTML('beforeend', `<div class="mini fade-in" style="text-align:left;margin-top:12px">${more}<p class="muted small">그래도 처음 끌린 묶음이 지금의 당신에게 온 메시지예요.</p></div>`);
      };
      await dlg.say(`${i + 1}번을 골랐군요.`, { expr: 'smile' });
      for (const x of L) await dlg.say(x.line, { expr: x.rev ? 'serious' : 'mystic' });
      dlg.quiet(last.c.advice[last.rev ? 1 : 0], { expr: 'smile' });
    };
    await new Promise(res => content.querySelectorAll('.pile').forEach(b => b.onclick = () => { D.sfx.pick(); res(); pick(+b.dataset.i); }));
  }

  /* ── 카드 도감 ── */
  function library(filter = 'major') {
    const groups = [['major', '메이저'], ['wands', '완드'], ['cups', '컵'], ['swords', '소드'], ['pentacles', '펜타클']];
    const list = T.CARDS.filter(c => filter === 'major' ? c.arcana === 'major' : c.suit === filter);
    show(`<div class="panel"><h2>Card Library</h2><p class="muted small">1909년 라이더-웨이트-스미스 원본(그림 Pamela Colman Smith, 퍼블릭 도메인). 카드를 누르면 자세히 볼 수 있어요.</p>
      <nav class="tabs lib-tabs">${groups.map(([k, l]) => `<button data-k="${k}" class="${k === filter ? 'on' : ''}">${l}</button>`).join('')}</nav>
      <div class="lib-grid">${list.map(c => `<button class="lib-card" data-id="${c.id}"><img src="${A.src(c)}" alt="${c.name}" loading="lazy"><small>${c.name}</small></button>`).join('')}</div>
      <div id="libd"></div>
      <div class="inline" style="margin-top:12px"><button class="btn" id="home">처음으로</button></div></div>`);
    content.querySelectorAll('.lib-tabs button').forEach(b => b.onclick = () => { D.sfx.pick(); library(b.dataset.k); });
    content.querySelector('#home').onclick = () => menu();
    content.querySelectorAll('.lib-card').forEach(b => b.onclick = () => {
      D.sfx.flip();
      const c = BY_ID[b.dataset.id], u = TR.slot(c.id, false), r = TR.slot(c.id, true);
      const box = content.querySelector('#libd');
      box.innerHTML = `<div class="lib-detail fade-in"><div class="ld-img"><img src="${A.src(c)}" alt="${c.name}"></div><div>
        <h3>${c.name} <small class="muted">${c.en}</small></h3><div class="kw muted small">${c.astro} · ${TR.elementOf(c)}의 원소</div>
        <p class="muted small">${c.img}</p>${X.SYMBOL[c.id] ? `<p class="small">🔍 ${X.SYMBOL[c.id]}</p>` : ''}
        <div class="grid2">
          <div class="mini"><h4><span class="orient up">정방향</span> ${u.e}</h4><p class="small">${c.up}</p><p class="small"><b>사랑</b> ${c.love[0]}</p><p class="small"><b>일·돈</b> ${c.work[0]}</p><p class="small"><b>조언</b> ${c.advice[0]}</p></div>
          <div class="mini"><h4><span class="orient rev">역방향</span> ${r.e}</h4><p class="small">${c.rev}</p><p class="small"><b>사랑</b> ${c.love[1]}</p><p class="small"><b>일·돈</b> ${c.work[1]}</p><p class="small"><b>조언</b> ${c.advice[1]}</p></div>
        </div></div></div>`;
      box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      dlg.quiet(`**${c.name}** — 정방향은 ${u.e}, 거꾸로면 ${r.e}${D.j(r.e, '이에요').slice(r.e.length)}.`, { expr: 'mystic' });
    });
    dlg.quiet('카드를 하나씩 눌러 봐요. 백 년도 더 된 그림 속에 상징이 가득하답니다.', { expr: 'smile' });
  }

  /* ── 타로 이야기 ── */
  async function learn() {
    show(`<div class="panel"><h2>About Tarot</h2>
      <p>타로는 15세기 이탈리아의 카드 놀이 ‘타로키(tarocchi)’에서 시작해, 18~19세기 프랑스와 영국의 신비주의자들을 거치며 점술 도구가 되었어요. 오늘날 가장 널리 쓰이는 덱은 1909년 아서 에드워드 웨이트(A. E. Waite)의 감수로 파멜라 콜먼 스미스(Pamela Colman Smith)가 그린 <b>라이더-웨이트-스미스 덱</b>이에요. 이곳의 카드는 바로 그 1909년 원본 그림이고, 웨이트는 이듬해 해설서 『The Pictorial Key to the Tarot』(1910)를 냈어요.</p>
      <h3>메이저 아르카나 22장</h3><p>바보(0)에서 세계(21)까지, 한 영혼의 여정을 그린 큰 상징들이에요. 리딩에 많이 나오면 삶의 큰 흐름이 움직이는 때라고 봐요.</p>
      <h3>마이너 아르카나 56장</h3><p>완드(불·열정), 컵(물·감정), 소드(공기·생각), 펜타클(흙·현실) 네 수트가 에이스~10과 시종·기사·여왕·왕으로 이뤄져요. 스미스는 마이너 카드에도 장면을 그려 넣은 최초의 화가 중 한 명이라, 그림만 보고도 이야기를 읽을 수 있어요.</p>
      <h3>역방향</h3><p>카드가 거꾸로 나오면 그 의미가 막히거나, 지나치거나, 안으로 향한다고 읽어요. 웨이트도 해설서에 정방향과 역방향의 뜻을 따로 적었어요.</p>
      <h3>원소의 상성</h3><p>골든 던 전통에서는 이웃한 카드의 원소끼리 서로 돕거나(불↔공기, 물↔흙) 부딪친다고(불↔물, 공기↔흙) 봐요. 루나의 종합 리딩도 이 흐름을 함께 읽어요.</p>
      <h3>좋은 질문</h3><p>“될까요?”보다 “어떻게 하면 좋을까요?”, “그 사람은 날 좋아해요?”보다 “그 사람과 가까워지려면 무엇이 필요할까요?”처럼, 내가 움직일 수 있는 열린 질문이 좋은 리딩을 만들어요.</p></div>`);
    await dlg.say('타로는 미래를 못 박는 예언이 아니에요. 그림 속 상징을 거울 삼아, 이미 마음 깊이 알고 있던 걸 꺼내 보는 거예요.', { expr: 'mystic' });
    const v = await dlg.choose([{ label: '그럼 한번 뽑아 볼래요', value: 'ask', primary: true }, { label: '카드 도감 보기', value: 'library' }, { label: '처음으로', value: 'menu' }], '어때요, 카드에게 한번 물어볼래요?', { expr: 'smile' });
    v === 'ask' ? askTopic() : v === 'library' ? library() : menu();
  }

  greet();
})();
