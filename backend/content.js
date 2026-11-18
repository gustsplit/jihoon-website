// BACK-END: site data and data logic only. No HTML, no DOM, no styling.
// Kept minimal for now. Later this can become a real server or database.
(function (global) {
  "use strict";

  var COLORS = ["red", "yellow", "blue", "green"];

  var homeContent = {
    title: "Jihoon",
    welcome: "Welcome to Jihoon's Airport! Buckle up and build with me.",
    guardian: { label: "Guardian Jet: F-16", text: "My F-16 jet flies over the airport and keeps everyone safe." },
    board: { title: "Departures", status: "Boarding" },
    sections: [
      { id: "about", color: "red", heading: "About Me", text: "I am a brick pilot! I love to build planes, towers, and runways." },
      { id: "ideas", color: "green", heading: "Ideas", text: "Next I want to build a big hangar and a new jet. Big plans, small bricks!" }
    ],
    pages: [
      { id: "bricks", color: "blue", label: "My Favorite Bricks", href: "bricks.html" },
      { id: "game", color: "yellow", label: "Tower Builder Game", href: "game.html" }
    ]
  };

  var favoriteBricks = {
    featured: {
      id: "brick-2x4", name: "2x4 Brick", color: "blue", shape: "brick", studs: 4,
      text: "This is my number one favorite! It has 8 bumps on top. It is big and strong.",
      airport: "I use it to build the runway and the hangar walls."
    },
    others: [
      { id: "brick-2x2", name: "2x2 Brick", color: "red", shape: "brick", studs: 2,
        text: "A little square brick with 4 bumps. It fits almost anywhere.",
        airport: "It makes the control tower tall, one floor at a time." },
      { id: "plate-1x2", name: "1x2 Plate", color: "yellow", shape: "plate", studs: 2,
        text: "A flat, thin piece with 2 bumps. Three plates are as tall as one brick!",
        airport: "It is great for plane wings." },
      { id: "round-1x1", name: "1x1 Round Brick", color: "green", shape: "round", studs: 1,
        text: "A tiny round piece with 1 bump.",
        airport: "It makes the little lights along the runway." },
      { id: "slope-2x2", name: "2x2 Slope", color: "blue", shape: "slope", studs: 2,
        text: "One side goes down like a slide.",
        airport: "It makes a pointy plane nose and tail." }
    ]
  };

  var gameText = {
    title: "Tower Builder Game",
    intro: "Build the control tower! Stack the bricks in this order: red, yellow, blue, green.",
    start: "Click a brick to start!",
    good: "Nice! What comes next?",
    oops: "Oops! Try again. Start with red.",
    win: "You built the tower! Ready for takeoff!"
  };

  function copy(value) { return JSON.parse(JSON.stringify(value)); }

  function getContent() { return copy(homeContent); }
  function getFavoriteBricks() { return copy(favoriteBricks); }
  function getGameText() { return copy(gameText); }
  function getStackOrder() { return COLORS.slice(); }

  // Game rule: is this stack (bottom to top) correct so far, and is it complete?
  function checkStack(stack) {
    for (var i = 0; i < stack.length; i++) {
      if (stack[i] !== COLORS[i]) { return { ok: false, complete: false }; }
    }
    return { ok: true, complete: stack.length === COLORS.length };
  }

  global.SiteBackend = {
    getContent: getContent,
    getFavoriteBricks: getFavoriteBricks,
    getGameText: getGameText,
    getStackOrder: getStackOrder,
    checkStack: checkStack
  };
})(window);

// BACK-END (added for the Arcade): data for the second board on the homepage, "Arcade Departures".
// Games copied from Mini Roblox; each one lives in frontend/arcade/<game>/, backend/arcade/<game>/, interface/arcade/<game>/.
(function (global) {
  "use strict";

  var arcadeContent = {
    board: { title: "Arcade Departures", status: "Play Now" },
    games: [
      { id: "chess", gate: "A1", color: "blue", label: "Chess", href: "arcade/chess/index.html" },
      { id: "uno", gate: "A2", color: "red", label: "UNO Card Battle", href: "arcade/uno/index.html" },
      { id: "pets", gate: "A3", color: "green", label: "Pet Simulator", href: "arcade/pets/index.html" },
      { id: "pizza", gate: "A4", color: "yellow", label: "Pizza Place", href: "arcade/pizza/index.html" }
    ]
  };

  global.SiteBackend.getArcade = function () { return JSON.parse(JSON.stringify(arcadeContent)); };
})(window);
