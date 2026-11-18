// FRONT-END: draws a brick picture from plain HTML elements.
// Every stud is one solid color (the brick's color). Nothing is blended.
(function (global) {
  "use strict";

  function drawBrick(brick, size) {
    var art = document.createElement("div");
    art.className = "brick-art shape-" + brick.shape + (size ? " " + size : "");
    art.setAttribute("aria-hidden", "true");

    var studs = document.createElement("div");
    studs.className = "art-studs";
    for (var i = 0; i < brick.studs; i++) {
      var stud = document.createElement("span");
      stud.className = "art-stud " + brick.color;
      studs.appendChild(stud);
    }

    var body = document.createElement("div");
    body.className = "art-body " + brick.color;

    art.appendChild(studs);
    art.appendChild(body);
    return art;
  }

  global.BrickArt = { drawBrick: drawBrick };
})(window);
