/**
 * Universal Variant AI Engine (Alpha-Beta Minimax)
 * Calibrated for any board dimensions, Atomic Nuke tactics, and Amazon pieces.
 */

import { VARIANT_PIECE_VALUES } from './variantConstants.js';

export class VariantAI {
  constructor(depth = 3) {
    this.defaultDepth = depth;
  }

  getBestMove(engine, depth = null) {
    const searchDepth = depth || this.defaultDepth;
    const color = engine.getTurn();
    const isMaximizing = (color === 'w');
    const legalMoves = engine.getAllLegalMoves(color);

    if (legalMoves.length === 0) return null;

    // Prioritize direct King-kill explosions in Atomic mode (instant win)
    if (engine.variant.isAtomic) {
      for (const m of legalMoves) {
        if (m.captured) {
          // Check if opponent King is in blast radius
          const blastRadius = 1;
          const oppKing = engine.findKing(engine.board, (color === 'w' ? 'b' : 'w'));
          if (oppKing) {
            const distR = Math.abs(m.toR - oppKing.r);
            const distC = Math.abs(m.toC - oppKing.c);
            if (distR <= blastRadius && distC <= blastRadius) {
              return m; // Instant win nuke strike!
            }
          }
        }
      }
    }

    // Sort moves: captures and high-value pieces first (MVV-LVA)
    legalMoves.sort((a, b) => {
      const valA = a.captured ? (VARIANT_PIECE_VALUES[a.captured[1].toLowerCase()] || 0) : 0;
      const valB = b.captured ? (VARIANT_PIECE_VALUES[b.captured[1].toLowerCase()] || 0) : 0;
      return valB - valA;
    });

    let bestMove = legalMoves[0];
    let bestScore = isMaximizing ? -Infinity : Infinity;
    let alpha = -Infinity;
    let beta = Infinity;

    for (const move of legalMoves) {
      const clone = this.cloneEngine(engine);
      const res = clone.makeMove(move.fromR, move.fromC, move.toR, move.toC, (clone.variant.hasAmazon ? 'a' : 'q'));

      let score = 0;
      if (res && res.gameOver) {
        if (res.result && res.result.winner === color) {
          return move; // Winning terminal move
        } else if (res.result && res.result.winner === 'draw') {
          score = 0;
        } else {
          score = isMaximizing ? -15000 : 15000;
        }
      } else {
        score = this.minimax(clone, searchDepth - 1, alpha, beta, !isMaximizing);
      }

      if (isMaximizing) {
        if (score > bestScore) {
          bestScore = score;
          bestMove = move;
        }
        alpha = Math.max(alpha, bestScore);
      } else {
        if (score < bestScore) {
          bestScore = score;
          bestMove = move;
        }
        beta = Math.min(beta, bestScore);
      }

      if (beta <= alpha) break; // Alpha-beta cutoff
    }

    return bestMove;
  }

  minimax(engine, depth, alpha, beta, isMaximizing) {
    if (depth <= 0 || engine.gameOver) {
      return this.evaluateBoard(engine);
    }

    const color = isMaximizing ? 'w' : 'b';
    const moves = engine.getAllLegalMoves(color);

    if (moves.length === 0) {
      return this.evaluateBoard(engine);
    }

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const m of moves) {
        const clone = this.cloneEngine(engine);
        clone.makeMove(m.fromR, m.fromC, m.toR, m.toC, (clone.variant.hasAmazon ? 'a' : 'q'));
        const ev = this.minimax(clone, depth - 1, alpha, beta, false);
        maxEval = Math.max(maxEval, ev);
        alpha = Math.max(alpha, ev);
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const m of moves) {
        const clone = this.cloneEngine(engine);
        clone.makeMove(m.fromR, m.fromC, m.toR, m.toC, (clone.variant.hasAmazon ? 'a' : 'q'));
        const ev = this.minimax(clone, depth - 1, alpha, beta, true);
        minEval = Math.min(minEval, ev);
        beta = Math.min(beta, ev);
        if (beta <= alpha) break;
      }
      return minEval;
    }
  }

  evaluateBoard(engine) {
    if (engine.gameOver && engine.gameResult) {
      if (engine.gameResult.winner === 'w') return 20000;
      if (engine.gameResult.winner === 'b') return -20000;
      return 0;
    }

    let score = 0;
    const rows = engine.getRows();
    const cols = engine.getCols();
    const centerR = rows / 2;
    const centerC = cols / 2;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const p = engine.board[r][c];
        if (!p) continue;

        const color = p[0];
        const type = p[1].toLowerCase();
        let val = VARIANT_PIECE_VALUES[type] || 0;

        // Positional bonus: Center proximity
        const distCenter = Math.abs(r - centerR) + Math.abs(c - centerC);
        const centerBonus = Math.max(0, 15 - distCenter * 2);

        // Pawn advance bonus
        let advanceBonus = 0;
        if (type === 'p') {
          advanceBonus = (color === 'w') ? (rows - 1 - r) * 12 : r * 12;
        }

        const totalPieceScore = val + centerBonus + advanceBonus;
        score += (color === 'w') ? totalPieceScore : -totalPieceScore;
      }
    }

    return score;
  }

  cloneEngine(engine) {
    const clone = Object.assign(Object.create(Object.getPrototypeOf(engine)), engine);
    clone.board = engine.board.map(r => [...r]);
    clone.moveHistory = [...engine.moveHistory];
    clone.explosionHistory = [...engine.explosionHistory];
    return clone;
  }
}

export const variantAI = new VariantAI();
