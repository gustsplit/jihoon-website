// INTERFACE: the only bridge between the front-end and the back-end.
// The front-end calls SiteAPI. It never touches SiteBackend directly.
(function (global) {
  "use strict";

  function loadSiteContent() {
    // Promise-based so the back-end can later move to a real server (fetch) without changing the front-end.
    return Promise.resolve(global.SiteBackend.getContent());
  }

  global.SiteAPI = { loadSiteContent: loadSiteContent };
})(window);
