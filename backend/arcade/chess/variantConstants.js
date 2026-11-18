/**
 * Chess Variants Constants, Fairy Pieces & Variant Configurations
 */

// Amazon Piece SVG (Combination of Queen Crown and Knight Steed)
const AMAZON_SVG_WHITE = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><g fill="%23fff" stroke="%23000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 4-6-9-6 9-7-4 2 12z" fill="%23fff"/><path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 2-1 .5-2.5 0 0 0-1.5-1.5-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4"/><circle cx="6" cy="12" r="2" fill="%23f59e0b" stroke="%23000"/><circle cx="14" cy="6" r="2" fill="%23f59e0b" stroke="%23000"/><circle cx="22.5" cy="4" r="2.5" fill="%23ef4444" stroke="%23000"/><circle cx="31" cy="6" r="2" fill="%23f59e0b" stroke="%23000"/><circle cx="39" cy="12" r="2" fill="%23f59e0b" stroke="%23000"/><path d="M22.5 14v6m-3-3h6" stroke="%233b82f6" stroke-width="2"/><path d="M12 36c7 1 14 1 21 0" stroke="%23000" stroke-width="1.5"/></g></svg>`;

const AMAZON_SVG_BLACK = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><g fill="%231f2937" stroke="%23000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 4-6-9-6 9-7-4 2 12z" fill="%23111827"/><path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 2-1 .5-2.5 0 0 0-1.5-1.5-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4" fill="%23111827"/><circle cx="6" cy="12" r="2" fill="%23d97706" stroke="%23fff"/><circle cx="14" cy="6" r="2" fill="%23d97706" stroke="%23fff"/><circle cx="22.5" cy="4" r="2.5" fill="%23dc2626" stroke="%23fff"/><circle cx="31" cy="6" r="2" fill="%23d97706" stroke="%23fff"/><circle cx="39" cy="12" r="2" fill="%23d97706" stroke="%23fff"/><path d="M22.5 14v6m-3-3h6" stroke="%2360a5fa" stroke-width="2"/><path d="M12 36c7 1 14 1 21 0" stroke="%23fff" stroke-width="1.5"/></g></svg>`;

// Chancellor Piece SVG (Rook Turret + Knight Horse)
const CHANCELLOR_SVG_WHITE = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><g fill="%23fff" stroke="%23000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 39h27v-3H9v3zm3-3v-4h21v4H12zm1-5l2-8h15l2 8H13zm-2-9h23v-5h-4v2h-4v-2h-7v2h-4v-2h-4v5z" fill="%23fff"/><path d="M22 10l-3 4h6l-3-4z" fill="%233b82f6"/><circle cx="22.5" cy="8" r="3" fill="%23f59e0b" stroke="%23000"/></g></svg>`;
const CHANCELLOR_SVG_BLACK = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><g fill="%231f2937" stroke="%23000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 39h27v-3H9v3zm3-3v-4h21v4H12zm1-5l2-8h15l2 8H13zm-2-9h23v-5h-4v2h-4v-2h-7v2h-4v-2h-4v5z" fill="%23111827"/><path d="M22 10l-3 4h6l-3-4z" fill="%2360a5fa"/><circle cx="22.5" cy="8" r="3" fill="%23d97706" stroke="%23fff"/></g></svg>`;

// Archbishop Piece SVG (Bishop Mitre + Knight Mane)
const ARCHBISHOP_SVG_WHITE = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><g fill="%23fff" stroke="%23000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.35.54-2.32.47-3-.5 1.35-1.94 3-2 3-2zM15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z" fill="%23fff"/><circle cx="22.5" cy="8" r="2.5" fill="%2310b981" stroke="%23000"/><path d="M22.5 13v7m-3-4h6" stroke="%2310b981" stroke-width="1.8"/></g></svg>`;
const ARCHBISHOP_SVG_BLACK = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><g fill="%231f2937" stroke="%23000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.35.54-2.32.47-3-.5 1.35-1.94 3-2 3-2zM15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z" fill="%23111827"/><circle cx="22.5" cy="8" r="2.5" fill="%2334d399" stroke="%23fff"/><path d="M22.5 13v7m-3-4h6" stroke="%2334d399" stroke-width="1.8"/></g></svg>`;

