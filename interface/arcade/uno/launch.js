// INTERFACE (arcade): starts this game. Data from the back-end, game screen from the front-end.
import { GAME_INFO } from '../../../backend/arcade/uno/gameInfo.js';
import { UnoGame } from '../../../frontend/arcade/uno/unoGame.js';
import { launchGame } from '../shared/launchGame.js';

launchGame(UnoGame, GAME_INFO);
