/* 달빛골목 — 타로 리딩 엔진: 자리별 문장, 이야기로 꿰기, 조합, 원소 상성, 시기, 마음 온도 */
(function () {
  'use strict';
  const D = window.Dalbit, T = window.TarotData, X = window.TarotDeep;
  const BY = Object.fromEntries(T.CARDS.map(c => [c.id, c]));
  const pj = (w, p) => D.j(w, p).slice(String(w).length); // 조사만
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];

  // 배열별 자리의 성격
  const KINDS = {
    one: ['msg'], three: ['past', 'present', 'future'],
    love: ['self', 'other', 'relation', 'obstacle', 'outcome'],
    choice: ['self', 'path', 'pathEnd', 'path', 'pathEnd'],
    celtic: ['present', 'obstacle', 'goal', 'root', 'past', 'future', 'self', 'env', 'hope', 'outcome'],
  };
  const slot = (id, rev) => { const d = X.DEEP[id]; const k = rev ? 1 : 0; return { e: d[k], f: d[2 + k], a: d[4 + k], o: d[6 + k], q: d[8 + k] }; };
  const elementOf = c => (c.arcana === 'major' ? X.MAJOR_EL[c.num] : T.SUITS[c.suit].el);
  const isCourt = c => c.arcana === 'minor' && c.rank >= 10;
  const COURT_PERSON = ['새로 등장하는 젊은 사람이나 반가운 소식', '빠르게 움직이는 사람, 혹은 일의 급한 진행', '성숙하고 따뜻한 사람(여성적인 기운)', '책임과 권위를 가진 사람(남성적인 기운)'];

  /* ── 자리별 한 문장 ── */
  function positionLine(kind, c, rev) {
    const s = slot(c.id, rev);
    const good = !rev && c.yes > 0;
    switch (kind) {
      case 'msg': return `지금 당신에게 필요한 건 **${s.a}**${pj(s.a, '이에요')}.`;
      case 'past': return `이 일의 뿌리엔 **${s.e}**${pj(s.e, '이가')} 있었어요.`;
      case 'present': return `지금 당신은 **${s.e}** 한가운데 서 있어요.`;
      case 'future': return `곧 다가올 흐름은 이래요. ${s.o}`;
      case 'outcome': return `이 흐름이 닿는 곳 — ${s.o}`;
      case 'obstacle': return good ? `좋은 카드지만 이 자리에선 달라요. **${s.e}**조차 지나치면 발목을 잡을 수 있어요.` : `지금 길을 막고 있는 건 **${s.e}**${pj(s.e, '이에요')}.`;
      case 'goal': return `머리로는 **${s.e}**${pj(s.e, '을를')} 바라고 있어요.`;
      case 'root': return `마음 깊은 바닥엔 **${s.f}**${pj(s.f, '이가')} 깔려 있어요.`;
      case 'self': return `당신 안에는 지금 **${s.f}**${pj(s.f, '이가')} 있어요.`;
      case 'other': return `그 사람의 마음속엔 **${s.f}**${pj(s.f, '이가')} 자리하고 있어요.`;
      case 'relation': return `두 사람 사이엔 지금 **${s.e}**의 기운이 흐르고 있어요.`;
      case 'env': return `주변에선 **${s.e}**의 바람이 불어오고 있어요.`;
      case 'hope': return `당신은 **${s.e}**${pj(s.e, '을를')} 바라면서도, 한편으론 그게 두렵기도 해요.`;
      case 'path': return `그 길을 고르면 **${s.e}**${pj(s.e, '을를')} 지나게 돼요.`;
      case 'pathEnd': return `그 끝에서는 — ${s.o}`;
      case 'seen': return `그 사람은 당신에게서 **${s.e}**${pj(s.e, '을를')} 느끼고 있어요.`;
      case 'release': { const r = rev ? s.e : X.DEEP[c.id][1]; return `내려놓아야 할 건 **${r}**${pj(r, '이에요')}.`; }
      case 'hold': return `꼭 붙잡아야 할 건 **${s.a}**${pj(s.a, '이에요')}.`;
      default: return '';
    }
  }

  // 카드를 꺼내 놓을 때 루나의 첫마디
  function leadLine(c, rev, posName) {
    const nm = `**${c.name}**`;
    if (c.arcana === 'major') return rev ? `${posName}에 ${nm}, 거꾸로예요. 무겁지만 꼭 들어야 할 이야기예요.` : pick([`${posName} 자리에 메이저 아르카나 ${nm}${pj(c.name, '이가')} 나왔어요. 이건 꽤 큰 메시지예요.`, `오… ${posName}에 ${nm}. 운명의 큰 카드가 나왔네요.`]);
    if (isCourt(c)) return `${posName}엔 궁정 카드 ${nm}${rev ? ' 역방향' : ''}. 이 카드는 사람일 수도 있어요 — ${COURT_PERSON[c.rank - 10]}.`;
    return rev ? `${posName}엔 ${nm}${pj(c.name, '이가')} 거꾸로 나왔어요. ${c.rkw.split('·')[0]}의 기운이에요.` : `${posName}엔 ${nm}. ${c.kw.split('·')[0]}의 기운이 보여요.`;
  }

  function lookLine(c, rev) {
    let t = `그림을 봐요. ${c.img}`;
    if (X.SYMBOL[c.id]) t += ' ' + X.SYMBOL[c.id];
    if (rev) t += ' 이 장면이 거꾸로 나왔으니, 그 기운이 막혀 있거나 안으로 숨어 들었다는 뜻이에요.';
    return t;
  }

  function topicLine(c, rev, field) {
    const k = rev ? 1 : 0;
    if (field === 'love') return c.love[k];
    if (field === 'work') return c.work[k];
    return rev ? c.rev : c.up;
  }

  // 카드 한 장의 풀이 묶음
  function readCard(entry, spreadKey, i, field) {
    const c = BY[entry.id], rev = entry.rev;
    const sp = T.SPREADS[spreadKey];
    const [posName, posDesc] = sp.pos[i];
    const kind = KINDS[spreadKey][i];
    const s = slot(c.id, rev);
    const lines = [positionLine(kind, c, rev), topicLine(c, rev, field)];
    if (field !== 'gen') lines.push(rev ? c.rev : c.up);
    const advice = ['msg', 'self', 'obstacle', 'outcome', 'present'].includes(kind) ? `${s.a}${pj(s.a, '이에요')}` : null;
    return { c, rev, posName, posDesc, kind, lead: leadLine(c, rev, posName), look: lookLine(c, rev), lines, advice, q: s.q, el: elementOf(c), slot: s };
  }

  const REPLY = {
    yes: ['역시… 카드는 정직하네요.', '그럴 줄 알았어요. 이 카드가 그걸 먼저 짚었거든요.', '맞죠? 이 카드가 나오면 대개 그래요.', '후후, 카드가 당신을 꽤 잘 아네요.'],
    maybe: ['아직 잘 모르겠다면, 며칠 안에 알아차리게 될 거예요. 이 카드를 기억해 둬요.', '마음 한구석을 조용히 들여다보면 보일 거예요.', '괜찮아요. 카드는 가끔 한발 앞서 말하거든요.'],
    no: ['그렇다면 이 카드는 앞으로 다가올 일에 대한 귀띔일지도 몰라요.', '좋아요. 그럼 경고라기보다 미리 건네는 쪽지라고 생각해요.', '그것도 답이에요. 카드는 다른 쪽에서 이 이야기를 하고 있는 걸지도요.'],
  };

  /* ── 원소 상성 (골든 던의 원소 품위) ── */
  const FRIEND = { 불: '공기', 공기: '불', 물: '흙', 흙: '물' };
  const ENEMY = { 불: '물', 물: '불', 공기: '흙', 흙: '공기' };
  function elementRel(a, b) {
    if (a === b) return 'same';
    if (FRIEND[a] === b) return 'friend';
    if (ENEMY[a] === b) return 'enemy';
    return 'neutral';
  }
  function elementFlow(reads) {
    const out = { same: 0, friend: 0, enemy: 0, neutral: 0, pairs: [] };
    for (let i = 0; i < reads.length - 1; i++) {
      const r = elementRel(reads[i].el, reads[i + 1].el);
      out[r]++; out.pairs.push([i, i + 1, r]);
    }
    const counts = {};
    reads.forEach(r => counts[r.el] = (counts[r.el] || 0) + 1);
    out.counts = counts;
    return out;
  }

  /* ── 이야기로 꿰기 ── */
  function story(spreadKey, reads) {
    const S = i => reads[i].slot;
    const E = i => `**${S(i).e}**`;
    const good = i => !reads[i].rev && reads[i].c.yes > 0;
    // 장애물 자리에 좋은 카드가 오면 '지나침'으로 읽는다
    const block = (i, verb) => good(i) ? `${E(i)}조차 지나치면 ${verb === 'love' ? '걸림돌이 될 수 있어요' : '그 앞을 가로막을 수 있어요'}.` : `${E(i)}${pj(S(i).e, '이가')} ${verb === 'love' ? '걸림돌이 되고 있어요' : '그 앞을 가로지르고 있어요'}.`;
    switch (spreadKey) {
      case 'one': return [`오늘 카드가 당신에게 건네는 한마디 — ${S(0).a}${pj(S(0).a, '이에요')}.`, S(0).o];
      case 'three': return [`과거의 ${E(0)}${pj(S(0).e, '이가')} 지금의 ${E(1)}${pj(S(1).e, '으로')} 이어졌어요.`, `이대로 흘러간다면 — ${S(2).o}`];
      case 'love': return [`당신은 **${S(0).f}**${pj(S(0).f, '을를')} 품고 있고, 그 사람은 **${S(1).f}**${pj(S(1).f, '을를')} 품고 있어요.`, `지금 두 사람 사이엔 ${E(2)}${pj(S(2).e, '이가')} 흐르고, ${block(3, 'love')}`, `앞으로는 — ${S(4).o}`];
      case 'choice': return [`지금 당신은 **${S(0).f}**${pj(S(0).f, '으로')} 갈림길에 서 있어요.`, `A를 고르면 ${E(1)}${pj(S(1).e, '을를')} 지나 — ${S(2).o}`, `B를 고르면 ${E(3)}${pj(S(3).e, '을를')} 지나 — ${S(4).o}`];
      case 'celtic': return [
        `지금 당신은 ${E(0)} 속에 있고, ${block(1, 'celtic')}`,
        `머리로는 ${E(2)}${pj(S(2).e, '을를')} 원하지만, 마음 깊은 곳엔 **${S(3).f}**${pj(S(3).f, '이가')} 깔려 있죠.`,
        `${E(4)}${pj(S(4).e, '이가')} 막 지나갔고, 곧 ${E(5)}${pj(S(5).e, '이가')} 다가와요.`,
        `당신은 **${S(6).f}**${pj(S(6).f, '으로')} 이 일을 대하고 있고, 주변에선 ${E(7)}의 바람이 불어요.`,
        `바라면서도 두려운 건 ${E(8)}.`, `그리고 이 모든 흐름이 닿는 곳 — ${S(9).o}`];
      default: return [];
    }
  }

  // 조합: 둘 다 거꾸로면 빼고, 하나만 거꾸로면 기운이 약하다고 덧붙인다
  function combosIn(reads) {
    const rev = Object.fromEntries(reads.map(r => [r.c.id, r.rev]));
    return X.COMBOS.filter(([a, b]) => a in rev && b in rev && !(rev[a] && rev[b]))
      .map(([a, b, t, d]) => [a, b, t, rev[a] || rev[b] ? `${d} 다만 한 장이 거꾸로 나와 이 기운은 아직 약하거나 뒤집혀 있어요.` : d]);
  }

  const NUM_MEAN = { 1: '시작과 씨앗', 2: '선택과 균형', 3: '성장과 협력', 4: '안정과 기반', 5: '갈등과 변화', 6: '조화와 회복', 7: '시험과 성찰', 8: '힘과 진전', 9: '완성 직전의 결실', 10: '끝과 새 순환' };
  function patterns(reads) {
    const n = reads.length, out = [];
    if (n < 3) return out;
    const majors = reads.filter(r => r.c.arcana === 'major').length;
    const revs = reads.filter(r => r.rev).length;
    const suits = { wands: 0, cups: 0, swords: 0, pentacles: 0 };
    reads.forEach(r => { if (r.c.suit) suits[r.c.suit]++; });
    const courts = reads.filter(r => isCourt(r.c)).length;
    if (majors / n >= 0.5) out.push(`메이저 아르카나가 ${majors}장이나 나왔어요. 일상의 작은 일이 아니라 삶의 큰 흐름이 움직이는 시기예요.`);
    else if (majors === 0) out.push('메이저 아르카나가 한 장도 없어요. 운명이 정한 일이라기보다, 당신의 선택과 행동으로 충분히 바꿀 수 있는 일이에요.');
    const top = Object.entries(suits).sort((a, b) => b[1] - a[1])[0];
    if (top[1] >= 2 && top[1] / n >= 0.4) out.push({ wands: '완드(불)가 많아요 — 열정과 행동, 일의 추진력이 이 문제의 중심이에요.', cups: '컵(물)이 많아요 — 결국 감정과 마음, 관계의 문제가 핵심이에요.', swords: '소드(공기)가 많아요 — 생각과 걱정, 말과 갈등이 상황을 움직이고 있어요. 머리를 식히는 게 먼저예요.', pentacles: '펜타클(흙)이 많아요 — 돈·일·몸처럼 현실적인 조건이 열쇠예요.' }[top[0]]);
    if (revs / n >= 0.5) out.push(`역방향이 ${revs}장으로 많아요. 흐름이 막혀 있거나, 답이 바깥이 아닌 내 안에 있다는 신호예요.`);
    else if (revs === 0) out.push('역방향이 하나도 없어요. 흐름이 막힘없이 열려 있어요.');
    if (courts >= 2) out.push(`궁정 카드가 ${courts}장 — 여러 사람이 이 일에 얽혀 있어요. 누가 어떤 역할인지 살펴보세요.`);
    const nums = {};
    reads.forEach(r => { const v = r.c.arcana === 'major' ? (r.c.num % 10 || 10) : r.c.rank < 10 ? r.c.rank + 1 : null; if (v) nums[v] = (nums[v] || 0) + 1; });
    const rep = Object.entries(nums).filter(([, v]) => v >= 2).map(([k, v]) => `${k}(${NUM_MEAN[k]}) ${v}장`);
    if (rep.length) out.push(`같은 숫자가 겹쳐요: ${rep.join(', ')}. 이 숫자의 주제가 지금 당신에게 강조되고 있어요.`);
    return out;
  }

  // 카드 하나의 '긍정도' (-1 ~ 1)
  const tone = r => r.rev ? (r.c.yes > 0 ? -0.25 : r.c.yes < 0 ? 0.35 : -0.15) : r.c.yes;
  function verdict(reads) {
    let s = reads.reduce((a, r) => a + tone(r), 0) / reads.length;
    s = s * 0.6 + tone(reads[reads.length - 1]) * 0.4;
    const pct = Math.round(Math.max(3, Math.min(97, 50 + s * 45)));
    const yn = pct >= 66 ? ['YES', '긍정적이에요. 흐름이 당신 편이에요.'] : pct >= 45 ? ['MAYBE', '반반이에요. 당신의 선택과 노력이 결과를 정해요.'] : ['NOT YET', '지금은 쉽지 않아요. 방법이나 때를 바꿔 보세요.'];
    return { pct, yn };
  }

  // 시기 힌트 (마지막 카드 기준)
  function timing(r) {
    const c = r.c;
    if (c.arcana === 'major') {
      const sg = X.MAJOR_SIGN[c.num];
      if (sg) return `마지막 카드 ${c.name}의 별자리는 ${sg[0]} — ${sg[1]} 무렵이 흐름이 무르익는 때예요.`;
      return `마지막 카드 ${c.name}${pj(c.name, '은는')} 날짜보다 '계기'를 말하는 카드예요. 큰 흐름이 바뀌는 순간이 곧 그때예요.`;
    }
    if (isCourt(c)) return `마지막 카드가 궁정 카드예요. 어떤 사람이 등장하거나 움직일 때 일이 진행돼요.`;
    const n = c.rank + 1;
    const unit = { wands: [`${n}일~${n}주 안`, '불처럼 빠르게'], swords: [`${n}주 안팎`, '갑작스럽게'], cups: [`${n}주~${n}달 사이`, '마음이 무르익을 때'], pentacles: [`${n}달 이상`, '천천히, 하지만 확실하게'] }[c.suit];
    return `마지막 카드 ${c.name}의 시기 힌트: ${unit[1]}, 대략 ${unit[0]}${r.rev ? '(역방향이라 조금 늦어질 수 있어요)' : ''}.`;
  }

  // 상대 마음 온도 (연애 배열의 '상대의 마음' 카드)
  function heartTemp(r) {
    const c = r.c;
    let t = 50 + c.yes * 18 + ({ cups: 14, wands: 9, pentacles: 4, swords: -8 }[c.suit] || 0);
    if (['M6', 'M19', 'M3', 'M17', 'C1', 'C9', 'C0', 'C11'].includes(c.id)) t += 12;
    if (['M15'].includes(c.id)) t += 6;
    if (r.rev) t -= 22;
    t = Math.max(4, Math.min(98, Math.round(t)));
    const lab = t >= 80 ? '뜨거워요' : t >= 62 ? '따뜻해요' : t >= 42 ? '미지근해요' : t >= 24 ? '서늘해요' : '차가워요';
    return { t, lab };
  }

  // 양자택일 비교
  function choiceCompare(reads) {
    const sA = tone(reads[1]) + tone(reads[2]) * 1.4, sB = tone(reads[3]) + tone(reads[4]) * 1.4;
    if (Math.abs(sA - sB) < 0.35) return '두 길의 무게가 비슷해요. 어느 쪽이든 마음이 더 가벼운 쪽을 고르세요.';
    return sA > sB ? '카드는 A 쪽에 조금 더 밝은 빛을 비추고 있어요.' : '카드는 B 쪽에 조금 더 밝은 빛을 비추고 있어요.';
  }

  function synthesize(spreadKey, reads, answers) {
    const flow = elementFlow(reads);
    const flowText = [];
    if (reads.length >= 3) {
      const domEl = Object.entries(flow.counts).sort((a, b) => b[1] - a[1])[0];
      if (flow.enemy >= 2) flowText.push(`카드끼리 원소가 부딪히는 곳이 ${flow.enemy}군데예요(불↔물, 공기↔흙). 마음과 상황이 서로 엇갈리고 있으니, 한 번에 하나씩 풀어 가야 해요.`);
      else if (flow.friend + flow.same >= reads.length - 1 - flow.neutral && flow.friend + flow.same >= 2) flowText.push('이어지는 카드들의 원소가 서로를 돕고 있어요. 흐름이 매끄러워서 마음먹은 대로 굴러가기 쉬워요.');
      if (domEl[1] >= 3) flowText.push(`${domEl[0]}의 기운이 가장 많아요(${domEl[1]}장).`);
    }
    const out = {
      story: story(spreadKey, reads),
      combos: combosIn(reads),
      patterns: patterns(reads),
      flow: flowText,
      verdict: verdict(reads),
      timing: timing(reads[reads.length - 1]),
      last: reads[reads.length - 1],
    };
    if (spreadKey === 'love') out.heart = heartTemp(reads[1]);
    if (spreadKey === 'choice') out.choice = choiceCompare(reads);
    const yes = (answers || []).filter(a => a === 'yes').length;
    if (answers && answers.length >= 2) out.resonance = yes / answers.length >= 0.6 ? '카드와 당신의 이야기가 많이 닮았어요. 이번 리딩은 지금의 당신을 꽤 정확히 비추고 있어요.' : yes === 0 ? '카드가 짚은 것들이 아직은 낯설게 느껴지나 봐요. 그렇다면 이 리딩은 앞으로를 위한 귀띔으로 간직해요.' : null;
    return out;
  }

  // 복사용 글
  function plainText(q, spreadName, reads, syn) {
    const strip = s => String(s).replace(/\*\*/g, '');
    const lines = [`[살롱 드 루나 · ${spreadName}]`, q ? `질문: ${q}` : '', ''];
    reads.forEach((r, i) => lines.push(`${i + 1}. ${r.posName} — ${r.c.name}${r.rev ? '(역)' : ''}: ${strip(r.lines[0])}`));
    lines.push('', ...syn.story.map(strip), '', `흐름: ${syn.verdict.yn[0]} (${syn.verdict.pct}%) · ${syn.timing}`, '— 달빛골목');
    return lines.filter((l, i) => l !== '' || i > 2).join('\n');
  }

  window.TarotReading = { KINDS, readCard, positionLine, leadLine, lookLine, slot, synthesize, REPLY, pick, plainText, elementOf, heartTemp, BY };
})();
