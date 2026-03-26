/* ========== Drawing Lots Game ========== */
const Lots = {
  cards: [],
  currentTurn: 0,
  players: [],
  penalties: [],

  init() {
    this.players = App.state.players;
    this.penalties = Utils.shuffle([...App.state.penalties]);
    this.currentTurn = 0;
    this.gameOver = false;
    this.cards = this.penalties.map((p, i) => ({
      id: i,
      content: p,
      flipped: false,
      claimedBy: null
    }));

    this.render();
    this.updateTurn();
  },

  // Card front color pairs [gradient-start, gradient-end]
  cardColors: [
    ['#FF6B6B', '#FF8E53'],
    ['#A78BFA', '#818CF8'],
    ['#38BDF8', '#22D3EE'],
    ['#FB923C', '#FBBF24'],
    ['#F472B6', '#E879F9'],
    ['#34D399', '#6EE7B7'],
    ['#60A5FA', '#93C5FD'],
    ['#F87171', '#FCA5A5'],
    ['#FBBF24', '#FDE68A'],
    ['#A3E635', '#86EFAC'],
  ],

  render() {
    const grid = document.getElementById('lots-grid');
    grid.innerHTML = '';

    const shuffledColors = Utils.shuffle([...this.cardColors]);

    this.cards.forEach((card, i) => {
      const el = document.createElement('div');
      el.className = 'lot-card deal-in';
      el.style.animationDelay = (i * 0.08) + 's';
      el.dataset.id = card.id;

      const [c1, c2] = shuffledColors[i % shuffledColors.length];

      const isWin = card.content === '당첨!';
      const backMod = isWin ? 'lot-card__back--win' : 'lot-card__back--lose';

      el.innerHTML = `
        <div class="lot-card__inner">
          <div class="lot-card__front" style="background: linear-gradient(145deg, ${c1}, ${c2})"></div>
          <div class="lot-card__back ${backMod}">
            <div class="card-result">${this.escapeHtml(card.content)}</div>
            <div class="card-player"></div>
          </div>
        </div>
      `;

      el.addEventListener('click', () => this.pickCard(card.id));
      grid.appendChild(el);
    });
  },

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  updateTurn() {
    const turnDiv = document.getElementById('lots-turn');
    const statusDiv = document.getElementById('lots-status');

    if (this.currentTurn >= this.players.length) {
      turnDiv.textContent = '모두 뽑았습니다!';
      statusDiv.textContent = '';
      return;
    }

    turnDiv.textContent = `${this.players[this.currentTurn]}님 차례!`;
    const remaining = this.cards.filter(c => !c.flipped).length;
    statusDiv.textContent = `남은 카드: ${remaining} / ${this.cards.length}`;
  },

  pickCard(id) {
    if (this.currentTurn >= this.players.length || this.gameOver) return;

    const card = this.cards.find(c => c.id === id);
    if (!card || card.flipped) return;

    // Flip the card
    card.flipped = true;
    card.claimedBy = this.players[this.currentTurn];

    const el = document.querySelector(`.lot-card[data-id="${id}"]`);
    if (el) {
      el.classList.add('flipped');
      const playerLabel = el.querySelector('.card-player');
      if (playerLabel) playerLabel.textContent = card.claimedBy;
    }

    Utils.vibrate(50);
    Utils.playReveal();

    // "당첨!" hit → stop immediately, show winner
    if (card.content === '당첨!') {
      this.gameOver = true;
      const turnDiv = document.getElementById('lots-turn');
      turnDiv.textContent = `${card.claimedBy}님 당첨!`;
      document.getElementById('lots-status').textContent = '';
      setTimeout(() => {
        App.showResult([{
          player: card.claimedBy,
          penalty: '당첨!'
        }]);
      }, 1000);
      return;
    }

    this.currentTurn++;
    this.updateTurn();

    // Check if all players have picked
    if (this.currentTurn >= this.players.length) {
      setTimeout(() => this.showResults(), 1200);
    }
  },

  showResults() {
    const results = this.cards
      .filter(c => c.claimedBy)
      .map(c => ({
        player: c.claimedBy,
        penalty: c.content
      }));
    App.showResult(results);
  }
};
