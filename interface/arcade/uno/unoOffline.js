// INTERFACE (arcade): stand-in for Mini Roblox's UNO multiplayer client.
// The arcade runs on static GitHub Pages with no UNO server, so UNO is single-player against computer players.
// unoGame.js only calls this when it is in an online room, which never happens in the arcade.
export const unoClient = {
  info() { return Promise.reject(new Error('UNO online rooms are not available in the arcade')); },
  post() { return Promise.reject(new Error('UNO online rooms are not available in the arcade')); },
  events() { return null; }
};
