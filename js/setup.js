/* ========== Setup Screen ========== */
const Setup = {
  count: 4,
  MIN: 2,
  MAX: 10,
  openSections: { names: false, penalties: false },

  init() {
    this.count = App.state.players.length || 4;
    document.getElementById('player-count').textContent = this.count;
    this.openSections = { names: false, penalties: false };

    const game = App.state.currentGame;
    const penaltyLabel = document.getElementById('penalty-label');
    const namesToggle = document.getElementById('toggle-names');
    const namesSection = document.getElementById('section-names');

    const countLabel = document.getElementById('count-label');
    const hint = document.getElementById('setup-hint');

    if (game === 'roulette') {
      penaltyLabel.textContent = '룰렛 항목 설정';
      countLabel.textContent = '룰렛 칸 수';
      hint.textContent = '1칸만 당첨! 나머지는 꽝';
      namesToggle.style.display = 'none';
      namesSection.style.display = 'none';
    } else if (game === 'lots') {
      penaltyLabel.textContent = '카드 내용 설정';
      countLabel.textContent = '카드 수';
      hint.textContent = '1장만 당첨! 나머지는 꽝';
      namesToggle.style.display = 'none';
      namesSection.style.display = 'none';
    } else {
      countLabel.textContent = '참가자 수';
      hint.textContent = '1명만 당첨! 나머지는 꽝';
      namesToggle.style.display = '';
      namesSection.style.display = '';
      if (game === 'ladder') {
        penaltyLabel.textContent = '결과 (하단) 설정';
      } else {
        penaltyLabel.textContent = '벌칙 / 보상 설정';
      }
    }

    // Close all sections visually
    ['names', 'penalties'].forEach(key => {
      const toggle = document.getElementById('toggle-' + key);
      const section = document.getElementById('section-' + key);
      if (toggle) toggle.classList.remove('open');
      if (section) section.classList.remove('open');
    });

    this.renderInputs();
  },

  changeCount(delta) {
    const newCount = this.count + delta;
    if (newCount < this.MIN || newCount > this.MAX) return;
    this.count = newCount;
    document.getElementById('player-count').textContent = this.count;
    Utils.vibrate(20);
    this.renderInputs();
  },

  toggleSection(key) {
    this.openSections[key] = !this.openSections[key];
    const toggle = document.getElementById('toggle-' + key);
    const section = document.getElementById('section-' + key);
    if (this.openSections[key]) {
      toggle.classList.add('open');
      section.classList.add('open');
    } else {
      toggle.classList.remove('open');
      section.classList.remove('open');
    }
  },

  renderInputs() {
    const playerDiv = document.getElementById('player-inputs');
    const penaltyDiv = document.getElementById('penalty-inputs');

    const prevPlayers = this.getValues('player-inputs');
    const prevPenalties = this.getValues('penalty-inputs');

    playerDiv.innerHTML = '';
    penaltyDiv.innerHTML = '';

    for (let i = 0; i < this.count; i++) {
      playerDiv.appendChild(this.createInput(i, prevPlayers[i] || '', `참가자 ${i + 1}`));
    }

    const defaultPenalties = this.getDefaultPenalties();
    for (let i = 0; i < this.count; i++) {
      penaltyDiv.appendChild(this.createInput(i, prevPenalties[i] || '', defaultPenalties[i] || `항목 ${i + 1}`));
    }
  },

  getDefaultPenalties() {
    // 1 winner, rest are "꽝"
    const arr = ['당첨!'];
    for (let i = 1; i < this.count; i++) arr.push('꽝');
    return arr;
  },

  createInput(index, value, placeholder) {
    const row = document.createElement('div');
    row.className = 'input-row';
    row.innerHTML = `
      <span class="input-row__num">${index + 1}.</span>
      <input type="text" value="${this.escapeHtml(value)}" placeholder="${placeholder}" maxlength="20">
    `;
    return row;
  },

  getValues(containerId) {
    const inputs = document.querySelectorAll(`#${containerId} input`);
    return Array.from(inputs).map(input => input.value.trim());
  },

  escapeHtml(str) {
    return str.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  },

  startGame() {
    // If sections are closed, use defaults. If open, read inputs.
    let filledPlayers, filledPenalties;

    if (this.openSections.names) {
      const players = this.getValues('player-inputs');
      filledPlayers = players.map((p, i) => p || `참가자 ${i + 1}`);
    } else {
      filledPlayers = [];
      for (let i = 0; i < this.count; i++) filledPlayers.push(`참가자 ${i + 1}`);
    }

    if (this.openSections.penalties) {
      const penalties = this.getValues('penalty-inputs');
      const defaults = this.getDefaultPenalties();
      filledPenalties = penalties.map((p, i) => p || defaults[i] || `항목 ${i + 1}`);
    } else {
      filledPenalties = this.getDefaultPenalties();
    }

    // Shuffle penalties so "당첨!" position is random
    filledPenalties = Utils.shuffle(filledPenalties);

    App.state.players = filledPlayers;
    App.state.penalties = filledPenalties;
    App.saveState();

    Utils.vibrate(30);

    const game = App.state.currentGame;
    if (game === 'roulette') App.navigate('screen-roulette');
    else if (game === 'ladder') App.navigate('screen-ladder');
    else if (game === 'lots') App.navigate('screen-lots');
  }
};
