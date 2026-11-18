// FRONT-END: draws brick-built airport pictures (planes, F-16 jet, control tower) as inline SVG.
// Colors come from CSS classes (red, yellow, blue, green). Shading is only white/black
// overlays or lighter/darker tones of the same color, so every piece and stud stays one color.
(function (global) {
  "use strict";

  var count = 0;
  var NS = "http://www.w3.org/2000/svg";

  function Painter() {
    count += 1;
    this.id = "brick-shade-" + count;
    this.out = [];
  }

  // One plastic piece: color fill, then a soft light/shadow overlay, then a dark outline.
  Painter.prototype.piece = function (tag, attrs, color, tone) {
    var cls = "pc " + color + (tone ? " tone-" + tone : "");
    this.out.push("<" + tag + " class='" + cls + "' " + attrs + "/>");
    this.out.push("<" + tag + " class='shade' fill='url(#" + this.id + ")' " + attrs + "/>");
    this.out.push("<" + tag + " class='edge' " + attrs + "/>");
    return this;
  };

  // A stud: one small rounded block, a single color, with a white shine on its top edge.
  Painter.prototype.stud = function (x, y, w, color) {
    var h = Math.round(w * 0.45);
    this.piece("rect", "x='" + x + "' y='" + y + "' width='" + w + "' height='" + h + "' rx='2'", color);
    this.out.push("<rect class='shine' x='" + (x + 2.5) + "' y='" + (y + 2) + "' width='" + (w * 0.35) + "' height='2' rx='1'/>");
    return this;
  };

  Painter.prototype.seam = function (x1, y1, x2, y2) {
    this.out.push("<line class='seam' x1='" + x1 + "' y1='" + y1 + "' x2='" + x2 + "' y2='" + y2 + "'/>");
    return this;
  };

  Painter.prototype.raw = function (markup) { this.out.push(markup); return this; };

  Painter.prototype.svg = function (viewBox, className) {
    var defs = "<defs><linearGradient id='" + this.id + "' x1='0' y1='0' x2='0' y2='1'>" +
      "<stop offset='0' stop-color='#fff' stop-opacity='0.42'/>" +
      "<stop offset='0.32' stop-color='#fff' stop-opacity='0'/>" +
      "<stop offset='0.62' stop-color='#000' stop-opacity='0'/>" +
      "<stop offset='1' stop-color='#000' stop-opacity='0.30'/>" +
      "</linearGradient></defs>";
    var wrap = document.createElement("div");
    wrap.innerHTML = "<svg xmlns='" + NS + "' class='art-svg " + className + "' viewBox='" + viewBox +
      "' aria-hidden='true' focusable='false'>" + defs + this.out.join("") + "</svg>";
    return wrap.firstChild;
  };

  // Brick airliner, side view, nose to the right.
  function drawPlane(opts) {
    var o = opts || {};
    var body = o.body || "red", wing = o.wing || "blue", tail = o.tail || "yellow", win = o.windows || "yellow";
    var p = new Painter();
    p.piece("polygon", "points='30,50 14,8 42,8 70,50'", tail);
    [84, 108, 132, 156].forEach(function (x) { p.stud(x, 34, 16, body); });
    p.piece("path", "d='M24 42 H200 Q246 44 254 64 Q246 82 200 84 H24 Q10 63 24 42 Z'", body);
    p.seam(76, 43, 76, 83).seam(126, 43, 126, 83).seam(176, 43, 176, 83);
    p.piece("path", "d='M212 51 Q236 52 244 61 H212 Z'", "blue", "lo");
    for (var x = 52; x <= 190; x += 18) {
      p.piece("rect", "x='" + x + "' y='54' width='10' height='10' rx='2'", win);
    }
    p.piece("polygon", "points='12,62 54,62 46,76 6,76'", tail);
    p.piece("polygon", "points='96,72 164,72 134,106 104,106'", wing);
    p.piece("rect", "x='118' y='94' width='34' height='13' rx='6'", tail);
    return p.svg("0 0 262 112", "plane-art");
  }

  // Brick F-16 fighter jet, side view, nose to the right:
  // single tail fin, cropped-delta wing, bubble canopy, intake under the belly, wingtip rails.
  function drawJet() {
    var p = new Painter();
    // far-side wing tip peeking above the body, with its rail
    p.piece("polygon", "points='112,62 172,62 124,36 108,36'", "blue", "lo");
    p.piece("rect", "x='102' y='30' width='34' height='6' rx='2'", "yellow");
    // single tail fin
    p.piece("polygon", "points='44,64 20,10 50,10 94,64'", "red");
    // engine nozzle
    p.piece("rect", "x='12' y='65' width='26' height='18' rx='3'", "blue", "lo");
    // studs along the spine
    [102, 128, 154].forEach(function (x) { p.stud(x, 52, 16, "blue"); });
    // fuselage with a pointed nose
    p.piece("path", "d='M34 62 L206 58 Q270 60 312 73 Q270 84 206 86 L34 86 Z'", "blue");
    p.seam(84, 61, 84, 86).seam(134, 60, 134, 86).seam(182, 59, 182, 86).seam(272, 64, 272, 81);
    // bubble canopy (a lighter shade of blue) with a white shine
    p.piece("path", "d='M194 60 Q210 34 244 40 Q264 47 270 64 Z'", "blue", "hi");
    p.raw("<path class='gleam' d='M206 54 Q218 41 240 44'/>");
    // air intake under the belly, with its dark mouth
    p.piece("path", "d='M162 86 L228 86 L236 108 L172 108 Z'", "yellow");
    p.raw("<ellipse class='mouth' cx='231' cy='97' rx='3.5' ry='9'/>");
    // horizontal tail
    p.piece("polygon", "points='76,82 36,82 24,104 50,104'", "red");
    // near-side cropped-delta wing
    p.piece("polygon", "points='98,80 192,80 122,126 96,126'", "blue");
    // wingtip rail and its missile
    p.piece("rect", "x='90' y='124' width='42' height='7' rx='2'", "yellow");
    p.piece("path", "d='M96 133 H146 L156 136.5 L146 140 H96 Z'", "green");
    p.piece("polygon", "points='96,133 88,129 88,144 96,140'", "red");
    return p.svg("0 0 320 150", "jet-art");
  }

  // Brick control tower: shaft of bricks, glass cab, roof plate, beacon stud.
  function drawTower() {
    var p = new Painter();
    p.stud(52, 4, 16, "green");
    p.piece("rect", "x='58' y='-14' width='4' height='18'", "red");
    p.piece("rect", "x='20' y='11' width='80' height='11' rx='2'", "red");
    p.piece("polygon", "points='12,22 108,22 98,74 22,74'", "blue");
    p.piece("polygon", "points='22,30 98,30 92,62 28,62'", "blue", "hi");
    p.seam(41, 30, 43, 62).seam(60, 30, 60, 62).seam(79, 30, 77, 62);
    p.piece("rect", "x='18' y='74' width='84' height='10' rx='2'", "yellow");
    var colors = ["yellow", "red", "yellow", "red", "yellow", "red"];
    colors.forEach(function (c, i) {
      var y = 84 + i * 24;
      p.piece("rect", "x='36' y='" + y + "' width='48' height='24' rx='2'", c);
      if (i % 2 === 1) { p.piece("rect", "x='53' y='" + (y + 7) + "' width='14' height='10' rx='2'", "blue", "lo"); }
    });
    p.piece("rect", "x='6' y='228' width='108' height='12' rx='2'", "green");
    p.stud(10, 221, 14, "green").stud(96, 221, 14, "green");
    return p.svg("-2 -16 124 258", "tower-art");
  }

  global.AirportArt = { drawPlane: drawPlane, drawJet: drawJet, drawTower: drawTower };
})(window);
