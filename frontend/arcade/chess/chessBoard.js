// FRONT-END (arcade): draws the chess board and handles clicks. Talks only to the interface (chessApi).
import { chessApi } from '../../../interface/arcade/chess/chessApi.js';

const settings = chessApi.getSettings();
const boardEl = document.getElementById('chess-board');
const statusEl = document.getElementById('chess-status');
const levelsEl = document.getElementById('chess-levels');
const undoBtn = document.getElementById('chess-undo');

let state = chessApi.newGame();
let picked = null;      // { r, c }
let targets = [];       // legal moves for the picked piece
let thinking = false;

function setStatus(text) { statusEl.textContent = text; }

function statusText() {
  if (state.gameOver && state.result) {
    if (state.result.winner === settings.playerColor) return 'Checkmate! You win! \uD83C\uDF89';
    if (state.result.winner === 'draw') return 'It\'s a draw (stalemate).';
    return 'Checkmate! The computer wins. Try again!';
  }
  if (thinking) return 'The computer is thinking...';
  if (state.inCheck) return state.turn === settings.playerColor ? 'Check! Protect your King!' : 'Check on the computer!';
  return state.turn === settings.playerColor ? 'Your turn!' : 'Computer\'s turn...';
}

function render() {
  boardEl.textContent = '';
  const kingInCheck = state.inCheck ? findKing(state.turn) : null;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const sq = document.createElement('button');
      sq.type = 'button';
      sq.className = 'sq ' + ((r + c) % 2 === 0 ? 'light' : 'dark');
      sq.dataset.r = r; sq.dataset.c = c;
      const lm = state.lastMove;
      if (lm && ((lm.from.r === r && lm.from.c === c) || (lm.to.r === r && lm.to.c === c))) sq.classList.add('last');
      if (picked && picked.r === r && picked.c === c) sq.classList.add('picked');
      if (kingInCheck && kingInCheck.r === r && kingInCheck.c === c) sq.classList.add('check');
      const t = targets.find((m) => m.toR === r && m.toC === c);
      if (t) sq.classList.add('target', ...(state.board[r][c] ? ['capture'] : []));
      const p = state.board[r][c];
      if (p) {
        const span = document.createElement('span');
        span.className = 'piece ' + p[0];
        span.textContent = settings.pieceSymbols[p[1].toUpperCase()] || '?';
        sq.appendChild(span);
        sq.setAttribute('aria-label', (p[0] === 'w' ? 'White ' : 'Black ') + (settings.pieceNames[p[1].toUpperCase()] || 'piece'));
      }
      boardEl.appendChild(sq);
    }
  }
  undoBtn.disabled = thinking || state.moveCount < 2;
  setStatus(statusText());
}

function findKing(color) {
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) if (state.board[r][c] === color + 'K') return { r, c };
  return null;
}

async function computerTurn() {
  thinking = true; render();
  const res = await chessApi.computerMove();
  state = res.state; thinking = false; render();
}

boardEl.addEventListener('click', (e) => {
  const sq = e.target.closest('.sq');
  if (!sq || thinking || state.gameOver || state.turn !== settings.playerColor) return;
  const r = Number(sq.dataset.r), c = Number(sq.dataset.c);
  if (picked && targets.some((m) => m.toR === r && m.toC === c)) {
    const next = chessApi.move(picked.r, picked.c, r, c);
    picked = null; targets = [];
    if (next) { state = next; render(); if (!state.gameOver) computerTurn(); return; }
  }
  const p = state.board[r][c];
  if (p && p[0] === settings.playerColor) { picked = { r, c }; targets = chessApi.legalMovesFrom(r, c); }
  else { picked = null; targets = []; }
  render();
});

settings.levels.forEach((lvl) => {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'chess-btn level' + (lvl.id === chessApi.getLevel() ? ' active' : '');
  b.textContent = lvl.label;
  b.addEventListener('click', () => {
    chessApi.setLevel(lvl.id);
    levelsEl.querySelectorAll('.level').forEach((x) => x.classList.toggle('active', x === b));
  });
  levelsEl.appendChild(b);
});

document.getElementById('chess-new').addEventListener('click', () => {
  if (thinking) return;
  state = chessApi.newGame(); picked = null; targets = []; render();
});
undoBtn.addEventListener('click', () => {
  if (thinking) return;
  state = chessApi.undo(); picked = null; targets = []; render();
});

render();
