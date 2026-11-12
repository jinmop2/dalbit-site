/* 달빛골목 — 공통 도구: 저장, 난수, 조사, 효과음, 대화창, 생년월일 폼, 상단 바 */
(function () {
  'use strict';
  const D = (window.Dalbit = {});

  /* ── 저장 ── */
  D.load = (k, def) => { try { const v = localStorage.getItem('dalbit:' + k); return v == null ? def : JSON.parse(v); } catch (e) { return def; } };
  D.save = (k, v) => { try { localStorage.setItem('dalbit:' + k, JSON.stringify(v)); } catch (e) { /* 저장 불가 환경 */ } };

  /* ── 해시·난수 ── */
  D.hash = (str, seed = 0) => {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0; i < str.length; i++) { const ch = str.charCodeAt(i); h1 = Math.imul(h1 ^ ch, 2654435761); h2 = Math.imul(h2 ^ ch, 1597334677); }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
  };
  D.rng = seed => { let a = (typeof seed === 'string' ? D.hash(seed) : seed) >>> 0; return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  D.pick = (arr, r = Math.random) => arr[Math.floor(r() * arr.length)];
  // 진짜 섞기용 (암호학적 난수)
  D.secureRandom = () => { try { const u = new Uint32Array(1); crypto.getRandomValues(u); return u[0] / 4294967296; } catch (e) { return Math.random(); } };
  D.shuffle = (arr, r = D.secureRandom) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  /* ── 한국어 조사 ── */
  const hasBatchim = w => {
    const s = String(w).replace(/[\s)\]」』"'’”.!?]+$/, '');
    const c = s.charCodeAt(s.length - 1);
    if (c >= 0xac00 && c <= 0xd7a3) return (c - 0xac00) % 28;
    if (/[0-9]$/.test(s)) return [1, 1, 0, 1, 0, 0, 1, 1, 1, 0][+s.slice(-1)] ? 1 : 0; // 영·일·이·삼…
    return 0;
  };
  // D.j('갑목', '은는') → '갑목은'
  D.j = (word, pair) => {
    const b = hasBatchim(word);
    const map = { 은는: ['은', '는'], 이가: ['이', '가'], 을를: ['을', '를'], 과와: ['과', '와'], 아야: ['아', '야'], 이여: ['이여', '여'], 이에요: ['이에요', '예요'], 이라: ['이라', '라'], 이랑: ['이랑', '랑'] };
    if (pair === '으로') return word + (b && b !== 8 ? '으로' : '로');
    const p = map[pair];
    return word + (b ? p[0] : p[1]);
  };

  /* ── 효과음 (Web Audio 합성) ── */
  let ctx = null, muted = D.load('muted', false);
  const ac = () => { if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ctx = null; } } if (ctx && ctx.state === 'suspended') ctx.resume(); return ctx; };
  function tone(freq, dur, { type = 'sine', vol = 0.12, attack = 0.005, delay = 0, slide = 0 } = {}) {
    const c = ac(); if (!c || muted) return;
    const t = c.currentTime + delay;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(freq * slide, t + dur);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + attack); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(c.destination); o.start(t); o.stop(t + dur + 0.05);
  }
  function noise(dur, { vol = 0.08, delay = 0, freq = 2000, q = 0.8 } = {}) {
    const c = ac(); if (!c || muted) return;
    const t = c.currentTime + delay;
    const len = Math.floor(c.sampleRate * dur), buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    s.buffer = buf; f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = q; g.gain.value = vol;
    s.connect(f).connect(g).connect(c.destination); s.start(t);
  }
  D.sfx = {
    bell() { [1568, 2093, 2637].forEach((f, i) => tone(f, 1.6, { vol: 0.05, delay: i * 0.09 })); tone(784, 1.8, { vol: 0.04 }); },
    chime() { [880, 1320, 1760, 2217].forEach((f, i) => tone(f, 1.2, { vol: 0.04, delay: i * 0.12, type: 'triangle' })); },
    flip() { noise(0.12, { vol: 0.12, freq: 2600 }); tone(420, 0.08, { vol: 0.03, type: 'triangle' }); },
    shuffle() { for (let i = 0; i < 7; i++) noise(0.05, { vol: 0.07, delay: i * 0.045, freq: 1800 + Math.random() * 1600 }); },
    pick() { tone(660, 0.18, { vol: 0.06, type: 'triangle', slide: 1.5 }); },
    whoosh() { noise(0.5, { vol: 0.06, freq: 700, q: 0.4 }); },
    brush() { noise(0.35, { vol: 0.05, freq: 900, q: 0.6 }); },
    magic() { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.7, { vol: 0.04, delay: i * 0.07, type: 'sine' })); },
    blip(pitch = 520) { tone(pitch + Math.random() * 40, 0.04, { vol: 0.018, type: 'square' }); },
    gong() { tone(196, 3, { vol: 0.08, type: 'sine' }); tone(293, 2.5, { vol: 0.03 }); tone(392, 2, { vol: 0.02 }); },
    light() { noise(0.09, { vol: 0.14, freq: 3400, q: 1.4 }); noise(0.7, { vol: 0.05, freq: 520, q: 0.5, delay: 0.07 }); for (let i = 0; i < 4; i++) noise(0.02, { vol: 0.03, freq: 2400, delay: 0.35 + i * 0.13 }); },
  };
  D.isMuted = () => muted;
  D.setMuted = m => { muted = !!m; D.save('muted', muted); };

  /* ── 대화창 ── */
  // dialog: .dialog 요소, actor: Characters.mount 결과
  D.Dialog = function (el, actor, opts = {}) {
    const line = el.querySelector('.line'), choices = el.querySelector('.choices');
    let skip = null, advance = null, busy = false, token = 0;
    const pitch = opts.pitch || 520;
    el.addEventListener('click', e => {
      if (e.target.closest('button, input, select, textarea, label, a')) return;
      if (skip) skip(); else if (advance) advance();
    });
    document.addEventListener('keydown', e => {
      if ((e.key === 'Enter' || e.key === ' ') && !e.target.closest('input, textarea, select, button')) {
        if (skip || advance) { e.preventDefault(); if (skip) skip(); else advance(); }
      }
    });
    function render(text) {
      // **굵게** 와 줄바꿈만 지원. 글자마다 span 으로 감싸 차례로 보이게 한다.
      const parts = String(text).split(/(\*\*[^*]+\*\*)/);
      let html = '';
      for (const p of parts) {
        const bold = /^\*\*.*\*\*$/.test(p);
        const s = bold ? p.slice(2, -2) : p;
        const chars = Array.from(s).map(ch => ch === '\n' ? '<br>' : `<span class="c">${ch.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</span>`).join('');
        html += bold ? `<b>${chars}</b>` : chars;
      }
      line.innerHTML = html;
      return Array.from(line.querySelectorAll('.c'));
    }
    // 한 줄 말하기. wait=false 면 다 쓰고 바로 다음으로
    async function say(text, o = {}) {
      if (o.expr && actor) actor.set(o.expr);
      choices.innerHTML = '';
      el.classList.remove('waiting');
      const my = ++token; // 새 대사가 시작되면 이전 대사는 그 자리에서 멈춘다
      advance = null;
      const cs = render(text);
      busy = true;
      if (actor) actor.talk(true);
      await new Promise(res => {
        let i = 0, done = false;
        const finish = () => { if (done) return; done = true; cs.forEach(c => c.classList.add('on')); if (my === token) skip = null; res(); };
        skip = finish;
        const step = () => {
          if (done) return;
          if (my !== token) { done = true; return res(); }
          if (i >= cs.length) return finish();
          const c = cs[i++]; c.classList.add('on');
          const ch = c.textContent;
          if (i % 3 === 0 && ch.trim()) D.sfx.blip(pitch);
          const delay = /[.!?…]/.test(ch) ? 220 : /[,~]/.test(ch) ? 110 : (o.speed || 30);
          setTimeout(step, delay);
        };
        step();
      });
      if (my !== token) return new Promise(() => {}); // 끊긴 대사의 흐름은 더 이어지지 않는다
      if (actor) actor.talk(false);
      busy = false;
      if (o.after && actor) actor.set(o.after);
      if (o.wait === false) return;
      el.classList.add('waiting');
      await new Promise(res => { advance = () => { advance = null; el.classList.remove('waiting'); res(); }; });
    }
    // 여러 줄을 차례로
    async function script(lines) { for (const l of lines) { if (typeof l === 'string') await say(l); else await say(l.t, l); } }
    // 선택지. items: [{label, value}] 또는 문자열. 마지막 대사는 남겨 둔다.
    function choose(items, text, o = {}) {
      return new Promise(async res => {
        if (text) await say(text, Object.assign({}, o, { wait: false }));
        choices.innerHTML = '';
        items.forEach(it => {
          const b = document.createElement('button');
          b.className = 'btn' + (it.primary ? ' primary' : '');
          b.textContent = typeof it === 'string' ? it : it.label;
          b.onclick = ev => { ev.stopPropagation(); choices.innerHTML = ''; D.sfx.pick(); res(typeof it === 'string' ? it : it.value); };
          choices.appendChild(b);
        });
      });
    }
    function quiet(text, o = {}) { return say(text, Object.assign({}, o, { wait: false })); }
    // 휴대폰: 대사창 자리가 화면 밖으로 나가면 대사창을 화면 아래에 붙인다
    if ('IntersectionObserver' in window) {
      const slot = document.createElement('div');
      slot.className = 'dialog-slot';
      el.parentNode.insertBefore(slot, el); slot.appendChild(el);
      const mq = window.matchMedia('(max-width: 860px)');
      let visible = true;
      const sync = () => {
        const dock = mq.matches && !visible;
        if (dock && !el.classList.contains('docked')) slot.style.minHeight = slot.offsetHeight + 'px';
        el.classList.toggle('docked', dock);
        if (!dock) slot.style.minHeight = '';
      };
      new IntersectionObserver(es => { visible = es[0].isIntersecting; sync(); }, { threshold: 0.15 }).observe(slot);
      mq.addEventListener ? mq.addEventListener('change', sync) : mq.addListener(sync);
    }
    return { say, script, choose, quiet, get busy() { return busy; }, el };
  };

  /* ── 캐릭터를 탁자에 맞춰 앉히기 ──
   * 탁자 그림은 너비에 맞춰 커지고 무대 높이는 화면마다 달라서, 비율로만 두면 탁자가 얼굴까지 가리거나
   * 몸 끝이 탁자 위로 드러난다. 탁자 윗면을 실제로 재서, 탁자가 캐릭터의 가슴(chest 비율)에 오고
   * 머리 위로 무대의 4% 여유가 남도록 크기와 위치를 정한다. */
  D.fitActor = (stage, chest) => {
    const actor = stage && stage.querySelector('.actor'), front = stage && stage.querySelector('svg.front');
    if (!actor || !front) return;
    const ty = +front.dataset.tableY, vb = front.viewBox.baseVal;
    const fit = () => {
      const st = stage.getBoundingClientRect(), fr = front.getBoundingClientRect();
      if (!st.height || !fr.height) return;
      const scale = Math.min(fr.width / vb.width, fr.height / vb.height); // meet
      const tableTop = fr.bottom - st.top - (vb.height - ty) * scale;     // xMidYMax: 아래 맞춤
      const roomH = tableTop - st.height * 0.04;
      let w = Math.min((roomH / chest) * 360 / 440, st.width * 0.92, 520);
      const h = w * 440 / 360;
      actor.style.width = w + 'px';
      actor.style.top = (tableTop - chest * h) + 'px';
      actor.style.bottom = 'auto';
    };
    fit();
    window.addEventListener('resize', fit);
    if ('ResizeObserver' in window) new ResizeObserver(fit).observe(stage);
    return fit;
  };

  /* ── 상단 바 ── */
  D.topbar = function (opts = {}) {
    const bar = document.createElement('header');
    bar.className = 'topbar';
    bar.innerHTML = `<a class="home" href="index.html" aria-label="달빛골목 입구로"><span class="moon"></span>달빛골목</a><span class="spacer"></span>
      ${opts.extra || ''}
      <a class="icon-btn" href="sources.html" title="참고 자료와 계산 기준" aria-label="참고 자료">📜</a>
      <button class="icon-btn" id="muteBtn" title="소리 켜기/끄기" aria-label="소리 켜기/끄기">${muted ? '🔇' : '🔔'}</button>`;
    document.body.prepend(bar);
    bar.querySelector('#muteBtn').onclick = e => { D.setMuted(!muted); e.currentTarget.textContent = muted ? '🔇' : '🔔'; if (!muted) D.sfx.chime(); };
    return bar;
  };

  D.toast = function (msg, ms = 2200) {
    const t = document.createElement('div'); t.className = 'toast fade-in'; t.textContent = msg;
    document.body.appendChild(t); setTimeout(() => t.remove(), ms);
  };
  D.sleep = ms => new Promise(r => setTimeout(r, ms));
  D.isPhone = () => window.matchMedia('(max-width: 860px)').matches;
  // 요소의 맨 위가 화면 위(offset 만큼 아래)에 오도록 부드럽게 스크롤
  D.scrollToEl = (el, offset = 8) => {
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
  };
  // 붙어 있는(sticky) 탭 아래로 새 내용의 머리가 오게
  D.scrollBelowTabs = (el, tabs) => {
    const stickTop = tabs ? parseFloat(getComputedStyle(tabs).top) || 0 : 0;
    D.scrollToEl(el, (tabs ? tabs.offsetHeight + stickTop : 0) + 8);
  };
  D.esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ── 지금 시각 (한국) ── */
  D.kst = (d = new Date()) => { const n = new Date(d.getTime() + 9 * 3600e3); return { y: n.getUTCFullYear(), m: n.getUTCMonth() + 1, d: n.getUTCDate(), h: n.getUTCHours(), mi: n.getUTCMinutes(), dow: n.getUTCDay() }; };
  D.timeGreeting = () => {
    const force = new URLSearchParams(location.search).get('time'); // 미리보기용: ?time=evening
    if (['deep', 'morning', 'day', 'evening', 'night'].includes(force)) return force;
    const h = D.kst().h;
    if (h < 5) return 'deep'; if (h < 11) return 'morning'; if (h < 17) return 'day'; if (h < 21) return 'evening'; return 'night';
  };

  /* ── 생년월일시 입력 폼 ── */
  const SIJIN = [['자시', 23, '23:30~01:29'], ['축시', 1, '01:30~03:29'], ['인시', 3, '03:30~05:29'], ['묘시', 5, '05:30~07:29'], ['진시', 7, '07:30~09:29'], ['사시', 9, '09:30~11:29'], ['오시', 11, '11:30~13:29'], ['미시', 13, '13:30~15:29'], ['신시', 15, '15:30~17:29'], ['유시', 17, '17:30~19:29'], ['술시', 19, '19:30~21:29'], ['해시', 21, '21:30~23:29']];
  D.profile = () => D.load('profile', null);
  D.describeProfile = p => {
    if (!p) return '';
    const cal = p.calendar === 'lunar' ? `음력${p.leap ? '(윤달)' : ''}` : '양력';
    const t = p.timeUnknown ? '시간 모름' : `${String(p.hour).padStart(2, '0')}:${String(p.minute).padStart(2, '0')}`;
    return `${p.name ? p.name + ' · ' : ''}${p.gender === 'female' ? '여' : '남'} · ${cal} ${p.year}.${p.month}.${p.day} · ${t}`;
  };
  // container 에 폼을 그리고, 제출되면 profile 객체로 resolve
  D.birthForm = function (container, opts = {}) {
    const S = window.SajuCore;
    const init = Object.assign({ name: '', gender: 'female', calendar: 'solar', leap: false, year: 1995, month: 1, day: 1, hour: 12, minute: 0, timeUnknown: false, place: '서울', trueSolar: true, dayBoundary: 'midnight' }, opts.initial || {});
    const uid = 'bf' + Math.floor(Math.random() * 1e6);
    const now = D.kst();
    const yrs = []; for (let y = now.y; y >= 1920; y--) yrs.push(y);
    const opt = (arr, v, f = x => x) => arr.map(x => `<option value="${x}"${String(x) === String(v) ? ' selected' : ''}>${f(x)}</option>`).join('');
    const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
    container.innerHTML = `
      <form class="form" novalidate>
        ${opts.title ? `<h3>${opts.title}</h3>` : ''}
        ${opts.withName === false ? '' : `<div class="row"><label class="lbl" for="${uid}n">이름 또는 별명 <span class="small">(선택)</span></label><input type="text" id="${uid}n" name="name" maxlength="12" placeholder="예: 달님" value="${D.esc(init.name || '')}"></div>`}
        <div class="row"><span class="lbl">성별</span>
          <div class="seg"><input type="radio" id="${uid}gf" name="gender" value="female"${init.gender === 'female' ? ' checked' : ''}><label for="${uid}gf">여성</label><input type="radio" id="${uid}gm" name="gender" value="male"${init.gender === 'male' ? ' checked' : ''}><label for="${uid}gm">남성</label></div>
        </div>
        <div class="row"><span class="lbl">생년월일</span>
          <div class="inline">
            <div class="seg"><input type="radio" id="${uid}cs" name="calendar" value="solar"${init.calendar !== 'lunar' ? ' checked' : ''}><label for="${uid}cs">양력</label><input type="radio" id="${uid}cl" name="calendar" value="lunar"${init.calendar === 'lunar' ? ' checked' : ''}><label for="${uid}cl">음력</label></div>
            <label class="check leapbox${init.calendar === 'lunar' ? '' : ' hidden'}"><input type="checkbox" name="leap"${init.leap ? ' checked' : ''}> 윤달</label>
          </div>
          <div class="inline">
            <select name="year" aria-label="태어난 해">${opt(yrs, init.year, y => y + '년')}</select>
            <select name="month" aria-label="태어난 달">${opt(range(1, 12), init.month, m => m + '월')}</select>
            <select name="day" aria-label="태어난 날">${opt(range(1, 31), init.day, d => d + '일')}</select>
          </div>
        </div>
        ${opts.withTime === false ? '' : `
        <div class="row"><span class="lbl">태어난 시각</span>
          <div class="inline">
            <select name="hour" aria-label="시">${opt(range(0, 23), init.hour, h => String(h).padStart(2, '0') + '시')}</select>
            <select name="minute" aria-label="분">${opt(range(0, 59), init.minute, m => String(m).padStart(2, '0') + '분')}</select>
            <label class="check"><input type="checkbox" name="timeUnknown"${init.timeUnknown ? ' checked' : ''}> 시간을 몰라요</label>
          </div>
          <div class="small muted">대략만 알면 시진으로 골라도 돼요:
            <select name="sijin" aria-label="시진으로 고르기"><option value="">시진 고르기</option>${SIJIN.map(s => `<option value="${s[1]}">${s[0]} (${s[2]})</option>`).join('')}</select></div>
        </div>
        <div class="row"><label class="lbl" for="${uid}p">태어난 곳 <span class="small">(진태양시 보정용)</span></label>
          <select id="${uid}p" name="place">${S.PLACES.map(p => `<option value="${p[0]}"${p[0] === init.place ? ' selected' : ''}>${p[0]}</option>`).join('')}</select>
        </div>
        <details class="adv"><summary>전문 설정</summary>
          <div class="form" style="margin-top:10px">
            <label class="check"><input type="checkbox" name="trueSolar"${init.trueSolar !== false ? ' checked' : ''}> 진태양시 보정 (경도·균시차·서머타임)</label>
            <div class="row"><span class="lbl">자시(23시~01시) 보는 법</span>
              <select name="dayBoundary">
                <option value="midnight"${init.dayBoundary === 'midnight' ? ' selected' : ''}>야자시·조자시 구분 (자정에 날이 바뀜) — 기본</option>
                <option value="jasi"${init.dayBoundary === 'jasi' ? ' selected' : ''}>정자시 (23시에 날이 바뀜)</option>
                <option value="splitJasi"${init.dayBoundary === 'splitJasi' ? ' selected' : ''}>야자시: 날은 그대로, 시주만 다음날</option>
              </select></div>
          </div>
        </details>`}
        <div class="err" role="alert"></div>
        <div class="inline">
          <button type="submit" class="btn primary">${opts.submitLabel || '이대로 보기'}</button>
          ${opts.cancelLabel ? `<button type="button" class="btn cancel">${opts.cancelLabel}</button>` : ''}
        </div>
      </form>`;
    const f = container.querySelector('form');
    const leapbox = f.querySelector('.leapbox');
    f.querySelectorAll('input[name=calendar]').forEach(r => r.onchange = () => leapbox.classList.toggle('hidden', f.calendar.value !== 'lunar'));
    if (f.sijin) f.sijin.onchange = () => { if (f.sijin.value !== '') { f.hour.value = (+f.sijin.value + 1) % 24; f.minute.value = 30; f.timeUnknown.checked = false; } };
    if (f.timeUnknown) {
      const sync = () => { f.hour.disabled = f.minute.disabled = f.timeUnknown.checked; };
      f.timeUnknown.onchange = sync; sync();
    }
    return new Promise((res, rej) => {
      const cancel = f.querySelector('.cancel'); if (cancel) cancel.onclick = () => rej(new Error('cancel'));
      f.onsubmit = e => {
        e.preventDefault();
        const err = f.querySelector('.err'); err.textContent = '';
        const p = {
          name: f.name ? f.name.value.trim() : '',
          gender: f.gender.value, calendar: f.calendar.value, leap: f.leap.checked,
          year: +f.year.value, month: +f.month.value, day: +f.day.value,
          hour: f.hour ? +f.hour.value : 12, minute: f.minute ? +f.minute.value : 0,
          timeUnknown: f.timeUnknown ? f.timeUnknown.checked : true,
          place: f.place ? f.place.value : '서울',
          trueSolar: f.trueSolar ? f.trueSolar.checked : true,
          dayBoundary: f.dayBoundary ? f.dayBoundary.value : 'midnight',
        };
        try {
          if (p.calendar === 'lunar') S.lunarToSolar(p.year, p.month, p.day, p.leap);
          else {
            const dt = new Date(Date.UTC(p.year, p.month - 1, p.day));
            if (dt.getUTCMonth() !== p.month - 1) throw new Error('date');
          }
        } catch (x) {
          err.textContent = p.calendar === 'lunar' ? '그런 음력 날짜는 없어요. 윤달 여부와 날짜를 다시 봐 주세요.' : '달력에 없는 날짜예요. 다시 골라 주세요.';
          return;
        }
        if (opts.save !== false) D.save('profile', p);
        res(p);
      };
    });
  };
  D.toSajuInput = p => {
    const S = window.SajuCore;
    const pl = S.PLACES.find(x => x[0] === p.place) || S.PLACES[0];
    return { year: p.year, month: p.month, day: p.day, hour: p.hour, minute: p.minute, timeUnknown: p.timeUnknown, isLunar: p.calendar === 'lunar', isLeapMonth: !!p.leap, gender: p.gender, longitude: pl[1], trueSolar: p.trueSolar !== false, dayBoundary: p.dayBoundary || 'midnight' };
  };

  /* ── 떠다니는 빛 입자 ── */
  D.particles = function (canvas, kind = 'star') {
    const c = canvas.getContext('2d');
    let w, h, dpr = Math.min(window.devicePixelRatio || 1, 2), ps = [];
    const N = kind === 'fire' ? 14 : kind === 'dust' ? 40 : 60;
    function size() { w = canvas.clientWidth; h = canvas.clientHeight; canvas.width = w * dpr; canvas.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function spawn(init) {
      return { x: Math.random() * w, y: init ? Math.random() * h : h + 20, r: kind === 'fire' ? 4 + Math.random() * 6 : 0.6 + Math.random() * 1.8, vy: kind === 'star' ? 0 : -(0.15 + Math.random() * 0.5), vx: (Math.random() - 0.5) * 0.2, t: Math.random() * 6.28, s: 0.5 + Math.random() };
    }
    size(); window.addEventListener('resize', size);
    for (let i = 0; i < N; i++) ps.push(spawn(true));
    let last = performance.now();
    function frame(now) {
      const dt = Math.min(50, now - last) / 16.7; last = now;
      c.clearRect(0, 0, w, h);
      for (const p of ps) {
        p.t += 0.02 * dt * p.s; p.x += (p.vx + Math.sin(p.t) * 0.15) * dt; p.y += p.vy * dt;
        if (p.y < -20) Object.assign(p, spawn(false));
        const a = kind === 'star' ? 0.35 + 0.65 * Math.abs(Math.sin(p.t)) : 0.5 + 0.5 * Math.sin(p.t * 1.3);
        if (kind === 'fire') {
          const g = c.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3);
          g.addColorStop(0, `rgba(170,220,255,${0.75 * a})`); g.addColorStop(0.4, `rgba(90,150,255,${0.35 * a})`); g.addColorStop(1, 'rgba(60,90,255,0)');
          c.fillStyle = g; c.beginPath(); c.arc(p.x, p.y, p.r * 3, 0, 6.29); c.fill();
        } else {
          c.fillStyle = kind === 'dust' ? `rgba(255,220,160,${0.5 * a})` : `rgba(255,248,220,${a})`;
          c.beginPath(); c.arc(p.x, p.y, p.r, 0, 6.29); c.fill();
        }
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  };
})();
