// FRONT-END: rendering and UI behavior only. Gets data through the interface (SiteAPI).
(function () {
  "use strict";

  function render(content) {
    document.title = content.title;
    document.getElementById("site-title").textContent = content.title;
    document.getElementById("site-welcome").textContent = content.welcome;

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

  document.getElementById("year").textContent = new Date().getFullYear();
  window.SiteAPI.loadSiteContent().then(render);
})();
