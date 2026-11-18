// FRONT-END: game screen and animations only.
// The rule for a correct stack lives in the back-end; we ask it through the interface (SiteAPI).
(function () {
  "use strict";

  var api = window.SiteAPI;
  var stack = [];
  var busy = false;
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

  function setMessage(text) { msgEl.textContent = text; }

  function drawStack() {
    stackEl.innerHTML = "";
    stack.forEach(function (color) { stackEl.appendChild(stud(color)); });
  }

  function celebrate() {
    stackEl.classList.add("win");
    setMessage("You did it! Awesome stacking!");
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
    setMessage("Click a stud to start!");
    buildChoices(["red", "yellow", "blue", "green"]);
  }

  function pick(color) {
    if (busy) { return; }
    var next = stack.concat([color]);
    api.checkStack(next).then(function (result) {
      if (!result.ok) {
        busy = true;
        stackEl.classList.add("oops");
        setMessage("Oops! Try again. Start with red.");
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
      else { setMessage("Nice! What comes next?"); }
    });
  }

  function buildChoices(colors) {
    choicesEl.innerHTML = "";
    shuffle(colors).forEach(function (color) {
      var btn = stud(color, "button");
      btn.type = "button";
      btn.setAttribute("aria-label", color + " stud");
      btn.addEventListener("click", function () { pick(color); });
      choicesEl.appendChild(btn);
    });
  }

  api.loadStackOrder().then(function (order) {
    var hint = document.getElementById("order-hint");
    order.forEach(function (color) { hint.appendChild(stud(color)); });
    buildChoices(order);
  });

  document.getElementById("restart").addEventListener("click", reset);
  document.getElementById("year").textContent = new Date().getFullYear();
})();
