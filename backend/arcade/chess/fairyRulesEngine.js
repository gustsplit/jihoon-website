/**
 * Fairy Rules Engine: Duck Chess, Crazyhouse Drop Pockets, Three-Check, and Capablanca Pieces
 */

export class FairyRulesEngine {
  constructor() {
    this.duckPos = null; // { r, c } or null
    this.isDuckPhase = false; // Waiting for duck placement after piece move
    this.whitePocket = []; // Pieces White can drop
    this.blackPocket = []; // Pieces Black can drop
    this.whiteChecks = 0;
    this.blackChecks = 0;
  }

  reset() {
    this.duckPos = null;
    this.isDuckPhase = false;
    this.whitePocket = [];
    this.blackPocket = [];
    this.whiteChecks = 0;
    this.blackChecks = 0;
  }

  // ----------------------------------------------------
  // DUCK CHESS
  // ----------------------------------------------------
  isDuckSquare(r, c) {
    return this.duckPos && this.duckPos.r === r && this.duckPos.c === c;
  }

  placeDuck(board, r, c) {
    if (board[r][c] !== null) return false; // Must be empty
    this.duckPos = { r, c };
    this.isDuckPhase = false;
    return true;
  }

  getLegalDuckSquares(board) {
    const squares = [];
    for (let r = 0; r < board.length; r++) {
      for (let c = 0; c < board[0].length; c++) {
        if (board[r][c] === null && (!this.duckPos || this.duckPos.r !== r || this.duckPos.c !== c)) {
          squares.push({ r, c });
        }
      }
    }
    return squares;
  }

  // ----------------------------------------------------
  // CRAZYHOUSE POCKET DROPS
  // ----------------------------------------------------
  addCaptureToPocket(capturedPiece, capturingColor) {
    if (!capturedPiece) return;
    const type = capturedPiece[1].toLowerCase();
    if (type === 'k') return; // Cannot pocket kings

    const pocket = capturingColor === 'w' ? this.whitePocket : this.blackPocket;
    pocket.push(type);
  }

  getPocket(color) {
    return color === 'w' ? this.whitePocket : this.blackPocket;
  }

  getLegalDrops(board, color, pieceType) {
    const drops = [];
    const rows = board.length;
    const cols = board[0].length;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // Must be an empty square and not blocked by the duck
        if (board[r][c] === null && !this.isDuckSquare(r, c)) {
          // Pawns cannot be dropped on the 1st or back ranks
          if (pieceType === 'p' && (r === 0 || r === rows - 1)) {
            continue;
          }
          drops.push({ toR: r, toC: c, pieceType, isDrop: true });
        }
      }
    }
    return drops;
  }

  executeDrop(board, color, pieceType, toR, toC) {
    const pocket = color === 'w' ? this.whitePocket : this.blackPocket;
    const idx = pocket.indexOf(pieceType);
    if (idx === -1) return false;

    pocket.splice(idx, 1);
    board[toR][toC] = `${color}${pieceType.toUpperCase()}`;
    return true;
  }

  // ----------------------------------------------------
  // THREE-CHECK CHESS
  // ----------------------------------------------------
  recordCheck(checkedColor) {
    if (checkedColor === 'b') {
      this.whiteChecks++;
      return this.whiteChecks >= 3;
    } else {
      this.blackChecks++;
      return this.blackChecks >= 3;
    }
  }

  getCheckScores() {
    return { whiteChecks: this.whiteChecks, blackChecks: this.blackChecks };
  }
}

export const fairyRules = new FairyRulesEngine();
