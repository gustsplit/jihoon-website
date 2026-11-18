// INTERFACE (arcade): the glue that starts one Mini Roblox canvas game on its own page.
// Takes the game's data from the back-end (gameInfo) and the game class from the front-end,
// hands them to the shared game engine, and wires the "Back to Airport" buttons.
import { gameEngine } from '../../../frontend/arcade/shared/gameEngine.js';

export const AIRPORT_HOME = '../../index.html'; // relative to frontend/arcade/<game>/index.html

export function launchGame(GameClass, info) {
  gameEngine.loadGame(new GameClass(), info.title, info.instructionTitle, info.instructionText, info.specialLabel);

  // In Mini Roblox these buttons return to the hub; here they go back to Jihoon's airport homepage.
  ['leaveGameBtn', 'exitToHubBtn'].forEach((id) => {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener('click', () => { window.location.href = AIRPORT_HOME; });
  });
  return gameEngine;
}
