// FRONT-END: game screen and animations only.
// The rule for a correct stack and the game words live in the back-end; we ask through the interface (SiteAPI).
(function () {
  "use strict";

  var api = window.SiteAPI;
  var stack = [];
  var busy = false;
  var text = { start: "Click a brick to start!", good: "Nice! What comes next?",
               oops: "Oops! Try again. Start with red.", win: "You built the tower! Ready for takeoff!" };
  var stackEl = document.getElementById("stack");
  var msgEl = document.getElementById("message");
  var choicesEl = document.getElementById("choices");
  var partyEl = document.getElementById("party");

  function stud(color, tag) {
    var el = document.createElement(tag || "span");
    el.className = "stud-piece " + color;
    return el;
  }

  function shuffle(list) {
    var a = list.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function setMessage(value) { msgEl.textContent = value; }

  function drawStack() {
    stackEl.innerHTML = "";
    stack.forEach(function (color) { stackEl.appendChild(stud(color)); });
  }

  // Tower cab on top of the finished stack: the glass room where the tower team watches the planes.
  function addTowerCab() {
    var cab = document.createElement("div");
    cab.className = "tower-cab";
    var svg = window.AirportArt.drawTower();
    svg.setAttribute("viewBox", "-2 -16 124 102"); // only the cab part of the tower
    cab.appendChild(svg);
    stackEl.appendChild(cab);
  }

  function celebrate() {
    stackEl.classList.add("win");
    addTowerCab();
    setMessage(text.win);

    var plane = document.createElement("div");
    plane.className = "win-plane";
    plane.appendChild(window.AirportArt.drawPlane({ body: "blue", wing: "yellow", tail: "red", windows: "yellow" }));
    partyEl.appendChild(plane);

    var colors = ["red", "yellow", "blue", "green"];
    for (var i = 0; i < 40; i++) {
      var bit = document.createElement("span");
      bit.className = "confetti " + colors[i % 4];
      bit.style.left = Math.random() * 100 + "%";
      bit.style.animationDelay = Math.random() * 0.6 + "s";
      partyEl.appendChild(bit);
    }
  }

  function reset() {
    stack = [];
    busy = false;
    stackEl.classList.remove("win", "oops");
    partyEl.innerHTML = "";
    drawStack();
    setMessage(text.start);
    buildChoices(["red", "yellow", "blue", "green"]);
  }

  function pick(color) {
    if (busy) { return; }
    var next = stack.concat([color]);
    api.checkStack(next).then(function (result) {
      if (!result.ok) {
        busy = true;
        stackEl.classList.add("oops");
        setMessage(text.oops);
        setTimeout(function () {
          stack = [];
          drawStack();
          stackEl.classList.remove("oops");
          busy = false;
        }, 700);
        return;
      }
      stack = next;
      drawStack();
      if (result.complete) { busy = true; celebrate(); }
      else { setMessage(text.good); }
    });
  }

  function buildChoices(colors) {
    choicesEl.innerHTML = "";
    shuffle(colors).forEach(function (color) {
      var btn = stud(color, "button");
      btn.type = "button";
      btn.setAttribute("aria-label", color + " brick");
      btn.addEventListener("click", function () { pick(color); });
      choicesEl.appendChild(btn);
    });
  }

  api.loadGameText().then(function (words) {
    text = words;
    document.title = words.title;
    document.getElementById("game-title").textContent = words.title;
    document.getElementById("game-intro").textContent = words.intro;
    setMessage(words.start);
  });

  api.loadStackOrder().then(function (order) {
    var hint = document.getElementById("order-hint");
    order.forEach(function (color) { hint.appendChild(stud(color)); });
    buildChoices(order);
  });

  document.getElementById("restart").addEventListener("click", reset);
  document.getElementById("year").textContent = new Date().getFullYear();
})();
