// BACK-END (arcade): the player profile the arcade games use.
// The Mini Roblox hub has full accounts (login, passwords, Robux) in its own project; the arcade
// does not need them, so it uses one local guest player. No passwords or accounts live here.
const guest = {
  id: 'Jihoon',
  username: 'Jihoon',
  role: 'player',
  robux: 0,
  equipped: { skinColor: '#FFCF00', shirt: 'classic_tee', pants: 'blue_jeans', hat: 'none' }
};

export const auth = {
  currentUser: guest,
  saveUsers() { /* nothing to save in the arcade */ }
};