// Duck Token SVG
const DUCK_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><g fill="%23facc15" stroke="%23854d0e" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="20" cy="27" rx="14" ry="10" fill="%23facc15"/><circle cx="29" cy="16" r="8" fill="%23facc15"/><path d="M35 17l7 2-7 3z" fill="%23ea580c"/><circle cx="31" cy="14" r="1.5" fill="%23000"/><path d="M12 25c3-4 8-4 12 0" stroke="%23ca8a04" stroke-width="2" fill="none"/></g></svg>`;

// Standard Wikimedia piece SVGs
export const PIECE_ASSETS = {
  wP: 'https://upload.wikimedia.org/wikipedia/commons/4/45/Chess_plt45.svg',
  wN: 'https://upload.wikimedia.org/wikipedia/commons/7/70/Chess_nlt45.svg',
  wB: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Chess_blt45.svg',
  wR: 'https://upload.wikimedia.org/wikipedia/commons/7/72/Chess_rlt45.svg',
  wQ: 'https://upload.wikimedia.org/wikipedia/commons/1/15/Chess_qlt45.svg',
  wK: 'https://upload.wikimedia.org/wikipedia/commons/4/42/Chess_klt45.svg',
  wA: AMAZON_SVG_WHITE,
  wC: CHANCELLOR_SVG_WHITE,
  wE: ARCHBISHOP_SVG_WHITE,
  bP: 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Chess_pdt45.svg',
  bN: 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Chess_ndt45.svg',
  bB: 'https://upload.wikimedia.org/wikipedia/commons/9/98/Chess_bdt45.svg',
  bR: 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Chess_rdt45.svg',
  bQ: 'https://upload.wikimedia.org/wikipedia/commons/4/47/Chess_qdt45.svg',
  bK: 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Chess_kdt45.svg',
  bA: AMAZON_SVG_BLACK,
  bC: CHANCELLOR_SVG_BLACK,
  bE: ARCHBISHOP_SVG_BLACK,
  duck: DUCK_SVG
};

// Piece Values for Variant Evaluation
export const VARIANT_PIECE_VALUES = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  c: 820,  // Chancellor: Rook + Knight
  e: 780,  // Archbishop: Bishop + Knight
  a: 1250, // Amazon: Queen + Knight synergy
  k: 20000
};

// Registered Variants Configuration
export const CHESS_VARIANTS = {
  standard: {
    id: 'standard',
    name: 'Standard 8×8',
    category: 'classic',
    icon: '♟️',
    cols: 8,
    rows: 8,
    description: 'Classical international chess rules with Stockfish NNUE engine.',
    isAtomic: false,
    hasAmazon: false,
    promotePieces: ['q', 'r', 'b', 'n'],
    defaultSetup: [
      ['bR','bN','bB','bQ','bK','bB','bN','bR'],
      ['bP','bP','bP','bP','bP','bP','bP','bP'],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      ['wP','wP','wP','wP','wP','wP','wP','wP'],
      ['wR','wN','wB','wQ','wK','wB','wN','wR']
    ]
  },

  atomicAmazon: {
    id: 'atomicAmazon',
    name: 'Nuke Amazon Chess',
    category: 'fairy',
    icon: '💥',
    cols: 8,
    rows: 8,
    description: 'Queens are replaced by the all-powerful AMAZON (Queen + Knight). Every capture triggers a tactical NUKE explosion vaporizing both pieces and all adjacent units!',
    isAtomic: true,
    hasAmazon: true,
    promotePieces: ['a', 'q', 'r', 'b', 'n'],
    defaultSetup: [
      ['bR','bN','bB','bA','bK','bB','bN','bR'],
      ['bP','bP','bP','bP','bP','bP','bP','bP'],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      ['wP','wP','wP','wP','wP','wP','wP','wP'],
      ['wR','wN','wB','wA','wK','wB','wN','wR']
    ]
  },

  atomicStandard: {
    id: 'atomicStandard',
    name: 'Atomic / Nuke Classic',
    category: 'fairy',
    icon: '☢️',
    cols: 8,
    rows: 8,
    description: 'Standard pieces, but every capture detonates a nuke blast destroying the capturer, the victim, and all non-pawn neighbors. Kings blown up = instant victory!',
    isAtomic: true,
    hasAmazon: false,
    promotePieces: ['q', 'r', 'b', 'n'],
    defaultSetup: [
      ['bR','bN','bB','bQ','bK','bB','bN','bR'],
      ['bP','bP','bP','bP','bP','bP','bP','bP'],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      ['wP','wP','wP','wP','wP','wP','wP','wP'],
      ['wR','wN','wB','wQ','wK','wB','wN','wR']
    ]
  },

  small5x5: {
    id: 'small5x5',
    name: 'Small 5×5 (Gardner)',
    category: 'small',
    icon: '🤏',
    cols: 5,
    rows: 5,
    description: 'Invented in 1962 by Martin Gardner. Immediate piece contact with pawn 1-step moves and hyper-intense tactics.',
    isAtomic: false,
    hasAmazon: false,
    pawnNoDouble: true,
    promotePieces: ['q', 'r', 'b', 'n'],
    defaultSetup: [
      ['bR','bN','bB','bQ','bK'],
      ['bP','bP','bP','bP','bP'],
      [null,null,null,null,null],
      ['wP','wP','wP','wP','wP'],
      ['wR','wN','wB','wQ','wK']
    ]
  },

  small6x6: {
    id: 'small6x6',
    name: 'Small 6×6 (Los Alamos)',
    category: 'small',
    icon: '⚡',
    cols: 6,
    rows: 6,
    description: 'The first computer chess variant in history (1956). Played without Bishops to test early AI; fast heavy piece skirmishes.',
    isAtomic: false,
    hasAmazon: false,
    promotePieces: ['q', 'r', 'n'],
    defaultSetup: [
      ['bR','bN','bQ','bK','bN','bR'],
      ['bP','bP','bP','bP','bP','bP'],
      [null,null,null,null,null,null],
      [null,null,null,null,null,null],
      ['wP','wP','wP','wP','wP','wP'],
      ['wR','wN','wQ','wK','wN','wR']
    ]
  },

  small4x5: {
    id: 'small4x5',
    name: 'Micro 4×5 (Silverman)',
    category: 'small',
    icon: '🔬',
    cols: 4,
    rows: 5,
    description: 'Micro tactical chess. Queens and Rooks fight in close quarters. 1 blunder means immediate checkmate.',
    isAtomic: false,
    hasAmazon: false,
    pawnNoDouble: true,
    promotePieces: ['q', 'r'],
    defaultSetup: [
      ['bR','bQ','bK','bR'],
      ['bP','bP','bP','bP'],
      [null,null,null,null],
      ['wP','wP','wP','wP'],
      ['wR','wQ','wK','wR']
    ]
  },

  long8x16: {
    id: 'long8x16',
    name: 'Longboard 8×16',
    category: 'long',
    icon: '📏',
    cols: 8,
    rows: 16,
    description: 'Massive elongated vertical battlefield (16 ranks). Pawns can surge up to 3 squares on their first move! Extended long-range artillery warfare.',
    isAtomic: false,
    hasAmazon: false,
    pawnTripleMove: true,
    promotePieces: ['q', 'r', 'b', 'n'],
    defaultSetup: (function() {
      const b = Array.from({ length: 16 }, () => Array(8).fill(null));
      b[0] = ['bR','bN','bB','bQ','bK','bB','bN','bR'];
      b[1] = ['bP','bP','bP','bP','bP','bP','bP','bP'];
      b[14] = ['wP','wP','wP','wP','wP','wP','wP','wP'];
      b[15] = ['wR','wN','wB','wQ','wK','wB','wN','wR'];
      return b;
    })()
  },

  long10x8: {
    id: 'long10x8',
    name: 'Capablanca 10×8',
    category: 'long',
    icon: '🏛️',
    cols: 10,
    rows: 8,
    description: 'Jose Raul Capablanca’s 10-column grand battlefield featuring standard backranks with extended flank space.',
    isAtomic: false,
    hasAmazon: false,
    promotePieces: ['q', 'r', 'b', 'n'],
    defaultSetup: [
      ['bR','bN','bB','bQ','bK','bB','bN','bR','bN','bR'],
      ['bP','bP','bP','bP','bP','bP','bP','bP','bP','bP'],
      [null,null,null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null,null,null],
      ['wP','wP','wP','wP','wP','wP','wP','wP','wP','wP'],
      ['wR','wN','wB','wQ','wK','wB','wN','wR','wN','wR']
    ]
  },

  diagonal: {
    id: 'diagonal',
    name: 'Diagonal Diamond Chess',
    category: 'diagonal',
    icon: '🔷',
    cols: 8,
    rows: 8,
    description: 'Rotated 45-degree diamond board alignment. Angles of attack shift dramatically across geometric diagonals.',
    isAtomic: false,
    hasAmazon: false,
    isDiagonalLayout: true,
    promotePieces: ['q', 'r', 'b', 'n'],
    defaultSetup: [
      ['bR','bN','bB','bQ','bK','bB','bN','bR'],
      ['bP','bP','bP','bP','bP','bP','bP','bP'],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      ['wP','wP','wP','wP','wP','wP','wP','wP'],
      ['wR','wN','wB','wQ','wK','wB','wN','wR']
    ]
  },

  duckChess: {
    id: 'duckChess',
    name: 'Duck Chess 🦆',
    category: 'fairy',
    icon: '🦆',
    cols: 8,
    rows: 8,
    description: 'After every move, place the Rubber Duck on an empty square. The duck acts as a solid immovable wall—no piece can capture it, jump over it (except Knights), or land on it!',
    isDuck: true,
    isAtomic: false,
    hasAmazon: false,
    promotePieces: ['q', 'r', 'b', 'n'],
    defaultSetup: [
      ['bR','bN','bB','bQ','bK','bB','bN','bR'],
      ['bP','bP','bP','bP','bP','bP','bP','bP'],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      ['wP','wP','wP','wP','wP','wP','wP','wP'],
      ['wR','wN','wB','wQ','wK','wB','wN','wR']
    ]
  },

  crazyhouse: {
    id: 'crazyhouse',
    name: 'Crazyhouse (Drop Chess)',
    category: 'fairy',
    icon: '🌀',
    cols: 8,
    rows: 8,
    description: 'Captured enemy pieces flip color and join your reserve pocket tray. On any turn, drop a pocket piece onto any legal empty square instead of moving!',
    isCrazyhouse: true,
    isAtomic: false,
    hasAmazon: false,
    promotePieces: ['q', 'r', 'b', 'n'],
    defaultSetup: [
      ['bR','bN','bB','bQ','bK','bB','bN','bR'],
      ['bP','bP','bP','bP','bP','bP','bP','bP'],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      ['wP','wP','wP','wP','wP','wP','wP','wP'],
      ['wR','wN','wB','wQ','wK','wB','wN','wR']
    ]
  },

  threeCheck: {
    id: 'threeCheck',
    name: 'Three-Check Chess',
    category: 'fairy',
    icon: '🎯',
    cols: 8,
    rows: 8,
    description: 'Deliver check to the enemy King 3 times to win immediately (+1, +2, +3)! Sacrifices to deliver check are common and deadly.',
    isThreeCheck: true,
    isAtomic: false,
    hasAmazon: false,
    promotePieces: ['q', 'r', 'b', 'n'],
    defaultSetup: [
      ['bR','bN','bB','bQ','bK','bB','bN','bR'],
      ['bP','bP','bP','bP','bP','bP','bP','bP'],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      ['wP','wP','wP','wP','wP','wP','wP','wP'],
      ['wR','wN','wB','wQ','wK','wB','wN','wR']
    ]
  },

  grandCapablanca: {
    id: 'grandCapablanca',
    name: 'Grand Capablanca (10×8)',
    category: 'fairy',
    icon: '🛡️',
    cols: 10,
    rows: 8,
    description: 'Features Capablanca’s official fairy pieces: the ARCHBISHOP (Bishop + Knight) on c1/h8 and the CHANCELLOR (Rook + Knight) on h1/c8.',
    hasChancellor: true,
    hasArchbishop: true,
    isAtomic: false,
    hasAmazon: false,
    promotePieces: ['q', 'c', 'e', 'r', 'b', 'n'],
    defaultSetup: [
      ['bR','bN','bE','bB','bQ','bK','bB','bC','bN','bR'],
      ['bP','bP','bP','bP','bP','bP','bP','bP','bP','bP'],
      [null,null,null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null,null,null],
      ['wP','wP','wP','wP','wP','wP','wP','wP','wP','wP'],
      ['wR','wN','wE','wB','wQ','wK','wB','wC','wN','wR']
    ]
  },

  fourPlayer: {
    id: 'fourPlayer',
    name: '4-Player Chess Arena (14×14 Cross)',
    category: 'multiplayer',
    icon: '⚔️',
    cols: 14,
    rows: 14,
    description: '14×14 Cross Battlefield with Red, Blue, Yellow, and Green armies! 4-turn clockwise rotation with King elimination.',
    isFourPlayer: true,
    isAtomic: false,
    hasAmazon: false
  }
};
