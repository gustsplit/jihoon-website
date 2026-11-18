// INTERFACE (arcade): starts this game. Data from the back-end, game screen from the front-end.
import { GAME_INFO } from '../../../backend/arcade/pets/gameInfo.js';
import { PetSimulatorGame } from '../../../frontend/arcade/pets/petSimulator.js';
import { launchGame } from '../shared/launchGame.js';

launchGame(PetSimulatorGame, GAME_INFO);
