/* 달빛골목 — 대표 캐릭터 세 명 (SVG)
 * 표정: data-e="표정 목록", 말하는 입: data-talk="open|closed".
 * Characters.mount(이름, 요소) → { set(표정), talk(true/false), el } */
(function () {
  'use strict';

  /* ───────── 청운 선생 : 갓 쓴 노 역술가 ───────── */
  const cheongun = () => `
<svg viewBox="0 0 360 440" class="char char-cheongun" role="img" aria-label="청운 선생">
<defs>
  <linearGradient id="cg-robe" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6c7590"/><stop offset="1" stop-color="#3d4459"/></linearGradient>
  <radialGradient id="cg-skin" cx=".5" cy=".38" r=".65"><stop offset="0" stop-color="#f7dfc6"/><stop offset="1" stop-color="#e2b892"/></radialGradient>
  <linearGradient id="cg-beard" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#d9dbe0"/></linearGradient>
</defs>
<g class="breathe">
  <!-- 도포 -->
  <path d="M16 440 C18 350 58 290 136 272 L224 272 C302 290 342 350 344 440 Z" fill="url(#cg-robe)"/>
  <rect x="16" y="438" width="328" height="240" fill="#3d4459"/>
  <path d="M52 440 C60 382 84 338 114 316" stroke="#2f3546" stroke-width="3" fill="none" opacity=".5"/>
  <path d="M308 440 C300 382 276 338 246 316" stroke="#2f3546" stroke-width="3" fill="none" opacity=".5"/>
  <!-- 속옷과 깃·동정 -->
  <path d="M152 266 L180 322 L208 266 Z" fill="#efe9dc"/>
  <path d="M208 264 L226 268 L160 382 L140 376 Z" fill="#3a4156"/>
  <path d="M208 264 L216 266 L150 380 L140 376 Z" fill="#f7f4ec"/>
  <path d="M152 264 L134 268 L176 342 L188 326 Z" fill="#454c63"/>
  <path d="M152 264 L144 266 L182 334 L188 326 Z" fill="#f7f4ec"/>
  <!-- 세조대 -->
  <path d="M112 400 Q180 384 248 400" stroke="#8b2f2a" stroke-width="6" fill="none"/>
  <!-- 목 -->
  <path d="M163 238 L197 238 L200 274 Q180 284 160 274 Z" fill="#e0b48d"/>
  <!-- 귀 -->
  <ellipse cx="119" cy="176" rx="11" ry="19" fill="#e9c19c"/>
  <ellipse cx="241" cy="176" rx="11" ry="19" fill="#e9c19c"/>
  <!-- 얼굴 -->
  <path d="M122 140 C122 104 146 92 180 92 C214 92 238 104 238 140 C238 196 222 240 180 250 C138 240 122 196 122 140 Z" fill="url(#cg-skin)"/>
  <!-- 옆머리 (흰머리) -->
  <path d="M122 120 C112 140 114 168 122 186 C126 160 128 138 136 122 Z" fill="#eceef2"/>
  <path d="M238 120 C248 140 246 168 238 186 C234 160 232 138 224 122 Z" fill="#eceef2"/>
  <!-- 망건 -->
  <path d="M124 112 Q180 98 236 112 L236 124 Q180 110 124 124 Z" fill="#1d1d24"/>
  <circle cx="128" cy="124" r="5" fill="#9fc7b0" stroke="#5d7d6a" stroke-width="1.5"/>
  <circle cx="232" cy="124" r="5" fill="#9fc7b0" stroke="#5d7d6a" stroke-width="1.5"/>
  <!-- 주름 -->
  <path d="M150 132 Q180 126 210 132" stroke="#c99a76" stroke-width="1.6" fill="none" opacity=".7"/>
  <path d="M132 172 l-7 -3 M132 178 l-8 1" stroke="#c99a76" stroke-width="1.5" opacity=".8"/>
  <path d="M228 172 l7 -3 M228 178 l8 1" stroke="#c99a76" stroke-width="1.5" opacity=".8"/>
  <!-- 볼 -->
  <ellipse cx="146" cy="196" rx="13" ry="7" fill="#e79a83" opacity=".35"/>
  <ellipse cx="214" cy="196" rx="13" ry="7" fill="#e79a83" opacity=".35"/>
  <!-- 눈 -->
  <g class="blink" data-e="normal serious">
    <ellipse cx="157" cy="168" rx="4.2" ry="5" fill="#2b221e"/><circle cx="158.5" cy="166" r="1.3" fill="#fff"/>
    <ellipse cx="203" cy="168" rx="4.2" ry="5" fill="#2b221e"/><circle cx="204.5" cy="166" r="1.3" fill="#fff"/>
  </g>
  <g data-e="normal"><path d="M148 162 Q157 157 166 162 M194 162 Q203 157 212 162" stroke="#7a5a48" stroke-width="1.8" fill="none"/></g>
  <g data-e="serious"><path d="M148 160 L166 162 M194 162 L212 160" stroke="#7a5a48" stroke-width="2" fill="none"/></g>
  <g data-e="smile"><path d="M149 170 Q157 160 165 170 M195 170 Q203 160 211 170" stroke="#2b221e" stroke-width="3" fill="none" stroke-linecap="round"/></g>
  <g data-e="think"><path d="M149 168 Q157 172 165 168 M195 168 Q203 172 211 168" stroke="#2b221e" stroke-width="2.6" fill="none" stroke-linecap="round"/></g>
  <g data-e="surprise">
    <circle cx="157" cy="167" r="6.5" fill="#fff" stroke="#2b221e" stroke-width="1.5"/><circle cx="157" cy="167" r="3.4" fill="#2b221e"/>
    <circle cx="203" cy="167" r="6.5" fill="#fff" stroke="#2b221e" stroke-width="1.5"/><circle cx="203" cy="167" r="3.4" fill="#2b221e"/>
  </g>
  <!-- 눈썹 (길게 늘어진 흰 눈썹) -->
  <g class="brows" data-e="normal smile think serious">
    <path d="M168 150 C158 142 142 142 132 152 C128 158 126 164 124 168 C134 156 150 150 168 154 Z" fill="#f4f5f7" stroke="#c9ccd3" stroke-width=".8"/>
    <path d="M192 150 C202 142 218 142 228 152 C232 158 234 164 236 168 C226 156 210 150 192 154 Z" fill="#f4f5f7" stroke="#c9ccd3" stroke-width=".8"/>
  </g>
  <g class="brows" data-e="surprise" transform="translate(0,-7)">
    <path d="M168 150 C158 140 142 140 132 150 C128 156 126 162 124 166 C134 154 150 148 168 154 Z" fill="#f4f5f7" stroke="#c9ccd3" stroke-width=".8"/>
    <path d="M192 150 C202 140 218 140 228 150 C232 156 234 162 236 166 C226 154 210 148 192 154 Z" fill="#f4f5f7" stroke="#c9ccd3" stroke-width=".8"/>
  </g>
  <!-- 안경 -->
  <g fill="rgba(255,255,255,.07)" stroke="#a9843c" stroke-width="2.2">
    <circle cx="157" cy="168" r="19"/><circle cx="203" cy="168" r="19"/>
  </g>
  <path d="M176 166 Q180 162 184 166" stroke="#a9843c" stroke-width="2.2" fill="none"/>
  <path d="M138 164 L122 160 M222 164 L238 160" stroke="#a9843c" stroke-width="2"/>
  <!-- 코 -->
  <path d="M181 172 C182 182 186 190 184 196 C180 199 174 198 172 195" stroke="#b9876a" stroke-width="2" fill="none" stroke-linecap="round"/>
  <!-- 수염 -->
  <path d="M150 214 C140 252 156 302 182 342 C204 302 222 252 210 214 C198 230 162 230 150 214 Z" fill="url(#cg-beard)"/>
  <path d="M172 240 C170 270 176 300 182 330 M190 240 C192 270 188 300 183 330 M160 236 C160 262 168 286 176 310" stroke="#c3c7cf" stroke-width="1.2" fill="none"/>
  <!-- 입 -->
  <g data-e="normal serious think" data-talk="closed"><path d="M172 214 Q180 219 188 214" stroke="#7d4a3b" stroke-width="2.4" fill="none" stroke-linecap="round"/></g>
  <g data-e="normal serious think surprise smile" data-talk="open"><ellipse cx="180" cy="216" rx="7.5" ry="5.5" fill="#6b3428"/></g>
  <g data-e="smile" data-talk="closed"><path d="M170 212 Q180 224 190 212 Z" fill="#6b3428"/></g>
  <g data-e="surprise" data-talk="closed"><ellipse cx="180" cy="216" rx="5" ry="6" fill="#6b3428"/></g>
  <!-- 콧수염 -->
  <path d="M180 202 C168 198 150 204 136 226 C152 214 168 212 180 212 Z" fill="#f7f8fa" stroke="#cdd0d6" stroke-width=".8"/>
  <path d="M180 202 C192 198 210 204 224 226 C208 214 192 212 180 212 Z" fill="#f7f8fa" stroke="#cdd0d6" stroke-width=".8"/>
  <!-- 갓 -->
  <path d="M146 38 Q180 30 214 38 L222 108 L138 108 Z" fill="#141418" opacity=".9"/>
  <path d="M146 38 Q180 30 214 38" stroke="#34343c" stroke-width="2" fill="none"/>
  <path d="M140 96 L220 96" stroke="#2a2a32" stroke-width="5"/>
  <ellipse cx="180" cy="108" rx="152" ry="22" fill="#0e0e12" opacity=".58"/>
  <ellipse cx="180" cy="108" rx="152" ry="22" fill="none" stroke="#2c2c35" stroke-width="2"/>
  <!-- 갓끈 (구슬) -->
  <g fill="#c98d3a" stroke="#8a5a1d" stroke-width=".8">
    ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => { const t = i / 10; const x = 118 + 30 * t + 10 * Math.sin(t * 3); const y = 124 + 165 * t; return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.6"/>`; }).join('')}
    ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => { const t = i / 10; const x = 242 - 30 * t - 10 * Math.sin(t * 3); const y = 124 + 165 * t; return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.6"/>`; }).join('')}
  </g>
</g>
</svg>`;

  /* ───────── 루나 : 베일 쓴 타로 마스터 ───────── */
  const luna = () => `
<svg viewBox="0 0 360 440" class="char char-luna" role="img" aria-label="루나">
<defs>
  <linearGradient id="ln-hair" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a2858"/><stop offset="1" stop-color="#1c1330"/></linearGradient>
  <radialGradient id="ln-skin" cx=".5" cy=".38" r=".7"><stop offset="0" stop-color="#fbe6d8"/><stop offset="1" stop-color="#ebc4b0"/></radialGradient>
  <linearGradient id="ln-dress" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2e2766"/><stop offset="1" stop-color="#15123a"/></linearGradient>
  <radialGradient id="ln-iris" cx=".5" cy=".4" r=".6"><stop offset="0" stop-color="#e3c8ff"/><stop offset=".6" stop-color="#8a5fd0"/><stop offset="1" stop-color="#3d2477"/></radialGradient>
  <linearGradient id="ln-veil" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9d7bd8" stop-opacity=".55"/><stop offset="1" stop-color="#5b3f9a" stop-opacity=".35"/></linearGradient>
</defs>
<g class="breathe">
  <!-- 베일 뒤 -->
  <path d="M180 46 C96 46 58 120 52 220 C46 320 40 400 30 440 L330 440 C320 400 314 320 308 220 C302 120 264 46 180 46 Z" fill="url(#ln-veil)"/>
  <path d="M30 439 L22 680 L338 680 L330 439 Z" fill="#5b3f9a" opacity=".35"/>
  <!-- 뒷머리 -->
  <path d="M180 66 C112 66 92 130 94 200 C96 262 80 300 70 340 C90 330 100 360 92 400 C120 380 132 392 138 420 L222 420 C228 392 240 380 268 400 C260 360 270 330 290 340 C280 300 264 262 266 200 C268 130 248 66 180 66 Z" fill="url(#ln-hair)"/>
  <!-- 어깨·몸 -->
  <path d="M54 440 C56 360 92 306 150 292 L210 292 C268 306 304 360 306 440 Z" fill="url(#ln-skin)"/>
  <path d="M50 440 C54 380 68 350 94 336 C116 346 130 356 140 372 C160 360 200 360 220 372 C230 356 244 346 266 336 C292 350 306 380 310 440 Z" fill="url(#ln-dress)"/>
  <rect x="50" y="438" width="260" height="240" fill="#15123a"/>
  <path d="M94 336 C116 346 130 356 140 372 C160 360 200 360 220 372 C230 356 244 346 266 336" stroke="#d8b45a" stroke-width="2.5" fill="none"/>
  <g fill="#f3d98b" opacity=".85"><circle cx="120" cy="418" r="2"/><circle cx="240" cy="414" r="2"/><circle cx="180" cy="428" r="2.4"/><circle cx="92" cy="426" r="1.5"/><circle cx="268" cy="430" r="1.5"/></g>
  <!-- 목·목걸이 -->
  <path d="M162 246 L198 246 L202 298 Q180 308 158 298 Z" fill="#eec9b5"/>
  <path d="M148 300 Q180 334 212 300" stroke="#d8b45a" stroke-width="2" fill="none"/>
  <path d="M180 324 m-8 0 a9 9 0 1 0 14 -6 a7 7 0 1 1 -14 6" fill="#f3d98b"/>
  <!-- 얼굴 -->
  <path d="M126 160 C126 112 150 92 180 92 C210 92 234 112 234 160 C234 210 214 246 180 258 C146 246 126 210 126 160 Z" fill="url(#ln-skin)"/>
  <!-- 귀걸이 -->
  <path d="M126 204 m0 0 a10 10 0 1 0 8 14 a8 8 0 1 1 -8 -14" fill="#f3d98b"/>
  <path d="M234 204 m0 0 a10 10 0 1 1 -8 14 a8 8 0 1 0 8 -14" fill="#f3d98b"/>
  <!-- 볼 -->
  <ellipse cx="150" cy="208" rx="12" ry="6" fill="#f09ab0" opacity=".35"/>
  <ellipse cx="210" cy="208" rx="12" ry="6" fill="#f09ab0" opacity=".35"/>
  <!-- 눈: 뜬 눈 -->
  <g class="blink" data-e="normal serious">
    <path d="M137 182 Q156 162 175 181 Q156 198 137 182 Z" fill="#fff"/>
    <circle cx="156" cy="181" r="10.5" fill="url(#ln-iris)"/><circle cx="156" cy="181" r="4.4" fill="#1d1236"/><circle cx="160" cy="177" r="3" fill="#fff"/><circle cx="152" cy="185" r="1.4" fill="#fff"/>
    <path d="M185 181 Q204 162 223 182 Q204 198 185 181 Z" fill="#fff"/>
    <circle cx="204" cy="181" r="10.5" fill="url(#ln-iris)"/><circle cx="204" cy="181" r="4.4" fill="#1d1236"/><circle cx="208" cy="177" r="3" fill="#fff"/><circle cx="200" cy="185" r="1.4" fill="#fff"/>
    <path d="M135 184 Q155 160 176 180 M137 182 L132 177 M225 184 Q205 160 184 180 M223 182 L228 177" stroke="#1d1236" stroke-width="3.4" fill="none" stroke-linecap="round"/>
  </g>
  <!-- 반쯤 감은 신비로운 눈 -->
  <g data-e="mystic">
    <path d="M137 184 Q156 177 175 184 Q156 196 137 184 Z" fill="#fff"/>
    <circle cx="156" cy="188" r="8" fill="url(#ln-iris)"/><circle cx="158" cy="185.5" r="2" fill="#fff"/>
    <path d="M185 184 Q204 177 223 184 Q204 196 185 184 Z" fill="#fff"/>
    <circle cx="204" cy="188" r="8" fill="url(#ln-iris)"/><circle cx="206" cy="185.5" r="2" fill="#fff"/>
    <path d="M135 185 Q155 175 177 183 M137 184 L132 180 M225 185 Q205 175 183 183 M223 184 L228 180" stroke="#1d1236" stroke-width="3.6" fill="none" stroke-linecap="round"/>
  </g>
  <g data-e="smile"><path d="M140 186 Q156 172 172 186 M188 186 Q204 172 220 186 M140 186 L135 182 M220 186 L225 182" stroke="#1d1236" stroke-width="3.4" fill="none" stroke-linecap="round"/></g>
  <g data-e="surprise">
    <ellipse cx="157" cy="180" rx="14" ry="11" fill="#fff"/><circle cx="157" cy="180" r="8" fill="url(#ln-iris)"/><circle cx="157" cy="180" r="3" fill="#1d1236"/><circle cx="160" cy="177" r="2.2" fill="#fff"/>
    <ellipse cx="203" cy="180" rx="14" ry="11" fill="#fff"/><circle cx="203" cy="180" r="8" fill="url(#ln-iris)"/><circle cx="203" cy="180" r="3" fill="#1d1236"/><circle cx="206" cy="177" r="2.2" fill="#fff"/>
    <path d="M141 172 Q157 164 172 172 M188 172 Q203 164 219 172" stroke="#1d1236" stroke-width="2.6" fill="none"/>
  </g>
  <!-- 눈썹 -->
  <g data-e="normal mystic smile"><path d="M142 160 Q156 153 170 158 M190 158 Q204 153 218 160" stroke="#3a2858" stroke-width="2.6" fill="none" stroke-linecap="round"/></g>
  <g data-e="serious"><path d="M142 158 Q156 157 170 162 M190 162 Q204 157 218 158" stroke="#3a2858" stroke-width="2.8" fill="none" stroke-linecap="round"/></g>
  <g data-e="surprise"><path d="M142 152 Q156 144 170 150 M190 150 Q204 144 218 152" stroke="#3a2858" stroke-width="2.6" fill="none" stroke-linecap="round"/></g>
  <!-- 코 -->
  <path d="M182 196 Q185 206 179 210" stroke="#d29a86" stroke-width="1.8" fill="none" stroke-linecap="round"/>
  <!-- 입 -->
  <g data-e="normal mystic smile" data-talk="closed"><path d="M166 224 Q180 234 194 224 Q180 230 166 224 Z" fill="#b4507a"/><path d="M166 224 Q180 234 194 224" stroke="#8d3560" stroke-width="1.6" fill="none"/></g>
  <g data-e="serious" data-talk="closed"><path d="M168 226 Q180 228 192 226" stroke="#8d3560" stroke-width="2.6" fill="none" stroke-linecap="round"/></g>
  <g data-e="normal mystic smile serious surprise" data-talk="open"><path d="M168 223 Q180 220 192 223 Q188 236 180 236 Q172 236 168 223 Z" fill="#7a2a4f"/><path d="M171 231 Q180 236 189 231" stroke="#e7889f" stroke-width="2" fill="none"/></g>
  <g data-e="surprise" data-talk="closed"><ellipse cx="180" cy="228" rx="5" ry="6" fill="#7a2a4f"/></g>
  <!-- 앞머리 -->
  <path d="M123 178 C114 118 144 82 180 82 C216 82 246 118 237 178 C230 142 216 118 198 108 C194 122 188 130 180 136 C172 130 166 122 162 108 C144 118 130 142 123 178 Z" fill="url(#ln-hair)"/>
  <path d="M126 160 C114 210 118 260 106 320 C124 296 132 260 134 220 Z" fill="url(#ln-hair)"/>
  <path d="M234 160 C246 210 242 260 254 320 C236 296 228 260 226 220 Z" fill="url(#ln-hair)"/>
  <path d="M150 104 C140 116 134 130 130 146 M210 104 C220 116 226 130 230 146" stroke="#5a4580" stroke-width="2" fill="none" opacity=".7"/>
  <!-- 베일 앞·이마 장식 -->
  <path d="M100 120 C120 72 150 56 180 56 C210 56 240 72 260 120 C230 96 206 90 180 90 C154 90 130 96 100 120 Z" fill="url(#ln-veil)"/>
  <path d="M104 116 C134 94 160 88 180 88 C200 88 226 94 256 116" stroke="#d8b45a" stroke-width="2.4" fill="none"/>
  <g fill="#f3d98b">${Array.from({ length: 11 }, (_, i) => { const t = i / 10; const x = 108 + 144 * t; const y = 116 - 26 * Math.sin(Math.PI * t) + 6; return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.6"/>`; }).join('')}</g>
  <path d="M180 96 m-9 4 a11 11 0 1 0 18 0 a8 8 0 1 1 -18 0" fill="#f3d98b"/>
  <path d="M180 112 l4 7 -4 7 -4 -7 z" fill="#b48cf0" stroke="#f3d98b" stroke-width="1"/>
</g>
</svg>`;

  /* ───────── 구슬이 : 구미호 아가씨 ───────── */
  const tail = (i, n) => {
    const ang = -62 + i * (124 / (n - 1));
    return `<g transform="rotate(${ang.toFixed(1)} 180 420)"><g class="tail" style="--d:${(i * 0.37).toFixed(2)}s">
      <path d="M180 420 C140 370 128 260 146 170 C156 120 174 92 180 78 C186 92 204 120 214 170 C232 260 220 370 180 420 Z" fill="url(#gs-tail)"/>
      <path d="M180 78 C174 92 162 112 156 138 C170 130 190 130 204 138 C198 112 186 92 180 78 Z" fill="#fff7ea"/>
    </g></g>`;
  };
  const guseul = () => `
<svg viewBox="0 0 360 440" class="char char-guseul" role="img" aria-label="구슬이">
<defs>
  <linearGradient id="gs-tail" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#d9622b"/><stop offset=".7" stop-color="#f19a4c"/><stop offset="1" stop-color="#ffd9a8"/></linearGradient>
  <linearGradient id="gs-hair" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f08a3e"/><stop offset="1" stop-color="#d4602a"/></linearGradient>
  <radialGradient id="gs-skin" cx=".5" cy=".4" r=".7"><stop offset="0" stop-color="#fff0e4"/><stop offset="1" stop-color="#f5d2bd"/></radialGradient>
  <radialGradient id="gs-iris" cx=".5" cy=".35" r=".7"><stop offset="0" stop-color="#ffe08a"/><stop offset=".55" stop-color="#e69a22"/><stop offset="1" stop-color="#8a4a10"/></radialGradient>
</defs>
<g class="tails">${Array.from({ length: 9 }, (_, i) => tail(i, 9)).join('')}</g>
<g class="breathe">
  <!-- 뒷머리 -->
  <path d="M180 76 C116 76 100 130 102 190 C104 240 112 268 120 290 L240 290 C248 268 256 240 258 190 C260 130 244 76 180 76 Z" fill="url(#gs-hair)"/>
  <!-- 여우 귀 -->
  <g class="ear ear-l"><path d="M118 118 C104 84 106 50 114 30 C136 44 156 68 162 92 Z" fill="url(#gs-hair)"/><path d="M124 104 C116 82 116 62 120 48 C134 60 146 76 150 92 Z" fill="#fff1e2"/><path d="M114 30 C118 40 122 46 128 50 C122 42 118 36 114 30 Z" fill="#5b2c16"/></g>
  <g class="ear ear-r"><path d="M242 118 C256 84 254 50 246 30 C224 44 204 68 198 92 Z" fill="url(#gs-hair)"/><path d="M236 104 C244 82 244 62 240 48 C226 60 214 76 210 92 Z" fill="#fff1e2"/><path d="M246 30 C242 40 238 46 232 50 C238 42 242 36 246 30 Z" fill="#5b2c16"/></g>
  <!-- 치마 -->
  <path d="M70 440 C76 400 100 372 140 360 L220 360 C260 372 284 400 290 440 Z" fill="#d94f7a"/>
  <rect x="70" y="438" width="220" height="240" fill="#d94f7a"/>
  <rect x="66" y="438" width="46" height="240" fill="#fde9b0"/><rect x="248" y="438" width="46" height="240" fill="#fde9b0"/>
  <!-- 저고리 -->
  <path d="M74 440 C70 380 96 330 150 312 L210 312 C264 330 290 380 286 440 L250 440 C250 410 244 392 236 384 L124 384 C116 392 110 410 110 440 Z" fill="#fde9b0"/>
  <path d="M124 384 L236 384 L230 398 L130 398 Z" fill="#f6d98c"/>
  <!-- 색동 소매 -->
  <g>${['#e64b4b', '#f7c548', '#5bb974', '#4a8fe0', '#f28cb8', '#e64b4b'].map((c, i) => `<path d="M${76 - i * 1.5} ${392 + i * 8} L${110 - i * 0.5} ${392 + i * 8} L${110 - i * 0.5} ${400 + i * 8} L${74 - i * 1.5} ${400 + i * 8} Z" fill="${c}"/><path d="M${284 + i * 1.5} ${392 + i * 8} L${250 + i * 0.5} ${392 + i * 8} L${250 + i * 0.5} ${400 + i * 8} L${286 + i * 1.5} ${400 + i * 8} Z" fill="${c}"/>`).join('')}</g>
  <!-- 깃·동정 -->
  <path d="M150 310 L180 352 L210 310 Z" fill="#fff8ef"/>
  <path d="M206 308 L222 312 L166 384 L148 380 Z" fill="#d6453d"/>
  <path d="M206 308 L213 310 L156 382 L148 380 Z" fill="#fff"/>
  <path d="M154 308 L138 312 L172 360 L182 348 Z" fill="#c93a33"/>
  <!-- 고름 -->
  <path d="M170 372 C150 368 140 376 146 386 C156 384 164 378 170 372 Z" fill="#d6453d"/>
  <path d="M170 372 C176 400 172 424 166 440 L178 440 C182 420 182 396 174 372 Z" fill="#d6453d"/>
  <path d="M172 372 C168 400 158 424 148 440 L158 440 C168 420 176 396 176 372 Z" fill="#b8322a"/>
  <!-- 목 -->
  <path d="M164 256 L196 256 L200 314 Q180 324 160 314 Z" fill="#f2cdb6"/>
  <!-- 얼굴 -->
  <path d="M118 182 C118 132 144 106 180 106 C216 106 242 132 242 182 C242 230 216 262 180 266 C144 262 118 230 118 182 Z" fill="url(#gs-skin)"/>
  <!-- 볼·수염 자국 -->
  <ellipse cx="144" cy="222" rx="15" ry="8" fill="#ff8f8f" opacity=".42"/>
  <ellipse cx="216" cy="222" rx="15" ry="8" fill="#ff8f8f" opacity=".42"/>
  <path d="M128 216 l-10 -2 M128 222 l-11 1 M232 216 l10 -2 M232 222 l11 1" stroke="#d98a6a" stroke-width="1.4" stroke-linecap="round" opacity=".7"/>
  <!-- 눈 -->
  <g class="blink" data-e="normal grin">
    <ellipse cx="153" cy="194" rx="13" ry="15.5" fill="#fff"/><ellipse cx="153" cy="196" rx="10.5" ry="12.5" fill="url(#gs-iris)"/><ellipse cx="153" cy="197" rx="4.5" ry="6" fill="#3b1a06"/><circle cx="157" cy="190" r="3.6" fill="#fff"/><circle cx="149" cy="202" r="1.6" fill="#fff"/>
    <ellipse cx="207" cy="194" rx="13" ry="15.5" fill="#fff"/><ellipse cx="207" cy="196" rx="10.5" ry="12.5" fill="url(#gs-iris)"/><ellipse cx="207" cy="197" rx="4.5" ry="6" fill="#3b1a06"/><circle cx="211" cy="190" r="3.6" fill="#fff"/><circle cx="203" cy="202" r="1.6" fill="#fff"/>
    <path d="M138 186 Q153 172 168 184 M192 184 Q207 172 222 186" stroke="#5b2c16" stroke-width="3.4" fill="none" stroke-linecap="round"/>
  </g>
  <g data-e="wink">
    <ellipse cx="153" cy="194" rx="13" ry="15.5" fill="#fff"/><ellipse cx="153" cy="196" rx="10.5" ry="12.5" fill="url(#gs-iris)"/><ellipse cx="153" cy="197" rx="4.5" ry="6" fill="#3b1a06"/><circle cx="157" cy="190" r="3.6" fill="#fff"/>
    <path d="M138 186 Q153 172 168 184" stroke="#5b2c16" stroke-width="3.4" fill="none" stroke-linecap="round"/>
    <path d="M194 196 Q207 186 220 196" stroke="#5b2c16" stroke-width="3.6" fill="none" stroke-linecap="round"/>
  </g>
  <g data-e="happy"><path d="M140 198 Q153 184 166 198 M194 198 Q207 184 220 198" stroke="#5b2c16" stroke-width="3.8" fill="none" stroke-linecap="round"/></g>
  <g data-e="smug">
    <path d="M140 194 Q153 190 166 194 Q153 206 140 194 Z" fill="#fff"/><ellipse cx="153" cy="198" rx="7" ry="5" fill="url(#gs-iris)"/>
    <path d="M194 194 Q207 190 220 194 Q207 206 194 194 Z" fill="#fff"/><ellipse cx="207" cy="198" rx="7" ry="5" fill="url(#gs-iris)"/>
    <path d="M138 193 L168 193 M192 193 L222 193" stroke="#5b2c16" stroke-width="3.4" stroke-linecap="round"/>
  </g>
  <g data-e="surprise">
    <ellipse cx="153" cy="193" rx="14" ry="17" fill="#fff"/><circle cx="153" cy="194" r="6.5" fill="url(#gs-iris)"/><circle cx="153" cy="194" r="2.6" fill="#3b1a06"/><circle cx="156" cy="190" r="2.2" fill="#fff"/>
    <ellipse cx="207" cy="193" rx="14" ry="17" fill="#fff"/><circle cx="207" cy="194" r="6.5" fill="url(#gs-iris)"/><circle cx="207" cy="194" r="2.6" fill="#3b1a06"/><circle cx="210" cy="190" r="2.2" fill="#fff"/>
  </g>
  <g data-e="sad">
    <ellipse cx="153" cy="197" rx="12" ry="13" fill="#fff"/><ellipse cx="153" cy="199" rx="9.5" ry="10.5" fill="url(#gs-iris)"/><circle cx="156" cy="194" r="3" fill="#fff"/>
    <ellipse cx="207" cy="197" rx="12" ry="13" fill="#fff"/><ellipse cx="207" cy="199" rx="9.5" ry="10.5" fill="url(#gs-iris)"/><circle cx="210" cy="194" r="3" fill="#fff"/>
    <path d="M140 190 Q153 184 166 188 M194 188 Q207 184 220 190" stroke="#5b2c16" stroke-width="3" fill="none" stroke-linecap="round"/>
  </g>
  <!-- 눈썹 -->
  <g data-e="normal grin wink happy smug"><path d="M142 168 Q152 162 162 166 M198 166 Q208 162 218 168" stroke="#b5501f" stroke-width="3" fill="none" stroke-linecap="round"/></g>
  <g data-e="surprise"><path d="M142 160 Q152 152 162 158 M198 158 Q208 152 218 160" stroke="#b5501f" stroke-width="3" fill="none" stroke-linecap="round"/></g>
  <g data-e="sad"><path d="M142 166 Q152 168 162 162 M198 162 Q208 168 218 166" stroke="#b5501f" stroke-width="3" fill="none" stroke-linecap="round"/></g>
  <!-- 코 -->
  <path d="M178 212 Q180 215 182 212" stroke="#d98a6a" stroke-width="2" fill="none" stroke-linecap="round"/>
  <!-- 입 -->
  <g data-e="normal wink" data-talk="closed"><path d="M168 228 Q174 234 180 228 Q186 234 192 228" stroke="#8a3b22" stroke-width="2.6" fill="none" stroke-linecap="round"/></g>
  <g data-e="grin happy" data-talk="closed"><path d="M164 226 Q180 246 196 226 Z" fill="#9c2f2a"/><path d="M170 236 Q180 242 190 236 Q180 246 170 236 Z" fill="#f28a8a"/><path d="M168 226 l4 7 3 -7 Z" fill="#fff"/></g>
  <g data-e="smug" data-talk="closed"><path d="M166 228 Q173 234 180 228 Q187 234 194 228" stroke="#8a3b22" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M168 228 l3 5 2 -5" fill="#fff"/></g>
  <g data-e="surprise" data-talk="closed"><ellipse cx="180" cy="232" rx="6" ry="7.5" fill="#9c2f2a"/></g>
  <g data-e="sad" data-talk="closed"><path d="M170 234 Q180 226 190 234" stroke="#8a3b22" stroke-width="2.6" fill="none" stroke-linecap="round"/></g>
  <g data-e="normal grin wink happy smug surprise sad" data-talk="open"><path d="M166 226 Q180 224 194 226 Q190 244 180 244 Q170 244 166 226 Z" fill="#9c2f2a"/><path d="M171 238 Q180 243 189 238" stroke="#f28a8a" stroke-width="3" fill="none"/><path d="M169 226 l3.5 6 3 -6 Z" fill="#fff"/></g>
  <!-- 앞머리 -->
  <path d="M114 200 C106 140 132 98 180 98 C228 98 254 140 246 200 C240 176 232 160 222 148 L214 168 L204 140 L192 162 L180 132 L168 162 L156 140 L146 168 L138 148 C128 160 120 176 114 200 Z" fill="url(#gs-hair)"/>
  <!-- 땋은 옆머리 -->
  <g fill="url(#gs-hair)">
    <path d="M118 190 C108 220 110 250 116 270 C122 252 126 228 128 200 Z"/>
    <ellipse cx="116" cy="282" rx="10" ry="13"/><ellipse cx="115" cy="304" rx="9" ry="12"/><ellipse cx="114" cy="324" rx="8" ry="11"/>
    <path d="M242 190 C252 220 250 250 244 270 C238 252 234 228 232 200 Z"/>
    <ellipse cx="244" cy="282" rx="10" ry="13"/><ellipse cx="245" cy="304" rx="9" ry="12"/><ellipse cx="246" cy="324" rx="8" ry="11"/>
  </g>
  <path d="M106 334 L122 334 L126 356 L114 348 L102 356 Z" fill="#d6453d"/>
  <path d="M238 334 L254 334 L258 356 L246 348 L234 356 Z" fill="#d6453d"/>
  <!-- 머리 꽃장식 -->
  <g transform="translate(222 120)"><circle r="9" fill="#ff7aa8"/><circle r="9" cx="-8" cy="6" fill="#ff9cc0"/><circle r="9" cx="8" cy="6" fill="#ff9cc0"/><circle r="4" cy="3" fill="#ffd34d"/></g>
</g>
</svg>`;

  const ART = { cheongun, luna, guseul };

  function mount(name, host) {
    host.innerHTML = ART[name]();
    const svg = host.querySelector('svg');
    let expr = 'normal', mouthOpen = false, timer = null;
    const nodes = Array.from(svg.querySelectorAll('[data-e]'));
    function paint() {
      for (const n of nodes) {
        const list = n.getAttribute('data-e').split(' ');
        const t = n.getAttribute('data-talk');
        const ok = list.includes(expr) && (!t || (t === 'open') === mouthOpen);
        n.style.display = ok ? '' : 'none';
      }
    }
    function set(e) { if (e) expr = e; paint(); return api; }
    function talk(on) {
      clearInterval(timer);
      if (on) {
        timer = setInterval(() => { mouthOpen = !mouthOpen; paint(); }, 120);
      } else { mouthOpen = false; paint(); }
      svg.classList.toggle('talking', !!on);
    }
    const api = { set, talk, el: svg, get expr() { return expr; } };
    paint();
    return api;
  }

  window.Characters = { mount, ART };
})();
