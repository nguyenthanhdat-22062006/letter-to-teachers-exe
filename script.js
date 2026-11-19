/**
 * DEAR TEACHER.EXE — Upgraded Interactive Controller
 * - Stage machine: intro -> opening -> card (guarded against double-click)
 * - Petals + confetti canvas, background glyphs
 * - Terminal typewriter with progress bar
 * - Copy wish / copy code / share, toast feedback
 * - Music-box synth default OFF, robust AudioContext handling
 * - Reduced-motion + mobile + keyboard accessible
 */
(function () {
  'use strict';

  const bodyEl = document.body;
  const introStage = document.getElementById('intro-stage');
  const cardStage = document.getElementById('card-stage');
  const envelopeScene = document.querySelector('.envelope-scene');
  const envelopeEl = document.getElementById('envelope-trigger');
  const openGiftBtn = document.getElementById('open-gift-btn');
  const topReplayBtn = document.getElementById('top-replay-btn');
  const topCloseBtn = document.getElementById('top-close-btn');
  const cardReplayBtn = document.getElementById('card-replay-btn');
  const cardCloseBtn = document.getElementById('card-close-btn');
  const brandHomeBtn = document.getElementById('brand-home');
  const togglePetalsBtn = document.getElementById('toggle-petals-btn');
  const toggleSoundBtn = document.getElementById('toggle-sound-btn');
  const soundIconOff = document.getElementById('sound-icon-off');
  const soundIconOn = document.getElementById('sound-icon-on');
  const petalCanvas = document.getElementById('petal-canvas');
  const confettiCanvas = document.getElementById('confetti-canvas');
  const glyphLayer = document.getElementById('code-glyph-layer');
  const terminalOutput = document.getElementById('terminal-output');
  const terminalBar = document.getElementById('terminal-progress-bar');
  const proseParagraphs = Array.from(document.querySelectorAll('.prose-para'));
  const codeSnippetEl = document.querySelector('.code-snippet');
  const cardSignoffEl = document.querySelector('.card-signoff');
  const toastEl = document.getElementById('card-toast');
  const copyCodeBtn = document.getElementById('copy-code-btn');
  const copyWishBtn = document.getElementById('copy-wish-btn');
  const shareBtn = document.getElementById('share-btn');

  let currentStage = 'intro'; // intro | opening | card | closing
  let petalsEnabled = true;
  let soundEnabled = false;
  let activeTimeouts = [];
  let terminalSessionId = 0;
  let toastTimer = 0;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function clearManagedTimeouts() {
    activeTimeouts.forEach((id) => window.clearTimeout(id));
    activeTimeouts = [];
  }
  function scheduleTask(fn, delay) {
    const id = window.setTimeout(fn, delay);
    activeTimeouts.push(id);
    return id;
  }
  function showToast(msg, ok) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.toggle('is-success', !!ok);
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => { toastEl.textContent = ''; }, 3200);
  }

  /* ---------- Background glyphs ---------- */
  function initCodeGlyphs() {
    if (!glyphLayer) return;
    const glyphs = ['{ }', '</>', 'const', '01', '=>', '20.11', 'printf()', 'TDTU', 'gratitude', '&&'];
    const positions = [
      { left: '7%', top: '18%' }, { left: '85%', top: '20%' },
      { left: '13%', top: '72%' }, { left: '88%', top: '68%' },
      { left: '24%', top: '36%' }, { left: '76%', top: '42%' },
      { left: '4%', top: '48%' }, { left: '93%', top: '85%' },
      { left: '34%', top: '87%' }, { left: '66%', top: '13%' },
    ];
    positions.forEach((pos, idx) => {
      const span = document.createElement('span');
      span.className = 'code-glyph';
      span.textContent = glyphs[idx % glyphs.length];
      span.style.left = pos.left;
      span.style.top = pos.top;
      span.style.setProperty('--dur', (17 + (idx % 7)) + 's');
      span.style.setProperty('--delay', (idx * 0.9) + 's');
      glyphLayer.appendChild(span);
    });
  }

  /* ---------- Petals canvas ---------- */
  function initPetalCanvas() {
    if (!petalCanvas) return;
    const ctx = petalCanvas.getContext('2d');
    if (!ctx) return;
    let width = 0, height = 0, raf = 0;
    const palette = [
      'rgba(214,184,120,0.55)', 'rgba(216,206,238,0.72)',
      'rgba(255,255,255,0.85)', 'rgba(235,216,174,0.62)',
    ];
    let petals = [];
    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth; height = window.innerHeight;
      petalCanvas.width = Math.floor(width * dpr);
      petalCanvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function make(randomY) {
      return {
        x: Math.random() * width,
        y: randomY ? Math.random() * height : -20 - Math.random() * 40,
        size: 5 + Math.random() * 7,
        speedY: 0.45 + Math.random() * 0.75,
        speedX: -0.25 + Math.random() * 0.5,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.022,
        sway: Math.random() * Math.PI * 2,
        color: palette[Math.floor(Math.random() * palette.length)],
      };
    }
    function populate() {
      const count = width < 640 ? 16 : 28;
      petals = Array.from({ length: count }, () => make(true));
    }
    function draw(p) {
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.angle);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.moveTo(0, -p.size);
      ctx.bezierCurveTo(p.size * 0.85, -p.size * 0.45, p.size * 0.75, p.size * 0.65, 0, p.size);
      ctx.bezierCurveTo(-p.size * 0.75, p.size * 0.65, -p.size * 0.85, -p.size * 0.45, 0, -p.size);
      ctx.fill(); ctx.restore();
    }
    function frame() {
      ctx.clearRect(0, 0, width, height);
      if (petalsEnabled) {
        for (let i = 0; i < petals.length; i++) {
          const p = petals[i];
          if (!prefersReducedMotion) {
            p.sway += 0.015; p.y += p.speedY;
            p.x += p.speedX + Math.sin(p.sway) * 0.35;
            p.angle += p.spin;
            if (p.y > height + 24 || p.x < -30 || p.x > width + 30) petals[i] = make(false);
          }
          draw(petals[i]);
        }
      }
      raf = window.requestAnimationFrame(frame);
    }
    resize(); populate(); frame();
    window.addEventListener('resize', () => { resize(); populate(); });
    window.addEventListener('beforeunload', () => window.cancelAnimationFrame(raf));
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) window.cancelAnimationFrame(raf);
      else raf = window.requestAnimationFrame(frame);
    });
  }

  /* ---------- Confetti burst (no external assets) ---------- */
  function fireConfetti() {
    if (!confettiCanvas || prefersReducedMotion) return;
    const ctx = confettiCanvas.getContext('2d');
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth, h = window.innerHeight;
    confettiCanvas.width = Math.floor(w * dpr);
    confettiCanvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const colors = ['#D6B878', '#172B4D', '#D8CEEE', '#FFFFFF', '#A9833B'];
    const parts = Array.from({ length: Math.min(140, w < 640 ? 70 : 140) }, () => ({
      x: w / 2 + (Math.random() - 0.5) * 160,
      y: h * 0.32,
      vx: (Math.random() - 0.5) * 7,
      vy: -2 - Math.random() * 5,
      s: 4 + Math.random() * 5,
      r: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.25,
      c: colors[Math.floor(Math.random() * colors.length)],
      life: 90 + Math.random() * 40,
    }));
    let tick = 0;
    (function anim() {
      tick++;
      ctx.clearRect(0, 0, w, h);
      let alive = false;
      parts.forEach((p) => {
        if (tick > p.life) return;
        alive = true;
        p.vy += 0.16; p.x += p.vx; p.y += p.vy; p.r += p.vr;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r);
        ctx.fillStyle = p.c; ctx.globalAlpha = Math.max(0, 1 - tick / (p.life + 20));
        ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.62);
        ctx.restore();
      });
      if (alive) window.requestAnimationFrame(anim);
      else ctx.clearRect(0, 0, w, h);
    })();
  }

  /* ---------- Sound: music-box synth, default OFF ---------- */
  const soundEngine = (function () {
    let audioCtx = null, loopTimer = null;
    function ensure() {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      if (!audioCtx) { try { audioCtx = new AC(); } catch (e) { return null; } }
      if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
      return audioCtx;
    }
    function bell(freq, offset, dur, gain) {
      if (!soundEnabled) return;
      const ctx = ensure(); if (!ctx) return;
      const now = ctx.currentTime + offset;
      const osc = ctx.createOscillator(), over = ctx.createOscillator();
      const g = ctx.createGain(), og = ctx.createGain();
      osc.type = 'sine'; osc.frequency.setValueAtTime(freq, now);
      over.type = 'triangle'; over.frequency.setValueAtTime(freq * 2, now);
      og.gain.setValueAtTime(0.14, now);
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(gain, now + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
      osc.connect(g); over.connect(og); og.connect(g); g.connect(ctx.destination);
      osc.start(now); over.start(now);
      osc.stop(now + dur + 0.05); over.stop(now + dur + 0.05);
    }
    function chime() {
      if (!soundEnabled) return;
      [523.25, 659.25, 783.99, 987.77, 1174.66].forEach((f, i) => bell(f, i * 0.11, 1.35, 0.05));
    }
    function loop() {
      stop();
      if (!soundEnabled) return;
      const phrases = [
        [523.25, 659.25, 783.99, 987.77],
        [440.0, 523.25, 659.25, 783.99],
        [349.23, 440.0, 523.25, 659.25],
        [392.0, 493.88, 587.33, 783.99],
      ];
      let step = 0;
      const next = () => {
        if (!soundEnabled) return;
        phrases[step % phrases.length].forEach((f, i) => bell(f, i * 0.28, 1.8, 0.032));
        step++;
        loopTimer = window.setTimeout(next, 3600);
      };
      next();
    }
    function stop() { if (loopTimer !== null) { window.clearTimeout(loopTimer); loopTimer = null; } }
    return { chime, loop, stop };
  })();

  /* ---------- Terminal typewriter ---------- */
  function resetCardReveals() {
    if (terminalOutput) terminalOutput.innerHTML = '';
    if (terminalBar) terminalBar.style.width = '0%';
    proseParagraphs.forEach((p) => p.classList.remove('is-revealed'));
    if (codeSnippetEl) codeSnippetEl.classList.remove('is-revealed');
    if (cardSignoffEl) cardSignoffEl.classList.remove('is-revealed');
  }
  function runTerminalSequence() {
    if (!terminalOutput) return;
    terminalSessionId++;
    const session = terminalSessionId;
    terminalOutput.innerHTML = '';
    const lines = [
      { text: 'Initializing gratitude.exe...', success: false },
      { text: 'Loading memories... 100%', success: false },
      { text: 'Thank you, Teacher!', success: true },
    ];
    let li = 0, ci = 0, textEl = null, cursor = null;
    function newCursor() {
      const c = document.createElement('span');
      c.className = 'terminal-cursor'; c.setAttribute('aria-hidden', 'true');
      return c;
    }
    function mountLine() {
      if (session !== terminalSessionId || !terminalOutput) return;
      if (cursor && cursor.parentNode) cursor.parentNode.removeChild(cursor);
      const cfg = lines[li];
      const row = document.createElement('div');
      row.className = cfg.success ? 'terminal-line terminal-line--success' : 'terminal-line';
      const prompt = document.createElement('span');
      prompt.className = 'terminal-line__prompt'; prompt.textContent = '>';
      textEl = document.createElement('span');
      textEl.className = 'terminal-line__text';
      cursor = newCursor();
      row.appendChild(prompt); row.appendChild(textEl); row.appendChild(cursor);
      terminalOutput.appendChild(row);
      ci = 0;
      if (terminalBar) terminalBar.style.width = Math.round((li / lines.length) * 100) + '%';
      typeChar();
    }
    function typeChar() {
      if (session !== terminalSessionId) return;
      const cfg = lines[li];
      if (!textEl) return;
      if (prefersReducedMotion) {
        textEl.textContent = cfg.text;
        li++;
        if (li < lines.length) mountLine();
        else if (terminalBar) terminalBar.style.width = '100%';
        return;
      }
      if (ci < cfg.text.length) {
        textEl.textContent += cfg.text.charAt(ci); ci++;
        scheduleTask(typeChar, cfg.success ? 34 : 26);
      } else {
        li++;
        if (li < lines.length) scheduleTask(mountLine, 260);
        else if (terminalBar) terminalBar.style.width = '100%';
      }
    }
    mountLine();
  }
  function revealCardContent() {
    runTerminalSequence();
    proseParagraphs.forEach((p, idx) => {
      scheduleTask(() => p.classList.add('is-revealed'), prefersReducedMotion ? 60 : 220 + idx * 140);
    });
    scheduleTask(() => { if (codeSnippetEl) codeSnippetEl.classList.add('is-revealed'); }, prefersReducedMotion ? 120 : 820);
    scheduleTask(() => { if (cardSignoffEl) cardSignoffEl.classList.add('is-revealed'); }, prefersReducedMotion ? 180 : 980);
  }

  /* ---------- Stage transitions ---------- */
  function syncTopbar(showCard) {
    if (topReplayBtn) topReplayBtn.classList.toggle('is-hidden', !showCard);
    if (topCloseBtn) topCloseBtn.classList.toggle('is-hidden', !showCard);
  }
  function lockControls(locked) {
    [openGiftBtn, cardReplayBtn, topReplayBtn].forEach((b) => { if (b) b.disabled = locked; });
    if (envelopeEl) envelopeEl.classList.toggle('is-locked', locked);
  }

  function openGreetingCard() {
    if (currentStage !== 'intro') return;
    currentStage = 'opening';
    bodyEl.setAttribute('data-stage', 'opening');
    clearManagedTimeouts();
    lockControls(true);
    if (envelopeEl) envelopeEl.classList.add('is-opening');
    if (envelopeScene) envelopeScene.classList.add('is-opening');
    if (soundEnabled) soundEngine.chime();

    scheduleTask(() => { if (introStage) introStage.classList.add('is-fading-out'); }, prefersReducedMotion ? 120 : 860);
    scheduleTask(() => {
      if (introStage) { introStage.classList.add('is-hidden'); introStage.classList.remove('is-fading-out'); }
      if (envelopeEl) envelopeEl.classList.remove('is-opening');
      if (envelopeScene) envelopeScene.classList.remove('is-opening');
      resetCardReveals();
      if (cardStage) {
        cardStage.classList.remove('is-hidden', 'is-closing');
        cardStage.setAttribute('aria-hidden', 'false');
        window.requestAnimationFrame(() => cardStage.classList.add('is-visible'));
      }
      currentStage = 'card';
      bodyEl.setAttribute('data-stage', 'card');
      syncTopbar(true);
      lockControls(false);
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      fireConfetti();
      scheduleTask(revealCardContent, prefersReducedMotion ? 80 : 240);
      const title = document.getElementById('card-title');
      if (title) { title.setAttribute('tabindex', '-1'); title.focus({ preventScroll: true }); }
    }, prefersReducedMotion ? 320 : 1260);
  }

  function closeGreetingCard() {
    if (currentStage !== 'card') return;
    currentStage = 'closing';
    clearManagedTimeouts();
    terminalSessionId++;
    lockControls(true);
    if (cardStage) {
      cardStage.classList.remove('is-visible');
      cardStage.classList.add('is-closing');
      cardStage.setAttribute('aria-hidden', 'true');
    }
    syncTopbar(false);
    scheduleTask(() => {
      if (cardStage) { cardStage.classList.add('is-hidden'); cardStage.classList.remove('is-closing'); }
      resetCardReveals();
      if (introStage) introStage.classList.remove('is-hidden', 'is-fading-out');
      currentStage = 'intro';
      bodyEl.setAttribute('data-stage', 'intro');
      lockControls(false);
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      if (openGiftBtn) openGiftBtn.focus({ preventScroll: true });
    }, prefersReducedMotion ? 160 : 460);
  }

  function replaySequence() {
    if (currentStage === 'opening' || currentStage === 'closing') return;
    clearManagedTimeouts();
    terminalSessionId++;
    if (currentStage === 'card') {
      if (cardStage) {
        cardStage.classList.remove('is-visible');
        cardStage.classList.add('is-closing');
        cardStage.setAttribute('aria-hidden', 'true');
      }
      syncTopbar(false);
      scheduleTask(() => {
        if (cardStage) { cardStage.classList.add('is-hidden'); cardStage.classList.remove('is-closing'); }
        resetCardReveals();
        if (introStage) introStage.classList.remove('is-hidden', 'is-fading-out');
        currentStage = 'intro';
        bodyEl.setAttribute('data-stage', 'intro');
        scheduleTask(openGreetingCard, prefersReducedMotion ? 120 : 280);
      }, prefersReducedMotion ? 160 : 420);
    } else {
      openGreetingCard();
    }
  }

  /* ---------- Clipboard / share ---------- */
  const WISH_TEXT = 'Nhân ngày Nhà giáo Việt Nam 20/11, chúng em xin gửi đến quý Thầy Cô những lời tri ân chân thành và sâu sắc nhất. Cảm ơn Thầy Cô đã luôn tận tâm truyền đạt kiến thức, kiên nhẫn dẫn dắt và truyền cảm hứng để chúng em không ngừng học hỏi, trưởng thành trên hành trình tri thức. Nếu cuộc đời là một chương trình lớn, Thầy Cô chính là những người đã giúp chúng em viết nên những dòng code đầu tiên trong hành trình tri thức. Kính chúc Thầy Cô luôn mạnh khỏe, hạnh phúc và tiếp tục giữ mãi ngọn lửa nhiệt huyết với sự nghiệp trồng người. — From IT Students, TDTU. HAPPY VIETNAMESE TEACHERS\' DAY 20/11!';
  const CODE_TEXT = 'const gratitude = {\n    respect: "Infinite",\n    memories: "Forever",\n    thanks: "Countless"\n};\n\nconsole.log("Thank you, Teacher!");';

  async function copyText(text, okMsg) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        document.execCommand('copy');
        ta.remove();
      }
      showToast(okMsg, true);
    } catch (e) {
      showToast('Không sao chép được trên trình duyệt này.', false);
    }
  }

  function bindEvents() {
    if (openGiftBtn) openGiftBtn.addEventListener('click', openGreetingCard);
    if (envelopeEl) {
      envelopeEl.addEventListener('click', openGreetingCard);
      envelopeEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openGreetingCard(); }
      });
    }
    if (topCloseBtn) topCloseBtn.addEventListener('click', closeGreetingCard);
    if (cardCloseBtn) cardCloseBtn.addEventListener('click', closeGreetingCard);
    if (topReplayBtn) topReplayBtn.addEventListener('click', replaySequence);
    if (cardReplayBtn) cardReplayBtn.addEventListener('click', replaySequence);
    if (brandHomeBtn) brandHomeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (currentStage === 'card') closeGreetingCard();
      else window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && currentStage === 'card') closeGreetingCard();
    });

    if (togglePetalsBtn) togglePetalsBtn.addEventListener('click', () => {
      petalsEnabled = !petalsEnabled;
      togglePetalsBtn.classList.toggle('is-active', petalsEnabled);
      togglePetalsBtn.setAttribute('aria-pressed', String(petalsEnabled));
      const label = togglePetalsBtn.querySelector('.ctrl-btn__label');
      if (label) label.textContent = petalsEnabled ? 'Hoa: Bật' : 'Hoa: Tắt';
      if (petalCanvas) petalCanvas.classList.toggle('is-paused', !petalsEnabled);
    });
    if (toggleSoundBtn) toggleSoundBtn.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      toggleSoundBtn.classList.toggle('is-active', soundEnabled);
      toggleSoundBtn.setAttribute('aria-pressed', String(soundEnabled));
      const label = toggleSoundBtn.querySelector('.ctrl-btn__label');
      if (label) label.textContent = soundEnabled ? 'Nhạc: Bật' : 'Nhạc: Tắt';
      if (soundIconOff && soundIconOn) {
        soundIconOff.classList.toggle('is-hidden', soundEnabled);
        soundIconOn.classList.toggle('is-hidden', !soundEnabled);
      }
      if (soundEnabled) { soundEngine.chime(); soundEngine.loop(); }
      else soundEngine.stop();
    });

    if (copyCodeBtn) copyCodeBtn.addEventListener('click', () => copyText(CODE_TEXT, 'Đã sao chép đoạn code tri ân.'));
    if (copyWishBtn) copyWishBtn.addEventListener('click', () => copyText(WISH_TEXT, 'Đã sao chép lời chúc để gửi Thầy/Cô.'));
    if (shareBtn) shareBtn.addEventListener('click', async () => {
      const data = { title: 'DEAR TEACHER.EXE — 20/11', text: WISH_TEXT, url: window.location.href };
      try {
        if (navigator.share) { await navigator.share(data); }
        else await copyText(window.location.href, 'Đã sao chép link thiệp để gửi Thầy/Cô.');
      } catch (e) {
        if (e && e.name !== 'AbortError') showToast('Không chia sẻ được, bạn hãy sao chép link thủ công nhé.', false);
      }
    });
  }

  initCodeGlyphs();
  initPetalCanvas();
  bindEvents();
})();
