// BACK-END: site data and data logic only. No HTML, no DOM, no styling.
// Kept minimal for now. Later this can become a real server or database.
(function (global) {
  "use strict";

  var content = {
    title: "Jihoon",
    welcome: "Welcome to my website! Grab a brick and build something awesome with me.",
    sections: [
      { id: "about", color: "red", heading: "About Me", text: "This is where I'll tell you what I love to build and play." },
      { id: "builds", color: "blue", heading: "My Builds", text: "Photos of my favorite creations are coming soon." },
      { id: "ideas", color: "green", heading: "Ideas", text: "Big plans, small bricks. New ideas will go here." }
    ]
  };

  function getContent() {
    // Return a copy so callers cannot change the stored data.
    return JSON.parse(JSON.stringify(content));
  }

  global.SiteBackend = { getContent: getContent };
})(window);
