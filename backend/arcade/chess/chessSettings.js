// BACK-END (arcade): chess settings data. The engine (variantEngine.js) and the computer player (variantAI.js)
// are copied unchanged from Mini Roblox and run fully in the browser, so no Stockfish server is needed.
export const CHESS_SETTINGS = {
  variant: 'standard',
  playerColor: 'w',
  levels: [
    { id: 'easy', label: 'Easy', depth: 1 },
    { id: 'medium', label: 'Medium', depth: 2 },
    { id: 'hard', label: 'Hard', depth: 3 }
  ],
  defaultLevel: 'easy',
  // Big, friendly piece symbols (one symbol per piece type)
  pieceSymbols: { K: '\u265A', Q: '\u265B', R: '\u265C', B: '\u265D', N: '\u265E', P: '\u265F' },
  pieceNames: { K: 'King', Q: 'Queen', R: 'Rook', B: 'Bishop', N: 'Knight', P: 'Pawn' }
};
