// INTERFACE (arcade): starts this game. Data from the back-end, game screen from the front-end.
import { GAME_INFO } from '../../../backend/arcade/pizza/gameInfo.js';
import { WorkAtPizzaGame } from '../../../frontend/arcade/pizza/workAtPizza.js';
import { launchGame } from '../shared/launchGame.js';

launchGame(WorkAtPizzaGame, GAME_INFO);
