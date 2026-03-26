/* ========== Roulette Game ========== */
const Roulette = {
  canvas: null,
  ctx: null,
  rotation: 0,
  spinning: false,
  segments: [],
  size: 0,

  // Warm brown/cream palette matching reference
  warmColors: {
    darkBrown: '#5C3D2E',
    medBrown: '#8B6247',
    cream: '#F2E0CE',
    lightCream: '#FAF0E6',
    accent: '#C4956A',
    center: '#4A2C1A',
    text: '#FFFFFF',
    textDark: '#3E2314',
  },

  init() {
    this.canvas = document.getElementById('roulette-canvas');
    this.segments = App.state.penalties;
    this.spinning = false;
    this.rotation = 0;

    const wrapper = this.canvas.parentElement;
    this.size = Math.min(wrapper.clientWidth, 340);
    this.ctx = Utils.setupCanvas(this.canvas, this.size, this.size);
    this.canvas.style.width = this.size + 'px';
    this.canvas.style.height = this.size + 'px';

    document.getElementById('btn-spin').disabled = false;
    document.getElementById('btn-spin').textContent = 'START';
    document.getElementById('roulette-result').innerHTML = '';

    this.draw();
  },

  getSegColor(i) {
    const c = this.warmColors;
    // Alternate dark brown / cream, with occasional accent
    const pattern = [c.darkBrown, c.cream, c.medBrown, c.lightCream, c.accent, c.cream];
    return pattern[i % pattern.length];
  },

  isDark(color) {
    const c = this.warmColors;
    return color === c.darkBrown || color === c.medBrown || color === c.accent || color === c.center;
  },

  draw() {
    const ctx = this.ctx;
    const cx = this.size / 2;
    const cy = this.size / 2;
    const outerR = this.size / 2 - 6;
    const n = this.segments.length;
    const sliceAngle = (2 * Math.PI) / n;
    const c = this.warmColors;

    ctx.clearRect(0, 0, this.size, this.size);

    // === Soft shadow behind wheel ===
    ctx.save();
    ctx.shadowColor = 'rgba(60, 30, 10, 0.35)';
    ctx.shadowBlur = 25;
    ctx.shadowOffsetY = 4;
    ctx.beginPath();
    ctx.arc(cx, cy, outerR, 0, 2 * Math.PI);
    ctx.fillStyle = c.darkBrown;
    ctx.fill();
    ctx.restore();

    // === Outer rim ring ===
    ctx.beginPath();
    ctx.arc(cx, cy, outerR, 0, 2 * Math.PI);
    ctx.fillStyle = c.darkBrown;
    ctx.fill();

    // Thin gold ring
    ctx.beginPath();
    ctx.arc(cx, cy, outerR - 1, 0, 2 * Math.PI);
    ctx.strokeStyle = c.accent;
    ctx.lineWidth = 2;
    ctx.stroke();

    // === Segments ===
    const segR = outerR - 6;
    for (let i = 0; i < n; i++) {
      const startAngle = this.rotation + i * sliceAngle - Math.PI / 2;
      const endAngle = startAngle + sliceAngle;
      const midAngle = startAngle + sliceAngle / 2;
      const segColor = this.getSegColor(i);

      // Segment fill
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, segR, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = segColor;
      ctx.fill();

      // Divider line
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(startAngle) * segR, cy + Math.sin(startAngle) * segR);
      ctx.strokeStyle = 'rgba(74, 44, 26, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // === Segment text ===
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(midAngle);

      const fontSize = Math.max(14, Math.min(22, 220 / n));
      ctx.font = `${fontSize}px 'Jua', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const label = this.truncText(ctx, this.segments[i], segR * 0.52);
      const textX = segR * 0.56;

      // Text color based on segment brightness
      if (this.isDark(segColor)) {
        ctx.fillStyle = c.text;
      } else {
        ctx.fillStyle = c.textDark;
      }

      // Subtle shadow for readability
      ctx.save();
      ctx.shadowColor = this.isDark(segColor) ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.15)';
      ctx.shadowBlur = 2;
      ctx.shadowOffsetY = 1;
      ctx.fillText(label, textX, 0);
      ctx.restore();

      ctx.restore();
    }

    // === Inner ring decoration ===
    ctx.beginPath();
    ctx.arc(cx, cy, segR * 0.30, 0, 2 * Math.PI);
    ctx.strokeStyle = c.accent;
    ctx.lineWidth = 2;
    ctx.stroke();

    // === Center circle ===
    const centerR = segR * 0.26;

    // Center fill - deep brown
    const centerGrad = ctx.createRadialGradient(cx, cy - centerR * 0.2, 0, cx, cy, centerR);
    centerGrad.addColorStop(0, '#6B3A24');
    centerGrad.addColorStop(1, c.center);
    ctx.beginPath();
    ctx.arc(cx, cy, centerR, 0, 2 * Math.PI);
    ctx.fillStyle = centerGrad;
    ctx.fill();

    // Center border
    ctx.beginPath();
    ctx.arc(cx, cy, centerR, 0, 2 * Math.PI);
    ctx.strokeStyle = c.accent;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // === Small decorative dots on rim ===
    const dotCount = n;
    for (let i = 0; i < dotCount; i++) {
      const angle = this.rotation + i * sliceAngle - Math.PI / 2;
      const dx = cx + Math.cos(angle) * (segR + 3);
      const dy = cy + Math.sin(angle) * (segR + 3);
      ctx.beginPath();
      ctx.arc(dx, dy, 2, 0, 2 * Math.PI);
      ctx.fillStyle = c.accent;
      ctx.fill();
    }
  },

  truncText(ctx, text, maxWidth) {
    if (ctx.measureText(text).width <= maxWidth) return text;
    let t = text;
    while (t.length > 1 && ctx.measureText(t + '..').width > maxWidth) {
      t = t.slice(0, -1);
    }
    return t + '..';
  },

  spin() {
    if (this.spinning) return;
    this.spinning = true;

    const btn = document.getElementById('btn-spin');
    btn.disabled = true;
    btn.textContent = '돌리는 중...';
    document.getElementById('roulette-result').innerHTML = '';
    Utils.vibrate(40);

    const n = this.segments.length;
    const sliceAngle = (2 * Math.PI) / n;

    const extraTurns = Utils.randInt(4, 7) * 2 * Math.PI;
    const randomOffset = Math.random() * 2 * Math.PI;
    const totalRotation = extraTurns + randomOffset;

    const startRotation = this.rotation;
    const duration = Utils.randInt(4000, 5500);
    const startTime = performance.now();
    let lastSegIndex = -1;

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = Utils.easeOutQuart(progress);

      this.rotation = startRotation + totalRotation * eased;
      this.draw();

      const currentAngle = ((this.rotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      const segIndex = Math.floor(currentAngle / sliceAngle) % n;
      if (segIndex !== lastSegIndex) {
        lastSegIndex = segIndex;
        if (progress < 0.85) Utils.playTick();
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.onSpinComplete();
      }
    };

    requestAnimationFrame(animate);
  },

  onSpinComplete() {
    this.spinning = false;
    const n = this.segments.length;
    const sliceAngle = (2 * Math.PI) / n;

    const normalizedRotation = ((this.rotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    const pointerAngle = (((-normalizedRotation) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    const winIndex = Math.floor(pointerAngle / sliceAngle) % n;

    const result = this.segments[winIndex];

    Utils.vibrate(100);
    Utils.playFanfare();
    Utils.confetti();

    const resultDiv = document.getElementById('roulette-result');
    resultDiv.innerHTML = `<div class="result-text">${result}</div>`;

    const btn = document.getElementById('btn-spin');
    btn.disabled = false;
    btn.textContent = 'START';
  }
};
