// FRONT-END: homepage rendering and UI behavior only. Gets data through the interface (SiteAPI).
(function () {
  "use strict";

  var LIGHT_COLORS = ["yellow", "green"];

  function drawScene() {
    var art = window.AirportArt;
    document.getElementById("jet").appendChild(art.drawJet());
    document.getElementById("tower").appendChild(art.drawTower());
    document.getElementById("runway-plane").appendChild(art.drawPlane({ body: "red", wing: "blue", tail: "yellow", windows: "yellow" }));

    ["lights-top", "lights-bottom"].forEach(function (id) {
      var row = document.getElementById(id);
      for (var i = 0; i < 14; i++) {
        var light = document.createElement("span");
        light.className = "runway-light " + LIGHT_COLORS[i % 2];
        light.style.animationDelay = (i * 0.12) + "s";
        row.appendChild(light);
      }
    });
  }

  function render(content) {
    document.title = content.title;
    document.getElementById("site-title").textContent = content.title;
    document.getElementById("site-welcome").textContent = content.welcome;
    if (content.guardian) { document.getElementById("jet-tag").textContent = content.guardian.label; }

    var board = content.board || { title: "Departures", status: "Boarding" };
    document.getElementById("board-title").textContent = board.title;

    var links = document.getElementById("page-links");
    content.pages.forEach(function (page, i) {
      var a = document.createElement("a");
      a.className = "page-link";
      a.href = page.href;

      var gate = document.createElement("span");
      gate.className = "gate " + page.color;
      gate.textContent = "Gate " + (i + 1);
      var label = document.createElement("span");
      label.className = "flight";
      label.textContent = page.label;
      var status = document.createElement("span");
      status.className = "status";
      status.textContent = board.status;

      a.appendChild(gate);
      a.appendChild(label);
      a.appendChild(status);
      links.appendChild(a);
    });

    var cards = document.getElementById("cards");
    content.sections.forEach(function (section) {
      var card = document.createElement("article");
      card.className = "card " + section.color;
      card.id = section.id;
      var h2 = document.createElement("h2");
      h2.textContent = section.heading;
      var p = document.createElement("p");
      p.textContent = section.text;
      card.appendChild(h2);
      card.appendChild(p);
      card.addEventListener("click", function () {
        card.classList.add("pop");
        setTimeout(function () { card.classList.remove("pop"); }, 180);
      });
      cards.appendChild(card);
    });
  }

  drawScene();
  document.getElementById("year").textContent = new Date().getFullYear();
  window.SiteAPI.loadSiteContent().then(render);
})();
