/**
 * Universal Chess Variant Engine
 * Supports Small Chess (5x5, 6x6, 4x5), Long Chess (8x16, 10x8),
 * Atomic Nuke Physics, and Amazon Fairy Pieces (Queen + Knight).
 */

import { CHESS_VARIANTS, VARIANT_PIECE_VALUES } from './variantConstants.js';
import { nukePhysics } from './nukePhysics.js';
import { fairyRules } from './fairyRulesEngine.js';

export class VariantChessEngine {
  constructor(variantId = 'atomicAmazon') {
    this.variant = null;
    this.board = [];
    this.turn = 'w';
    this.moveHistory = [];
    this.gameOver = false;
    this.gameResult = null; // { winner: 'w'|'b'|'draw', reason: string }
    this.lastMove = null;
    this.explosionHistory = [];
    this.loadVariant(variantId);
  }

  loadVariant(variantId) {
    const config = CHESS_VARIANTS[variantId] || CHESS_VARIANTS.standard;
    this.variant = config;
    this.turn = 'w';
    this.moveHistory = [];
    this.explosionHistory = [];
    this.gameOver = false;
    this.gameResult = null;
    fairyRules.reset();
    this.lastMove = null;

    // Clone default board setup
    this.board = config.defaultSetup.map(row => [...row]);
    return this;
  }

  getRows() {
    return this.board.length;
  }

  getCols() {
    return this.board[0].length;
  }

  getPiece(r, c) {
    if (typeof r !== 'number' || typeof c !== 'number' || r < 0 || r >= this.getRows() || c < 0 || c >= this.getCols()) return null;
    return this.board[r][c];
  }

  getTurn() {
    return this.turn;
  }

  /**
   * Generates all legal moves for a piece at (r, c), or all legal moves for active player if r, c omitted
   */
  getLegalMoves(r, c) {
    if (this.gameOver) return [];
    if (r === undefined || c === undefined) {
      return this.getAllLegalMoves(this.turn);
    }
    const piece = this.getPiece(r, c);
    if (!piece || piece[0] !== this.turn) return [];

    const pseudoMoves = this.getPseudoMoves(r, c, piece);
    const legalMoves = [];

    for (const move of pseudoMoves) {
      if (this.isMoveSafe(r, c, move)) {
        legalMoves.push(move);
      }
    }

    return legalMoves;
  }

