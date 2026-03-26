/* ========== Ladder Game ========== */
const Ladder = {
  canvas: null,
  ctx: null,
  columns: 0,
  totalRows: 20,
  bridges: [],
  topLabels: [],
  bottomLabels: [],
  tracedPaths: [],     // [{col, path, color, endCol}]
  tracedCols: new Set(),
  animating: false,
  stopGame: false,
  playerColors: ['#FFD233', '#7ED957', '#FF6B6B', '#5CE1E6', '#FF66C4', '#FFA53E', '#B07CFF', '#38B6FF', '#FF914D', '#C77DFF'],

  // Ladder style
  ladderColor: '#C4A882',
  ladderLineWidth: 6,
  bridgeLineWidth: 6,
  traceLineWidth: 7,

  init() {
    this.canvas = document.getElementById('ladder-canvas');
    this.topLabels = App.state.players;
    this.bottomLabels = Utils.shuffle([...App.state.penalties]);
    this.columns = this.topLabels.length;
    this.tracedPaths = [];
    this.tracedCols = new Set();
    this.animating = false;
    this.stopGame = false;

    this.generateBridges();
    this.renderLabels();
    this.resizeCanvas();
    this.draw();

    document.getElementById('ladder-hint').style.display = '';
    document.getElementById('btn-ladder-all').style.display = '';
  },

  generateBridges() {
    this.bridges = [];
    const minGap = 2;

    for (let col = 0; col < this.columns - 1; col++) {
      const bridgeCount = Utils.randInt(3, 5);
      const usedRows = [];

      for (let b = 0; b < bridgeCount; b++) {
        let row;
        let attempts = 0;
        do {
          row = Utils.randInt(1, this.totalRows - 1);
          attempts++;
        } while (usedRows.some(r => Math.abs(r - row) < minGap) && attempts < 50);

        if (attempts < 50) {
          const sameRowBridge = this.bridges.find(br => br.row === row && Math.abs(br.leftCol - col) <= 1);
          if (!sameRowBridge) {
            this.bridges.push({ row, leftCol: col });
            usedRows.push(row);
          }
        }
      }
    }

    this.bridges.sort((a, b) => a.row - b.row);
  },

  tracePath(startCol) {
    let currentCol = startCol;
    const path = [{ row: 0, col: currentCol }];

    for (let row = 1; row <= this.totalRows; row++) {
      const rightBridge = this.bridges.find(b => b.row === row && b.leftCol === currentCol);
      if (rightBridge) {
        path.push({ row, col: currentCol });
        currentCol += 1;
        path.push({ row, col: currentCol });
      } else {
        const leftBridge = this.bridges.find(b => b.row === row && b.leftCol === currentCol - 1);
        if (leftBridge) {
          path.push({ row, col: currentCol });
          currentCol -= 1;
          path.push({ row, col: currentCol });
        }
      }
    }

    path.push({ row: this.totalRows, col: currentCol });
    return { path, endCol: currentCol };
  },

  renderLabels() {
    const topDiv = document.getElementById('ladder-top');
    const bottomDiv = document.getElementById('ladder-bottom');
    topDiv.innerHTML = '';
    bottomDiv.innerHTML = '';

    this.topLabels.forEach((name, i) => {
      const label = document.createElement('div');
      label.className = 'ladder-label ladder-label--top';
      label.textContent = name;
      label.onclick = () => this.selectColumn(i);
      label.dataset.col = i;
      topDiv.appendChild(label);
    });

    this.bottomLabels.forEach((text, i) => {
      const label = document.createElement('div');
      label.className = 'ladder-label ladder-label--bottom';
      label.textContent = text;
      label.dataset.col = i;
      bottomDiv.appendChild(label);
    });
  },

  resizeCanvas() {
    const container = this.canvas.parentElement;
    const w = container.clientWidth;
    const h = Math.min(window.innerHeight * 0.5, 400);
    this.ctx = Utils.setupCanvas(this.canvas, w, h);
    this.canvasW = w;
    this.canvasH = h;
  },

  getX(col) {
    const padding = 30;
    const usable = this.canvasW - padding * 2;
    return padding + (col / (this.columns - 1)) * usable;
  },

  getY(row) {
    const padding = 10;
    const usable = this.canvasH - padding * 2;
    return padding + (row / this.totalRows) * usable;
  },

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvasW, this.canvasH);

    // Light background fill
    ctx.fillStyle = 'rgba(245, 240, 230, 0.06)';
    ctx.fillRect(0, 0, this.canvasW, this.canvasH);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Draw vertical lines - thick brown
    ctx.strokeStyle = this.ladderColor;
    ctx.lineWidth = this.ladderLineWidth;
    for (let col = 0; col < this.columns; col++) {
      const x = this.getX(col);
      ctx.beginPath();
      ctx.moveTo(x, this.getY(0));
      ctx.lineTo(x, this.getY(this.totalRows));
      ctx.stroke();
    }

    // Draw bridges - thick brown
    ctx.strokeStyle = this.ladderColor;
    ctx.lineWidth = this.bridgeLineWidth;
    this.bridges.forEach(b => {
      const x1 = this.getX(b.leftCol);
      const x2 = this.getX(b.leftCol + 1);
      const y = this.getY(b.row);
      ctx.beginPath();
      ctx.moveTo(x1, y);
      ctx.lineTo(x2, y);
      ctx.stroke();
    });

    // Draw traced paths on top
    this.tracedPaths.forEach(tp => {
      this.drawPath(tp.path, tp.color, false);
    });
  },

  drawPath(path, color, partial) {
    const ctx = this.ctx;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const count = partial ? partial : path.length;

    // Glow / shadow layer
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
    ctx.strokeStyle = color;
    ctx.lineWidth = this.traceLineWidth;
    ctx.beginPath();
    for (let i = 0; i < count && i < path.length; i++) {
      const x = this.getX(path[i].col);
      const y = this.getY(path[i].row);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.restore();

    // Main path layer
    ctx.strokeStyle = color;
    ctx.lineWidth = this.traceLineWidth;
    ctx.beginPath();
    for (let i = 0; i < count && i < path.length; i++) {
      const x = this.getX(path[i].col);
      const y = this.getY(path[i].row);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Draw dot at the last point
    if (count > 0 && count <= path.length) {
      const last = path[Math.min(count - 1, path.length - 1)];
      const lx = this.getX(last.col);
      const ly = this.getY(last.row);

      // Outer glow
      ctx.save();
      ctx.shadowColor = color;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(lx, ly, 9, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.restore();

      // White ring
      ctx.beginPath();
      ctx.arc(lx, ly, 9, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.stroke();
    }
  },

  selectColumn(col) {
    if (this.animating || this.tracedCols.has(col) || this.stopGame) return;
    this.animating = true;
    this.tracedCols.add(col);
    Utils.vibrate(30);

    const topLabel = document.querySelector(`.ladder-label--top[data-col="${col}"]`);
    if (topLabel) topLabel.classList.add('traced');

    const colorIndex = this.tracedPaths.length % this.playerColors.length;
    const color = this.playerColors[colorIndex];
    const { path, endCol } = this.tracePath(col);

    // Animate path
    let step = 1;
    const totalSteps = path.length;
    const stepDuration = 400 / totalSteps;

    const animate = () => {
      this.draw();
      this.drawPath(path, color, step);

      if (step % 3 === 0) Utils.playTick();

      step++;
      if (step <= totalSteps) {
        setTimeout(animate, stepDuration);
      } else {
        // Animation complete
        this.tracedPaths.push({ col, path, color, endCol });
        this.revealBottom(endCol);
        this.animating = false;
        this.draw();

        const resultText = this.bottomLabels[endCol];

        if (resultText === '당첨!') {
          this.stopGame = true;
          document.getElementById('ladder-hint').style.display = 'none';
          document.getElementById('btn-ladder-all').style.display = 'none';
          setTimeout(() => {
            App.showResult([{
              player: this.topLabels[col],
              penalty: '당첨!'
            }]);
          }, 800);
          return;
        }

        if (this.tracedCols.size === this.columns) {
          document.getElementById('ladder-hint').style.display = 'none';
          document.getElementById('btn-ladder-all').style.display = 'none';
          setTimeout(() => this.showAllResults(), 500);
        }
      }
    };

    animate();
  },

  revealBottom(col) {
    const label = document.querySelector(`.ladder-label--bottom[data-col="${col}"]`);
    if (label) {
      label.classList.add('revealed');
      Utils.playReveal();
      Utils.vibrate(50);
    }
  },

  revealAll() {
    if (this.animating) return;

    const remaining = [];
    for (let i = 0; i < this.columns; i++) {
      if (!this.tracedCols.has(i)) remaining.push(i);
    }
    if (remaining.length === 0) return;

    const processNext = () => {
      if (remaining.length === 0 || this.stopGame) return;
      if (this.animating) {
        setTimeout(processNext, 200);
        return;
      }
      const col = remaining.shift();
      this.selectColumn(col);
      setTimeout(processNext, 200);
    };
    processNext();
  },

  showAllResults() {
    const results = [];
    this.tracedPaths.forEach(tp => {
      results.push({
        player: this.topLabels[tp.col],
        penalty: this.bottomLabels[tp.endCol]
      });
    });
    setTimeout(() => App.showResult(results), 500);
  }
};
