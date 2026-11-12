/* 달빛골목 — 평생사주: 인생 4막·전성기와 고비·평생 재물·직업·결혼·자녀·부모형제·건강·대운 연대기
 * 년주=초년, 월주=청년, 일주=중년, 시주=말년으로 보는 궁위(宮位)론과 대운 흐름을 함께 엮는다. */
(function () {
  'use strict';
  const S = window.SajuCore, K = window.SajuData, D = window.Dalbit;
  const j = (w, p) => D.j(w, p), pj = (w, p) => D.j(w, p).slice(String(w).length);
  const EL_H = S.ELEMENTS_H;

  // 시기별로 그 자리의 십성이 뜻하는 것
  const STAGE_TG = {
    초년: { 비겁: '형제·친구와 부대끼며 일찍 자기 몫을 챙기는 법을 배운', 식상: '재주가 많고 호기심 가득한, 자유로운', 재성: '집안의 살림이 넉넉하거나 일찍 돈의 흐름을 보고 자란', 관성: '규율 있는 집안에서 일찍 철이 든', 인성: '어른의 보살핌과 배움의 복을 받은' },
    청년: { 비겁: '경쟁 속에서 홀로 서려 애쓰는', 식상: '재능을 펼치고 새 일을 벌이는', 재성: '돈을 벌고 살림을 일구는 데 힘쓰는', 관성: '조직에서 자리를 잡고 책임을 지는', 인성: '공부와 자격으로 기반을 닦는' },
    중년: { 비겁: '내 판을 꾸리고 독립하는', 식상: '쌓은 재주를 결실로 바꾸는', 재성: '재물을 굴리고 키우는', 관성: '명예와 자리가 무거워지는', 인성: '배운 것을 바탕으로 인정받는' },
    말년: { 비겁: '친구와 형제가 곁에 있는', 식상: '자녀 복과 먹을 복이 따르는', 재성: '모은 재물로 넉넉한', 관성: '이름과 체면을 지키는', 인성: '배움과 신앙 속에 평안한' },
  };
  const STAGE_PAL = { 초년: 'year', 청년: 'month', 중년: 'day', 말년: 'hour' };
  const STAGE_AGE = { 초년: [0, 19], 청년: [20, 39], 중년: [40, 59], 말년: [60, 89] };
  const STRONG_STAGE = ['장생', '관대', '건록', '제왕'], WEAK_STAGE = ['병', '사', '묘', '절'];
  const EL_SPOUSE = { 목: '곧고 성장하려는 기운이 강한', 화: '밝고 정이 많으며 열정적인', 토: '듬직하고 현실적인', 금: '깔끔하고 결단력 있는', 수: '지혜롭고 속이 깊으며 유연한' };
  const GROUP_PHASE = { 비겁: '독립과 경쟁', 식상: '재능과 표현', 재성: '재물과 실속', 관성: '자리와 책임', 인성: '배움과 도움' };
  const GROUP_DECADE = { 비겁: '독립과 경쟁의 10년', 식상: '재능을 펼치는 10년', 재성: '재물을 일구는 10년', 관성: '자리와 책임의 10년', 인성: '배움과 도움의 10년' };

  function build(a, fm, R) {
    const now = S.kstNow().y, by = a.solar.y, age = now - by;
    const dl = a.daeun ? a.daeun.list.slice(0, 9) : [];
    const scoreOf = d => R.pillarScore(a, fm, d);
    const avg = (from, to) => { const xs = dl.filter(d => d.age + 9 >= from && d.age <= to).map(scoreOf); return xs.length ? xs.reduce((x, y) => x + y, 0) / xs.length : 0; };
    const inRange = (from, to) => dl.filter(d => d.age + 9 >= from && d.age <= to);
    const ch = [];

    /* ── 총론 ── */
    const e = avg(0, 29), m = avg(30, 59), l = avg(60, 89);
    let shape;
    if (Math.max(e, m, l) - Math.min(e, m, l) < 0.35) shape = ['평탄형', '큰 굴곡 없이 고르게 흘러가는 인생일세. 한 번에 크게 얻기보다 꾸준히 쌓아 가는 것이 자네 팔자의 힘이야.'];
    else if (e < m && m <= l + 0.1) shape = ['대기만성형', '초년에 애쓴 만큼 갈수록 피어나는 인생일세. 늦게 핀 꽃이 오래가는 법이니 조급해하지 말게.'];
    else if (e > m && m >= l - 0.1) shape = ['조숙형', '일찍 꽃이 피는 인생일세. 젊을 때 거둔 것을 잘 갈무리해 말년을 미리 준비해 두면 평생이 넉넉하네.'];
    else if (m >= e && m >= l) shape = ['한창형', '중년에 정점을 찍는 인생일세. 사십·오십 대에 일과 재물이 가장 크게 움직이니, 그때를 위해 실력을 벼려 두게.'];
    else shape = ['고비 넘어 웃는 형', '중년에 한 번 큰 고비를 넘고 말년에 웃는 인생일세. 어려운 시기에 사람과 건강만 잃지 않으면 끝이 좋네.'];
    const ar = R.archetypeOf(a), ms = R.mulsang(a);
    // 전성기·고비는 성인기(만 15세 이후 시작하는 대운)에서 고른다
    const adult = dl.filter(d => d.age >= 15 && d.age <= 80);
    const best = adult.length ? adult.reduce((x, y) => (scoreOf(y) > scoreOf(x) ? y : x)) : null;
    const worst = adult.length ? adult.reduce((x, y) => (scoreOf(y) < scoreOf(x) ? y : x)) : null;
    ch.push({
      key: 'sum', title: '총론 — 평생을 한 줄로',
      say: [`자네의 평생을 한마디로 하면… **${shape[0]}**일세.`, shape[1]],
      html: `<div class="life-head"><div class="lh-type">${shape[0]}</div><p>${shape[1]}</p></div>
        <p>${K.DM[a.dm].title.split(' · ')[0]} 일간에 「${(window.SajuExtra.ILJU[a.dayPillar] || [''])[0]}」의 일주, 사주 유형은 <b>${ar.name}</b>일세. ${ms.scene}</p>
        ${R.lifeGraph(a, fm)}
        ${best ? `<div class="grid2"><div class="mini peak"><h4>🌕 인생의 전성기</h4><p>만 <b>${best.age}~${best.age + 9}세</b> (${best.fromYear}년~) · ${best.stem}${best.branch} 대운 — ${GROUP_DECADE[S.GROUP_OF[best.stemTG]]}. 이때 크게 일을 벌이고 사람을 모으게.</p></div>
          <div class="mini valley"><h4>🌑 조심할 고비</h4><p>만 <b>${worst.age}~${worst.age + 9}세</b> (${worst.fromYear}년~) · ${worst.stem}${worst.branch} 대운 — 무리한 확장보다 건강과 기반을 지키는 데 힘쓰면 무사히 넘기네.</p></div></div>` : ''}`,
    });

    /* ── 인생 4막 ── */
    const acts = [];
    for (const st of ['초년', '청년', '중년', '말년']) {
      const k = STAGE_PAL[st], p = a.pillars[k];
      const [from, to] = STAGE_AGE[st];
      const ds = inRange(from, to);
      const sc = ds.length ? ds.map(scoreOf).reduce((x, y) => x + y, 0) / ds.length : 0;
      const lab = R.flowLabel(sc);
      const lines = [];
      if (p) {
        const g1 = S.GROUP_OF[p.stemTG === '일간' ? p.branchTG : p.stemTG], g2 = S.GROUP_OF[p.branchTG];
        lines.push(`이 시기를 비추는 자리는 ${p.label} <b>${p.stem}${p.branch}(${p.stemH}${p.branchH})</b>일세. ${STAGE_TG[st][g1]} 시절이네.${g2 !== g1 ? ` 땅으로는 ${GROUP_PHASE[g2]}의 기운이 받쳐 주지.` : ''}`);
        const stg = K.STAGE[p.stage];
        lines.push(STRONG_STAGE.includes(p.stage) ? `일간의 기운이 이 자리에서 <b>${p.stage}</b>(${stg.e})이라, 기세가 왕성한 시절이야.` : WEAK_STAGE.includes(p.stage) ? `일간의 기운이 이 자리에서 <b>${p.stage}</b>(${stg.e})이라, 겉으로 드러나기보다 안으로 다지는 시절이야.` : `이 자리의 12운성은 <b>${p.stage}</b>(${stg.e}) — ${stg.d}`);
        const ss = a.sinsal.filter(x => x.where.includes(k)).map(x => x.name);
        if (ss.includes('역마살')) lines.push('역마가 있어 이 시기에 이사·유학·출장처럼 움직임이 많네.');
        if (ss.includes('도화살') || ss.includes('홍염살')) lines.push('도화의 매력이 이 시기에 꽃피어 사람이 따르네.');
        if (ss.includes('천을귀인')) lines.push('천을귀인이 이 자리에 있어 이 시기엔 꼭 돕는 사람이 나타나지.');
        if (ss.includes('화개살')) lines.push('화개가 있어 이 시기에 예술·학문·종교에 마음이 깊어지네.');
        if (p.gongmang) lines.push('공망이 들어 이 시기엔 애쓴 만큼 허전함이 남기 쉬우니, 마음 공부로 채우게.');
        const pal = { year: 'month', month: 'day', day: 'hour' }[k];
        if (pal && a.pillars[pal] && S.branchRelations(p.branch, a.pillars[pal].branch).some(r => r.type === '충')) lines.push(`${p.label}와 다음 자리 ${a.pillars[pal].label}가 부딪혀(충) 이 시기 끝 무렵에 환경이 크게 바뀌네.`);
      } else lines.push('태어난 시를 몰라 말년의 자리(시주)는 비워 두고, 대운의 흐름으로만 보았네.');
      if (ds.length) lines.push(`이 시기에 지나는 대운은 ${ds.map(d => `${d.stem}${d.branch}(만 ${d.age}세~)`).join(', ')}이고, 전체로는 <b>${lab[0]}</b>이야.`);
      const adv = { 초년: lab[1] === 'great' || lab[1] === 'good' ? '배울 수 있을 때 마음껏 배워 두면 평생 밑천이 되네.' : '어린 시절의 어려움이 오히려 자네를 단단하게 만들었을 걸세.', 청년: lab[1] === 'great' || lab[1] === 'good' ? '기회가 많은 시기라 망설이지 말고 도전하게.' : '서두르기보다 실력과 사람을 쌓는 시기로 삼게.', 중년: lab[1] === 'great' || lab[1] === 'good' ? '인생의 열매를 거두는 때일세. 크게 벌이되 동업·보증만 조심하게.' : '책임이 무거운 때라 건강과 가정을 먼저 챙기게.', 말년: lab[1] === 'great' || lab[1] === 'good' ? '넉넉하고 평안한 말년이니, 베풀수록 복이 더 들어오네.' : '젊을 때 미리 모아 두고, 사람과의 정을 쌓아 두면 말년이 따뜻하네.' }[st];
      acts.push({ st, from, to, lab, lines, adv, cur: age >= from && age <= to });
    }
    ch.push({
      key: 'acts', title: '인생 4막 — 초년·청년·중년·말년',
      say: acts.map(x => `${x.st}(${x.to === 89 ? x.from + '세~' : x.from + '~' + x.to + '세'})은 ${x.lab[0]}${x.cur ? ' — 지금 자네가 지나는 시기일세' : ''}.`),
      html: acts.map(x => `<div class="act${x.cur ? ' now' : ''}"><h4>${x.st} <small>만 ${x.to === 89 ? x.from + '세~' : x.from + '~' + x.to + '세'}</small> <span class="flow ${x.lab[1]}">${x.lab[0]}</span>${x.cur ? ' <em class="nowtag">지금</em>' : ''}</h4>${x.lines.map(l => `<p>${l}</p>`).join('')}<p class="advice-s">✦ ${x.adv}</p></div>`).join(''),
    });

    /* ── 평생 재물운 ── */
    const gp = a.groupPower, tc = a.tgCount, lv = a.strength.level;
    let vessel;
    if (gp.재성 < 0.6) vessel = ['명예·실력형 그릇', '재성이 약해 돈을 좇기보다 실력과 이름을 쌓으면 돈이 그림자처럼 따라오는 그릇일세.'];
    else if (lv <= 1 && gp.재성 > 2.2) vessel = ['재다신약의 그릇', '재물은 눈앞에 많은데 쥘 힘이 모자라는 그릇일세. 힘(실력·사람)을 기른 뒤에 쥐어야 새지 않네.'];
    else if (lv >= 2 && gp.재성 >= 1.2) vessel = ['큰 재물의 그릇', '일간이 튼튼하고 재성도 갖춰, 큰 재물을 담고 굴릴 수 있는 그릇일세.'];
    else vessel = ['꾸준히 모으는 그릇', '재물과 일간의 힘이 엇비슷해, 무리하지 않으면 차곡차곡 쌓이는 그릇일세.'];
    const style = tc.편재 > tc.정재 ? '편재가 강해 사업·투자·부업처럼 움직이는 돈과 인연이 깊네.' : tc.정재 > 0 ? '정재가 자리를 잡아 월급·적금·내 집처럼 꾸준한 돈이 맞네.' : '재성이 드러나지 않아 재능과 자격이 곧 돈줄일세.';
    const moneyDecades = dl.filter(d => [S.GROUP_OF[d.stemTG], S.GROUP_OF[d.branchTG]].includes('재성') || (lv >= 2 && S.GROUP_OF[d.stemTG] === '식상'));
    ch.push({
      key: 'money', title: '평생 재물운',
      say: [`자네의 재물 그릇은 **${vessel[0]}**일세.`, moneyDecades.length ? `재물이 크게 움직이는 시기는 만 ${moneyDecades.map(d => d.age + '세').join('·')}부터의 대운이야.` : '재성 대운이 크게 오지 않으니 실력으로 버는 길을 가게.'],
      html: `<p><b>${vessel[0]}</b> — ${vessel[1]}</p><p>${style}${gp.식상 > 1.6 && gp.재성 > 0.8 ? ' 식상이 재성을 생하니 재주가 곧 돈이 되는 식상생재의 복도 있네.' : ''}${gp.비겁 > 2.8 ? ' 다만 비겁이 많아 돈이 사람을 따라 나가기 쉬우니 동업·보증은 조심하게.' : ''}</p>
        <p>💰 재물이 크게 들어오는 대운: ${moneyDecades.length ? moneyDecades.map(d => `<b>만 ${d.age}~${d.age + 9}세</b>(${d.stem}${d.branch})`).join(', ') : '뚜렷한 재성 대운이 없어 꾸준함이 답일세'}</p>
        <p class="muted">재물을 부르는 색은 ${K.EL[a.yongsin.el].color}, 방향은 ${K.EL[a.yongsin.el].dir}일세.</p>`,
    });

    /* ── 평생 직업·명예운 ── */
    const biz = tc.편재 * 1.2 + tc.식신 * 0.8 + tc.상관 + tc.비견 * 0.7 + tc.겁재 * 0.9;
    const corp = tc.정관 * 1.3 + tc.편관 * 0.8 + tc.정재 * 0.9 + tc.정인 + tc.편인 * 0.6;
    const type = biz > corp + 1 ? ['사업·프리랜서형', '남 밑에서 지시받기보다 내 판을 꾸릴 때 힘이 나는 팔자일세.'] : corp > biz + 1 ? ['조직·전문직형', '체계 있는 조직이나 자격을 갖춘 전문직에서 차근차근 오를 때 빛나는 팔자일세.'] : ['양쪽 다 되는 형', '조직에서 실력을 쌓은 뒤 독립하면 두 길의 장점을 다 누리는 팔자일세.'];
    const honor = dl.filter(d => ['관성', '인성'].includes(S.GROUP_OF[d.stemTG]));
    ch.push({
      key: 'work', title: '평생 직업·명예운',
      say: [`일하는 방식으로 보면 **${type[0]}**이구먼.`, `격국은 ${a.yongsin.jong || a.gyeok.name}, 닮은 일은 ${ar.jobs}일세.`],
      html: `<p><b>${type[0]}</b> — ${type[1]}</p><p>격국은 <b>${a.yongsin.jong || a.gyeok.name}</b>. ${K.GYEOK[a.gyeok.name] || ''} 사주 유형 <b>${ar.name}</b>에 맞는 일은 <b>${ar.jobs}</b>일세.</p>
        <p>💼 자리·명예가 오르는 대운: ${honor.length ? honor.map(d => `<b>만 ${d.age}~${d.age + 9}세</b>(${d.stem}${d.branch})`).join(', ') : '관성·인성 대운이 드물어 스스로 자리를 만드는 길이 맞네'}</p>`,
    });

    /* ── 결혼·배우자운 ── */
    const dp = a.pillars.day;
    const spouseG = a.gender === 'male' ? '재성' : '관성';
    const spouseEl = S.elementOfGroup(a.dmEl, spouseG);
    const from = Math.max(by + 23, now), to = by + 42;
    const loveYears = to >= from ? R.yearEvents(a, fm, from, to).filter(x => x.love).map(x => x.y) : [];
    const pastLove = R.yearEvents(a, fm, by + 23, Math.min(to, now - 1)).filter(x => x.love).map(x => x.y);
    const dayClash = a.relations.some(r => (r.a === 'day' || r.b === 'day') && ['충', '형'].includes(r.type));
    const hasW = a.sinsal.some(x => x.name === '원진살' && x.where.includes('day'));
    ch.push({
      key: 'love', title: '결혼·배우자운',
      say: [`배우자 자리(일지)엔 **${dp.branchTG}**의 기운이 있고, 배우자 별은 **${spouseG}(${spouseEl})**일세.`, loveYears.length ? `앞으로 인연이 강하게 드는 해는 **${loveYears.slice(0, 4).join('·')}년**이야.` : '인연의 해는 이미 몇 번 지나왔으니, 지금 곁의 인연을 아끼게.'],
      html: `<p>${K.SPOUSE[dp.branchTG]}</p>
        <p>배우자의 모습: 일지 ${dp.branch}(${dp.branchEl})의 기운이라 <b>${EL_SPOUSE[dp.branchEl]}</b> 사람과 인연이 깊네. 배우자 별인 ${spouseG}은 오행으로 ${spouseEl}(${EL_H[spouseEl]})이니, ${spouseEl}의 기운이 강한 사람에게 끌리기 쉽지.</p>
        <p>${gp[spouseG] < 0.5 ? `배우자 별이 약해 인연을 기다리기보다 직접 찾아 나서야 하네. 늦게 만나는 인연이 더 단단하지.` : gp[spouseG] > 2.6 ? '배우자 별이 많아 인연이 풍성하니, 고르는 눈이 중요하네.' : '배우자 별이 알맞게 있어 인연이 자연스레 찾아오는 편이네.'}${dayClash ? ' 일지가 충·형을 맞아 결혼 생활에 변화가 많을 수 있으니, 서두르지 말고 충분히 겪어 본 뒤 결혼하게.' : ''}${hasW ? ' 원진이 있어 가까울수록 서운함이 쌓이기 쉬우니 그날그날 풀게.' : ''}</p>
        <p>💞 결혼 인연이 강한 해(만 23~42세): ${pastLove.length ? `지나온 해 ${pastLove.slice(-4).join('·')}년` : ''}${pastLove.length && loveYears.length ? ' / ' : ''}${loveYears.length ? `<b>다가올 해 ${loveYears.slice(0, 5).join('·')}년</b>` : (pastLove.length ? '' : '뚜렷한 해가 드러나지 않네')}</p>`,
    });

    /* ── 자녀운 ── */
    const childG = a.gender === 'male' ? '관성' : '식상';
    const hp = a.pillars.hour;
    let child = [`자녀를 뜻하는 별은 <b>${childG}</b>(${S.elementOfGroup(a.dmEl, childG)})일세. ${gp[childG] < 0.5 ? '자녀 별이 약해 자녀와의 인연이 늦거나 적을 수 있지만, 그만큼 한 아이에게 정성이 깊네.' : gp[childG] > 2.4 ? '자녀 별이 넉넉해 자녀 복이 있고, 자녀로 인해 바쁘기도 하네.' : '자녀 별이 알맞게 있어 자녀와의 인연이 무난하네.'}`];
    if (hp) {
      const rel = S.branchRelations(dp.branch, hp.branch).map(r => r.type);
      child.push(`자녀 자리(시주) ${hp.stem}${hp.branch}${pj(hp.branch, '은는')} ${hp.stemTG}·${hp.branchTG}의 기운이고 12운성은 ${hp.stage}일세. ${STRONG_STAGE.includes(hp.stage) ? '자녀가 기운이 좋아 자기 길을 씩씩하게 가네.' : WEAK_STAGE.includes(hp.stage) ? '자녀가 여리고 섬세해 따뜻한 보살핌이 필요하네.' : '자녀가 무난하게 자라네.'}`);
      if (rel.includes('육합') || rel.includes('삼합')) child.push('일지와 시지가 합을 이루어 자녀와 정이 깊고 말년에 자녀 덕을 보네.');
      if (rel.includes('충')) child.push('일지와 시지가 충이라 자녀와 의견이 부딪히거나 떨어져 지내기 쉬우니, 서로의 길을 존중하게.');
    } else child.push('태어난 시를 몰라 자녀 자리(시주)는 보지 못했네.');
    ch.push({ key: 'child', title: '자녀운', say: [`자녀 별은 **${childG}**일세.`], html: child.map(x => `<p>${x}</p>`).join('') });

    /* ── 부모·형제운 ── */
    const fam = [];
    const near = g => ['year', 'month'].some(k => a.pillars[k] && (S.GROUP_OF[a.pillars[k].stemTG] === g || S.GROUP_OF[a.pillars[k].branchTG] === g));
    fam.push(`아버지를 뜻하는 재성은 ${gp.재성 > 1.2 ? '넉넉하고' : '약하고'}, 어머니를 뜻하는 인성은 ${gp.인성 > 1.2 ? '넉넉하네' : '약하네'}. ${near('인성') ? '인성이 년·월에 가까이 있어 어머니(윗사람)의 보살핌을 받으며 자랐겠구먼.' : ''}${near('재성') ? ' 재성이 년·월에 있어 아버지의 영향이나 집안 살림의 덕이 있었겠네.' : ''}`);
    if (a.relations.some(r => ((r.a === 'year' && r.b === 'month') || (r.a === 'month' && r.b === 'year')) && r.type === '충')) fam.push('년주와 월주가 부딪혀 일찍 부모 곁을 떠나 자립하기 쉬운 팔자일세.');
    fam.push(gp.비겁 > 2.4 ? '비겁이 많아 형제·친구가 많고 의리가 있지만, 재물을 나누는 일도 많네.' : gp.비겁 < 0.6 ? '비겁이 적어 형제 덕보다 스스로 일어서는 팔자일세.' : '형제·친구와 적당한 거리에서 서로 돕는 사이일세.');
    ch.push({ key: 'family', title: '부모·형제운', say: [fam[0].split('. ')[0] + '.'], html: fam.map(x => `<p>${x}</p>`).join('') });

    /* ── 평생 건강운 ── */
    const pct = a.power.pct;
    const sorted = S.ELEMENTS.slice().sort((x, y) => pct[x] - pct[y]);
    const weakE = sorted[0], strongE = sorted[4];
    const careD = dl.filter(d => d.stemEl === a.yongsin.gisin && d.branchEl === a.yongsin.gisin || scoreOf(d) <= -0.9);
    ch.push({
      key: 'health', title: '평생 건강운',
      say: [`평생 아껴 써야 할 곳은 **${K.EL[weakE].organs}**일세.`],
      html: `<p>가장 약한 ${K.EL[weakE].name} 기운은 <b>${K.EL[weakE].organs}</b>, 가장 강한 ${K.EL[strongE].name} 기운은 <b>${K.EL[strongE].organs}</b>에 부담을 주기 쉽다고 봤네. ${K.EL[weakE].boost.split(', ').slice(0, 2).join(', ')} 같은 습관이 평생 보약일세.</p>
        <p>🩺 건강을 특히 챙길 시기: ${careD.length ? careD.map(d => `<b>만 ${d.age}~${d.age + 9}세</b>`).join(', ') : '크게 걸리는 대운은 없으니 꾸준한 관리면 충분하네'}</p>
        <p class="muted small">※ 전통 오행 의학의 상징적 연결일 뿐, 실제 건강은 반드시 의료 전문가와 상의하세요.</p>`,
    });

    /* ── 대운 연대기 ── */
    ch.push({
      key: 'chron', title: '대운 연대기 — 10년마다의 계절',
      say: ['자네 인생의 계절을 10년씩 짚어 보세.'],
      html: `<ol class="chron">${dl.map((d, i) => { const lab = R.flowLabel(scoreOf(d)); return `<li class="${a.daeun.current === i ? 'now' : ''}"><b>만 ${d.age}~${d.age + 9}세</b> <span class="muted small">${d.fromYear}년~</span> · ${d.stem}${d.branch}(${d.hanja}) <span class="flow ${lab[1]}">${lab[0]}</span><br>${S.GROUP_OF[d.stemTG] === S.GROUP_OF[d.branchTG] ? `10년 내내 ${GROUP_PHASE[S.GROUP_OF[d.stemTG]]}의 기운이 이끄네.` : `앞 5년은 ${GROUP_PHASE[S.GROUP_OF[d.stemTG]]}, 뒤 5년은 ${GROUP_PHASE[S.GROUP_OF[d.branchTG]]}의 기운이 이끄네.`}${a.daeun.current === i ? ' <em class="nowtag">지금</em>' : ''}</li>`; }).join('')}</ol>`,
    });

    /* ── 평생의 당부 ── */
    const ye = K.EL[a.yongsin.el];
    ch.push({
      key: 'last', title: '청운 선생의 평생 당부',
      say: [`${a.input.name ? a.input.name + ' ' : ''}자네 팔자의 열쇠는 **${a.yongsin.el}(${EL_H[a.yongsin.el]})**일세.`, K.DM[a.dm].advice, '평생사주는 정해진 운명이 아니라 계절표일세. 겨울에 씨를 뿌리지 않고 봄을 기다리듯, 때를 알고 움직이면 그걸로 충분하네. 허허.'],
      html: `<p>자네 팔자의 열쇠는 <b>${a.yongsin.el}(${EL_H[a.yongsin.el]})</b>의 기운일세. ${ye.color} 빛을 곁에 두고, ${ye.dir}을 반기며, ${ye.boost.split(', ')[0]} 같은 습관으로 평생 그 기운을 북돋게.</p>
        <p>${shape[1]}</p><p class="advice">“${K.DM[a.dm].advice}”</p>
        <p>평생사주는 정해진 운명이 아니라 계절표일세. 때를 알고 움직이면 그걸로 충분하네.</p>`,
    });

    // 복사용
    const plain = [`[청운 철학관 · 평생사주] ${a.input.name || ''} ${a.solar.y}.${a.solar.m}.${a.solar.d} ${a.dayPillar}일주`, `인생의 모양: ${shape[0]} — ${shape[1]}`, best ? `전성기: 만 ${best.age}~${best.age + 9}세 (${best.stem}${best.branch} 대운) / 고비: 만 ${worst.age}~${worst.age + 9}세` : '', ...acts.map(x => `${x.st}(만 ${x.to === 89 ? x.from + '세~' : x.from + '~' + x.to + '세'}): ${x.lab[0]} — ${x.adv}`), `재물 그릇: ${vessel[0]} / 일하는 방식: ${type[0]} / 배우자 별: ${spouseG}(${spouseEl})`, loveYears.length ? `인연의 해: ${loveYears.slice(0, 5).join('·')}년` : '', `열쇠가 되는 기운: ${a.yongsin.el}(${ye.color})`, '— 달빛골목'].filter(Boolean).join('\n');
    return { chapters: ch, shape, plain };
  }

  window.SajuLife = { build };
})();