  /**
   * Generates all pseudo-legal moves without in-check/explosion filters
   */
  getPseudoMoves(r, c, piece) {
    const color = piece[0];
    const type = piece[1].toLowerCase();
    const rows = this.getRows();
    const cols = this.getCols();
    const moves = [];

    const addRay = (dr, dc) => {
      let nr = r + dr;
      let nc = c + dc;
      while (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
        if (fairyRules.isDuckSquare(nr, nc)) {
          break; // Duck blocks the line of sight!
        }
        const target = this.board[nr][nc];
        if (!target) {
          moves.push({ toR: nr, toC: nc, captured: null });
        } else {
          if (target[0] !== color) {
            moves.push({ toR: nr, toC: nc, captured: target });
          }
          break; // Ray blocked
        }
        nr += dr;
        nc += dc;
      }
    };

    const addJumps = (offsets) => {
      for (const [dr, dc] of offsets) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
          if (fairyRules.isDuckSquare(nr, nc)) continue; // Cannot land on the duck!
          const target = this.board[nr][nc];
          if (!target || target[0] !== color) {
            moves.push({ toR: nr, toC: nc, captured: target });
          }
        }
      }
    };

    switch (type) {
      // 1. Pawn Moves
      case 'p': {
        const dir = (color === 'w') ? -1 : 1;
        const startRank = (color === 'w') ? rows - 2 : 1;

        // Single push
        const oneR = r + dir;
        if (oneR >= 0 && oneR < rows && !this.board[oneR][c] && !fairyRules.isDuckSquare(oneR, c)) {
          const isPromo = (color === 'w' && oneR === 0) || (color === 'b' && oneR === rows - 1);
          moves.push({ toR: oneR, toC: c, captured: null, isPromotion: isPromo });

          // Double push (if allowed and not already moved)
          if (!this.variant.pawnNoDouble && r === startRank) {
            const twoR = r + (dir * 2);
            if (twoR >= 0 && twoR < rows && !this.board[twoR][c] && !fairyRules.isDuckSquare(twoR, c)) {
              moves.push({ toR: twoR, toC: c, captured: null, isDouble: true });

              // Triple push on Longboard (8x16)
              if (this.variant.pawnTripleMove) {
                const threeR = r + (dir * 3);
                if (threeR >= 0 && threeR < rows && !this.board[threeR][c] && !fairyRules.isDuckSquare(threeR, c)) {
                  moves.push({ toR: threeR, toC: c, captured: null });
                }
              }
            }
          }
        }

        // Diagonal Captures
        for (const dc of [-1, 1]) {
          const nr = r + dir;
          const nc = c + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
            if (fairyRules.isDuckSquare(nr, nc)) continue; // Cannot capture the duck
            const target = this.board[nr][nc];
            if (target && target[0] !== color) {
              const isPromo = (color === 'w' && nr === 0) || (color === 'b' && nr === rows - 1);
              moves.push({ toR: nr, toC: nc, captured: target, isPromotion: isPromo });
            }
          }
        }
        break;
      }

      // 2. Knight Jumps
      case 'n': {
        addJumps([
          [-2, -1], [-2, 1], [-1, -2], [-1, 2],
          [1, -2], [1, 2], [2, -1], [2, 1]
        ]);
        break;
      }

      // 3. Bishop Rays
      case 'b': {
        addRay(-1, -1); addRay(-1, 1);
        addRay(1, -1); addRay(1, 1);
        break;
      }

      // 4. Rook Rays
      case 'r': {
        addRay(-1, 0); addRay(1, 0);
        addRay(0, -1); addRay(0, 1);
        break;
      }

      // 5. Queen Rays (Orthogonal + Diagonal)
      case 'q': {
        addRay(-1, 0); addRay(1, 0); addRay(0, -1); addRay(0, 1);
        addRay(-1, -1); addRay(-1, 1); addRay(1, -1); addRay(1, 1);
        break;
      }

      // 6. THE AMAZON (Queen + Knight in one piece!)
      case 'a': {
        // Queen movement (all 8 orthogonal & diagonal directions)
        addRay(-1, 0); addRay(1, 0); addRay(0, -1); addRay(0, 1);
        addRay(-1, -1); addRay(-1, 1); addRay(1, -1); addRay(1, 1);
        // Knight movement (8 L-shaped jumps)
        addJumps([
          [-2, -1], [-2, 1], [-1, -2], [-1, 2],
          [1, -2], [1, 2], [2, -1], [2, 1]
        ]);
        break;
      }

      // 7. CHANCELLOR (Rook + Knight)
      case 'c': {
        addRay(-1, 0); addRay(1, 0); addRay(0, -1); addRay(0, 1);
        addJumps([
          [-2, -1], [-2, 1], [-1, -2], [-1, 2],
          [1, -2], [1, 2], [2, -1], [2, 1]
        ]);
        break;
      }

      // 8. ARCHBISHOP (Bishop + Knight)
      case 'e': {
        addRay(-1, -1); addRay(-1, 1); addRay(1, -1); addRay(1, 1);
        addJumps([
          [-2, -1], [-2, 1], [-1, -2], [-1, 2],
          [1, -2], [1, 2], [2, -1], [2, 1]
        ]);
        break;
      }

      // 9. King
      case 'k': {
        addJumps([
          [-1, -1], [-1, 0], [-1, 1],
          [0, -1],           [0, 1],
          [1, -1],  [1, 0],  [1, 1]
        ]);
        break;
      }
    }

    return moves;
  }

  /**
   * Validates if a move avoids self-explosion and check in Atomic/standard rules
   */
  isMoveSafe(fromR, fromC, move) {
    const isAtomic = !!this.variant.isAtomic;
    const movingPiece = this.board[fromR][fromC];
    const myColor = movingPiece[0];

    // In Atomic chess: A capture explodes the capturing piece and adjacent units.
    // The player's own King CANNOT be inside the blast radius!
    if (isAtomic && move.captured) {
      // Check if player's king is inside the 1-square radius of the capture square
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = move.toR + dr;
          const nc = move.toC + dc;
          if (nr >= 0 && nr < this.getRows() && nc >= 0 && nc < this.getCols()) {
            if (this.board[nr][nc] === `${myColor}K`) {
              return false; // Suicide explosion: illegal
            }
          }
        }
      }
      return true; // Valid explosion attack
    }

    // Standard non-atomic check safety verification
    const cloneBoard = this.board.map(r => [...r]);
    cloneBoard[fromR][fromC] = null;
    cloneBoard[move.toR][move.toC] = movingPiece;

    // Check if player's King is directly attacked
    const kingPos = this.findKing(cloneBoard, myColor);
    if (!kingPos) return true; // In Atomic, Kings can blow up
    return !this.isSquareAttacked(cloneBoard, kingPos.r, kingPos.c, (myColor === 'w' ? 'b' : 'w'));
  }

  findKing(board, color) {
    for (let r = 0; r < board.length; r++) {
      for (let c = 0; c < board[0].length; c++) {
        if (board[r][c] === `${color}K`) {
          return { r, c };
        }
      }
    }
    return null;
  }

  isSquareAttacked(board, targetR, targetC, byColor) {
    const rows = board.length;
    const cols = board[0].length;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const p = board[r][c];
        if (p && p[0] === byColor) {
          const pseudo = this.getPseudoMovesFromBoard(board, r, c, p);
          if (pseudo.some(m => m.toR === targetR && m.toC === targetC)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  getPseudoMovesFromBoard(board, r, c, piece) {
    const engineTemp = Object.assign(Object.create(Object.getPrototypeOf(this)), this);
    engineTemp.board = board;
    return engineTemp.getPseudoMoves(r, c, piece);
  }

  /**
   * Executes a move on the board
   */
  makeMove(fromR, fromC, toR, toC, promotionPiece = null) {
    if (this.gameOver) return null;

    const piece = this.board[fromR][fromC];
    if (!piece || piece[0] !== this.turn) return null;

    const legal = this.getLegalMoves(fromR, fromC);
    const valid = legal.find(m => m.toR === toR && m.toC === toC);
    if (!valid) return null;

    // Save history snapshot
    const snapshot = {
      board: this.board.map(r => [...r]),
      turn: this.turn,
      fromR, fromC, toR, toC,
      piece,
      captured: valid.captured,
      promotionPiece
    };
    this.moveHistory.push(snapshot);

    const isAtomic = !!this.variant.isAtomic;
    let explosionDetails = null;

    // Handle Promotion
    let finalPiece = piece;
    if (valid.isPromotion) {
      const promoType = (promotionPiece || (this.variant.hasAmazon ? 'a' : 'q')).toUpperCase();
      finalPiece = `${this.turn}${promoType}`;
    }

    // Execute Move
    this.board[fromR][fromC] = null;
    this.board[toR][toC] = finalPiece;
    this.lastMove = { from: { r: fromR, c: fromC }, to: { r: toR, c: toC } };

    // Trigger Nuke / Atomic Explosion if Capture
    if (isAtomic && valid.captured) {
      explosionDetails = nukePhysics.explode(this.board, toR, toC, finalPiece);
      this.explosionHistory.push(explosionDetails);

      if (explosionDetails.whiteKingDead || explosionDetails.blackKingDead) {
        this.gameOver = true;
        if (explosionDetails.whiteKingDead && explosionDetails.blackKingDead) {
          this.gameResult = { winner: 'draw', reason: 'Mutual annihilation in nuke explosion!' };
        } else if (explosionDetails.whiteKingDead) {
          this.gameResult = { winner: 'b', reason: 'White King obliterated in atomic blast!' };
        } else {
          this.gameResult = { winner: 'w', reason: 'Black King obliterated in atomic blast!' };
        }
        return { success: true, explosion: explosionDetails, gameOver: true, result: this.gameResult };
      }
    }

    // Crazyhouse: add captured piece to player's pocket tray
    if (this.variant.isCrazyhouse && valid.captured) {
      fairyRules.addCaptureToPocket(valid.captured, this.turn);
    }

    // Duck Chess: activate duck placement phase
    if (this.variant.isDuck) {
      fairyRules.isDuckPhase = true;
    }

    // Three-Check: check if check was delivered
    const nextTurn = (this.turn === 'w') ? 'b' : 'w';
    if (this.variant.isThreeCheck) {
      const oppKing = this.findKing(this.board, nextTurn);
      if (oppKing && this.isSquareAttacked(this.board, oppKing.r, oppKing.c, this.turn)) {
        const won = fairyRules.recordCheck(nextTurn);
        if (won) {
          this.gameOver = true;
          const winner = this.turn === 'w' ? 'White' : 'Black';
          this.gameResult = { winner: this.turn, reason: `Three-Check Victory! ${winner} delivered 3 checks!` };
          return { success: true, gameOver: true, result: this.gameResult, threeCheckWin: true };
        }
      }
    }

    this.turn = nextTurn;

    const nextMoves = this.getAllLegalMoves(this.turn);
    if (nextMoves.length === 0) {
      this.gameOver = true;
      const myKing = this.findKing(this.board, this.turn);
      const isCheck = myKing && this.isSquareAttacked(this.board, myKing.r, myKing.c, (this.turn === 'w' ? 'b' : 'w'));

      if (isCheck) {
        const winner = this.turn === 'w' ? 'Black' : 'White';
        this.gameResult = { winner: this.turn === 'w' ? 'b' : 'w', reason: `Checkmate! ${winner} wins.` };
      } else {
        this.gameResult = { winner: 'draw', reason: 'Stalemate reached.' };
      }
    }

    return {
      success: true,
      explosion: explosionDetails,
      gameOver: this.gameOver,
      result: this.gameResult
    };
  }

  makeDropMove(color, pieceType, toR, toC) {
    if (this.gameOver || this.turn !== color) return null;
    if (this.board[toR][toC] !== null || fairyRules.isDuckSquare(toR, toC)) return null;
    if (pieceType === 'p' && (toR === 0 || toR === this.getRows() - 1)) return null;

    const ok = fairyRules.executeDrop(this.board, color, pieceType, toR, toC);
    if (!ok) return null;

    this.lastMove = { from: { r: toR, c: toC }, to: { r: toR, c: toC }, isDrop: true };
    this.turn = (this.turn === 'w') ? 'b' : 'w';
    return { success: true, isDrop: true, gameOver: this.gameOver };
  }

  placeDuck(r, c) {
    if (!this.variant.isDuck || !fairyRules.isDuckPhase) return false;
    return fairyRules.placeDuck(this.board, r, c);
  }

  getAllLegalMoves(color) {
    const all = [];
    const rows = this.getRows();
    const cols = this.getCols();

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const p = this.board[r][c];
        if (p && p[0] === color) {
          const moves = this.getLegalMoves(r, c);
          moves.forEach(m => all.push({ fromR: r, fromC: c, ...m }));
        }
      }
    }
    return all;
  }

  undoMove() {
    if (this.moveHistory.length === 0) return null;
    const last = this.moveHistory.pop();
    this.board = last.board;
    this.turn = last.turn;
    this.gameOver = false;
    this.gameResult = null;
    this.lastMove = this.moveHistory.length > 0
      ? {
          from: { r: this.moveHistory[this.moveHistory.length - 1].fromR, c: this.moveHistory[this.moveHistory.length - 1].fromC },
          to: { r: this.moveHistory[this.moveHistory.length - 1].toR, c: this.moveHistory[this.moveHistory.length - 1].toC }
        }
      : null;
    return true;
  }
}
