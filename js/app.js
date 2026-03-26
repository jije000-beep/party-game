/* ========== App - Router & State ========== */
const App = {
  state: {
    players: [],
    penalties: [],
    currentGame: null,
    results: [],
  },

  currentScreen: 'screen-home',

  navigate(screenId) {
    const current = document.getElementById(this.currentScreen);
    const next = document.getElementById(screenId);
    if (!current || !next || this.currentScreen === screenId) return;

    current.classList.remove('active');
    current.classList.add('exit');
    setTimeout(() => current.classList.remove('exit'), 350);

    next.classList.add('active');
    this.currentScreen = screenId;

    // Init game screens
    if (screenId === 'screen-roulette') Roulette.init();
    if (screenId === 'screen-ladder') Ladder.init();
    if (screenId === 'screen-lots') Lots.init();
  },

  selectGame(game) {
    this.state.currentGame = game;
    const titles = { roulette: '룰렛 설정', ladder: '사다리 설정', lots: '제비뽑기 설정' };
    document.getElementById('setup-title').textContent = titles[game] || '게임 설정';
    Setup.init();
    this.navigate('screen-setup');
  },

  showResult(results) {
    this.state.results = results;
    const list = document.getElementById('result-list');
    list.innerHTML = '';
    results.forEach((r, i) => {
      const item = document.createElement('div');
      item.className = 'result-item';
      item.style.animationDelay = i * 0.1 + 's';
      item.innerHTML = `
        <span class="result-item__player">${r.player}</span>
        <span class="result-item__penalty">${r.penalty}</span>
      `;
      list.appendChild(item);
    });
    this.navigate('screen-result');
    setTimeout(() => {
      Utils.playFanfare();
      Utils.confetti();
    }, 300);
  },

  replay() {
    const game = this.state.currentGame;
    if (game === 'roulette') this.navigate('screen-roulette');
    else if (game === 'ladder') this.navigate('screen-ladder');
    else if (game === 'lots') this.navigate('screen-lots');
  },

  resetAll() {
    this.state = { players: [], penalties: [], currentGame: null, results: [] };
    this.navigate('screen-home');
  },

  saveState() {
    try {
      sessionStorage.setItem('partyGameState', JSON.stringify(this.state));
    } catch (e) {}
  },

  loadState() {
    try {
      const saved = sessionStorage.getItem('partyGameState');
      if (saved) this.state = JSON.parse(saved);
    } catch (e) {}
  }
};
