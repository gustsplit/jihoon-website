// BACK-END (arcade): shared game-modifier state the games read every frame.
// Same shape and default values as Mini Roblox's AdminState (admin cheats are not part of the arcade, so these stay off).
export const AdminState = {
  gravityMultiplier: 1.0,
  speedMultiplier: 1.0,
  godmode: false,
  flying: false,
  freezeFish: false,
  alwaysCustomerFish: false,
  autopilot: false,
  hasStools: false,
  spawnedItems: [],
  customStools: []
};
