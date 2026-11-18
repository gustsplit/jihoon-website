// FRONT-END (Arcade): draws the second departures board, "Arcade Departures", on the homepage.
// Same look and same markup classes as the main departures board in app.js; data comes through the interface (SiteAPI).
(function () {
  "use strict";

  function render(arcade) {
    var nav = document.createElement("nav");
    nav.className = "board arcade-board";
    nav.setAttribute("aria-labelledby", "arcade-board-title");

    var title = document.createElement("h2");
    title.id = "arcade-board-title";
    title.className = "board-title";
    title.textContent = arcade.board.title;
    nav.appendChild(title);

    var links = document.createElement("div");
    links.id = "arcade-links";
    links.className = "page-links";
    arcade.games.forEach(function (game) {
      var a = document.createElement("a");
      a.className = "page-link";
      a.href = game.href;

      var gate = document.createElement("span");
      gate.className = "gate " + game.color;
      gate.textContent = "Gate " + game.gate;
      var label = document.createElement("span");
      label.className = "flight";
      label.textContent = game.label;
      var status = document.createElement("span");
      status.className = "status";
      status.textContent = arcade.board.status;

      a.appendChild(gate);
      a.appendChild(label);
      a.appendChild(status);
      links.appendChild(a);
    });
    nav.appendChild(links);

    // Place it right after the main departures board.
    var mainBoard = document.querySelector("nav.board");
    if (mainBoard && mainBoard.parentNode) { mainBoard.parentNode.insertBefore(nav, mainBoard.nextSibling); }
    else { document.querySelector("main").appendChild(nav); }
  }

  if (window.SiteAPI && window.SiteAPI.loadArcade) { window.SiteAPI.loadArcade().then(render); }
})();
