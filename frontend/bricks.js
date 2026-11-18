// FRONT-END: Favorite Bricks page rendering only. Gets data through the interface (SiteAPI).
(function () {
  "use strict";

  function makeCard(brick, featured) {
    var card = document.createElement("article");
    card.className = "brick-card" + (featured ? " is-featured" : "");
    card.id = brick.id;

    if (featured) {
      var badge = document.createElement("p");
      badge.className = "badge";
      badge.textContent = "Number 1 Favorite!";
      card.appendChild(badge);
    }

    card.appendChild(window.BrickArt.drawBrick(brick, featured ? "big" : ""));

    var h3 = document.createElement("h3");
    h3.textContent = brick.name;
    var p = document.createElement("p");
    p.textContent = brick.text;
    card.appendChild(h3);
    card.appendChild(p);
    return card;
  }

  function render(data) {
    document.getElementById("featured").appendChild(makeCard(data.featured, true));
    var others = document.getElementById("others");
    data.others.forEach(function (brick) { others.appendChild(makeCard(brick, false)); });
  }

  document.getElementById("year").textContent = new Date().getFullYear();
  window.SiteAPI.loadFavoriteBricks().then(render);
})();
