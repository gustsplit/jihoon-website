// BACK-END: site data and data logic only. No HTML, no DOM, no styling.
// Kept minimal for now. Later this can become a real server or database.
(function (global) {
  "use strict";

  var COLORS = ["red", "yellow", "blue", "green"];

  var homeContent = {
    title: "Jihoon",
    welcome: "Welcome to my website! Grab a brick and build something awesome with me.",
    sections: [
      { id: "about", color: "red", heading: "About Me", text: "This is where I'll tell you what I love to build and play." },
      { id: "ideas", color: "green", heading: "Ideas", text: "Big plans, small bricks. New ideas will go here." }
    ],
    pages: [
      { id: "bricks", color: "blue", label: "My Favorite Bricks", href: "bricks.html" },
      { id: "game", color: "yellow", label: "Stud Stacking Game", href: "game.html" }
    ]
  };

  var favoriteBricks = {
    featured: {
      id: "brick-2x4", name: "2x4 Brick", color: "blue", shape: "brick", studs: 4,
      text: "This is my number one favorite! It has 8 bumps on top. It is big and strong, so it is great for building walls, towers, and houses."
    },
    others: [
      { id: "brick-2x2", name: "2x2 Brick", color: "red", shape: "brick", studs: 2,
        text: "A little square brick with 4 bumps. It fits almost anywhere." },
      { id: "plate-1x2", name: "1x2 Plate", color: "yellow", shape: "plate", studs: 2,
        text: "A flat, thin piece with 2 bumps. Stack three plates and they are as tall as one brick!" },
      { id: "round-1x1", name: "1x1 Round Brick", color: "green", shape: "round", studs: 1,
        text: "A tiny round piece with 1 bump. It makes great tree trunks and lamp posts." },
      { id: "slope-2x2", name: "2x2 Slope", color: "blue", shape: "slope", studs: 2,
        text: "One side goes down like a slide. Perfect for roofs!" }
    ]
  };

  function copy(value) { return JSON.parse(JSON.stringify(value)); }

  function getContent() { return copy(homeContent); }
  function getFavoriteBricks() { return copy(favoriteBricks); }
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
    getStackOrder: getStackOrder,
    checkStack: checkStack
  };
})(window);
