/* Shared site behavior: Apple-style loader dismissal + scroll reveal + year stamp. */
(function () {
  function hideLoader() {
    var l = document.getElementById("loader");
    if (l) setTimeout(function () { l.classList.add("done"); }, 550);
  }
  if (document.readyState === "complete") hideLoader();
  else window.addEventListener("load", hideLoader);

  // Scroll reveal
  var els = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && els.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.14 });
    els.forEach(function (el) { io.observe(el); });
  } else {
    els.forEach(function (el) { el.classList.add("in"); });
  }

  // Year stamp
  document.querySelectorAll("[data-year]").forEach(function (n) {
    n.textContent = new Date().getFullYear();
  });
})();
