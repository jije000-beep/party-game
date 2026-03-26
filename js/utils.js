/* ========== Utils ========== */
const Utils = {
  shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  },

  randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  },

  easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  },

  generateColors(n) {
    const colors = [];
    const palette = [
      '#e94560', '#4ecdc4', '#ffe66d', '#533483',
      '#45b7d1', '#f9844a', '#90be6d', '#f94144',
      '#277da1', '#ff6b6b', '#c77dff', '#43aa8b'
    ];
    for (let i = 0; i < n; i++) {
      colors.push(palette[i % palette.length]);
    }
    return colors;
  },

  vibrate(ms) {
    if (navigator.vibrate) navigator.vibrate(ms);
  },

  // Web Audio API sound effects
  _audioCtx: null,
  getAudioCtx() {
    if (!this._audioCtx) {
      this._audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return this._audioCtx;
  },

  playTick() {
    try {
      const ctx = this.getAudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 800;
      gain.gain.value = 0.15;
      osc.start(ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.stop(ctx.currentTime + 0.06);
    } catch (e) {}
  },

  playReveal() {
    try {
      const ctx = this.getAudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'triangle';
      osc.frequency.value = 523;
      gain.gain.value = 0.2;
      osc.start(ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(784, ctx.currentTime + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.stop(ctx.currentTime + 0.31);
    } catch (e) {}
  },

  playFanfare() {
    try {
      const ctx = this.getAudioCtx();
      const notes = [523, 659, 784, 1047];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.value = freq;
        gain.gain.value = 0.15;
        const startTime = ctx.currentTime + i * 0.12;
        osc.start(startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);
        osc.stop(startTime + 0.26);
      });
    } catch (e) {}
  },

  // Confetti
  confetti() {
    const canvas = document.getElementById('confetti-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#e94560', '#4ecdc4', '#ffe66d', '#533483', '#f9844a', '#90be6d'];
    const particleCount = 80;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 100,
        y: canvas.height / 2,
        vx: (Math.random() - 0.5) * 16,
        vy: Math.random() * -14 - 4,
        w: Utils.randInt(6, 12),
        h: Utils.randInt(4, 8),
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 12,
        gravity: 0.3 + Math.random() * 0.2,
        opacity: 1,
      });
    }

    let frame = 0;
    const maxFrames = 120;

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frame++;

      particles.forEach(p => {
        p.x += p.vx;
        p.vy += p.gravity;
        p.y += p.vy;
        p.rotation += p.rotSpeed;
        p.vx *= 0.99;
        if (frame > maxFrames - 30) {
          p.opacity -= 0.033;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });

      if (frame < maxFrames) {
        requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    animate();
  },

  // Canvas HiDPI setup
  setupCanvas(canvas, width, height) {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    return ctx;
  }
};
