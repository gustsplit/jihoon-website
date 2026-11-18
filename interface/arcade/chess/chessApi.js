// INTERFACE (arcade): the only bridge between the chess screen (frontend/arcade/chess/) and the chess
// engine + computer player (backend/arcade/chess/). Everything runs in the browser; no Stockfish server.
import { VariantChessEngine } from '../../../backend/arcade/chess/variantEngine.js';
import { VariantAI } from '../../../backend/arcade/chess/variantAI.js';
import { CHESS_SETTINGS } from '../../../backend/arcade/chess/chessSettings.js';

const copy = (v) => JSON.parse(JSON.stringify(v));
const ai = new VariantAI(1);
let engine = new VariantChessEngine(CHESS_SETTINGS.variant);
let levelId = CHESS_SETTINGS.defaultLevel;

function inCheck(color) {
  const king = engine.findKing(engine.board, color);
  return !!king && engine.isSquareAttacked(engine.board, king.r, king.c, color === 'w' ? 'b' : 'w');
}

function state() {
  return {
    board: copy(engine.board),
    turn: engine.getTurn(),
    gameOver: engine.gameOver,
    result: engine.gameResult ? copy(engine.gameResult) : null,
    lastMove: engine.lastMove ? copy(engine.lastMove) : null,
    inCheck: !engine.gameOver && inCheck(engine.getTurn()),
    moveCount: engine.moveHistory.length
  };
}

export const chessApi = {
  getSettings() { return copy(CHESS_SETTINGS); },
  getLevel() { return levelId; },
  setLevel(id) {
    if (CHESS_SETTINGS.levels.some((l) => l.id === id)) levelId = id;
    return levelId;
  },
  newGame() {
    engine = new VariantChessEngine(CHESS_SETTINGS.variant);
    return state();
  },
  getState: state,
  legalMovesFrom(r, c) {
    return engine.getLegalMoves(r, c).map((m) => ({ toR: m.toR, toC: m.toC, captured: m.captured || null }));
  },
  // Player move. Pawns that reach the end become a Queen. Returns the new state, or null if not allowed.
  move(fromR, fromC, toR, toC) {
    const res = engine.makeMove(fromR, fromC, toR, toC, 'q');
    return res ? state() : null;
  },
  // Computer move, run after a short pause so the screen can show "thinking" first.
  computerMove() {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (engine.gameOver) { resolve({ move: null, state: state() }); return; }
        const level = CHESS_SETTINGS.levels.find((l) => l.id === levelId) || CHESS_SETTINGS.levels[0];
        const m = ai.getBestMove(engine, level.depth);
        if (m) engine.makeMove(m.fromR, m.fromC, m.toR, m.toC, 'q');
        resolve({ move: m ? { fromR: m.fromR, fromC: m.fromC, toR: m.toR, toC: m.toC } : null, state: state() });
      }, 250);
    });
  },
  // Take back the player's last move and the computer's answer.
  undo() {
    engine.undoMove();
    if (engine.getTurn() !== CHESS_SETTINGS.playerColor) engine.undoMove();
    return state();
  }
};
