// INTERFACE: the only bridge between the front-end and the back-end.
// The front-end calls SiteAPI. It never touches SiteBackend directly.
// Promise-based so the back-end can later move to a real server (fetch) without changing the front-end.
(function (global) {
  "use strict";

  var backend = global.SiteBackend;

  global.SiteAPI = {
    loadSiteContent: function () { return Promise.resolve(backend.getContent()); },
    loadFavoriteBricks: function () { return Promise.resolve(backend.getFavoriteBricks()); },
    loadStackOrder: function () { return Promise.resolve(backend.getStackOrder()); },
    checkStack: function (stack) { return Promise.resolve(backend.checkStack(stack.slice())); }
  };
})(window);
