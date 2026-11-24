(function () {
  "use strict";
  var doc = document;

  // Sticky header border + floating WhatsApp button
  var header = doc.querySelector(".header");
  var waFloat = doc.querySelector(".wa-float");
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle("scrolled", y > 8);
    if (waFloat) waFloat.classList.toggle("show", y > 700);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Mobile menu
  var menuBtn = doc.querySelector(".menu-btn");
  if (menuBtn) {
    menuBtn.addEventListener("click", function () {
      var open = doc.body.classList.toggle("menu-open");
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
      menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    doc.querySelectorAll(".nav-links a").forEach(function (a) {
      a.addEventListener("click", function () {
        doc.body.classList.remove("menu-open");
        menuBtn.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Reveal on scroll
  var items = doc.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add("in"); });
  }

  // Project filters
  var filters = doc.querySelectorAll(".filter");
  var cards = doc.querySelectorAll(".work");
  filters.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var f = btn.getAttribute("data-filter");
      filters.forEach(function (b) { b.setAttribute("aria-pressed", b === btn ? "true" : "false"); });
      cards.forEach(function (c) {
        var show = f === "all" || c.getAttribute("data-cat") === f;
        c.classList.toggle("is-hidden", !show);
        if (show) c.classList.add("in");
      });
    });
  });

  // YouTube: load the player only when clicked (keeps the page fast)
  doc.querySelectorAll(".video[data-yt]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var id = btn.getAttribute("data-yt");
      var f = doc.createElement("iframe");
      f.src = "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&rel=0&playsinline=1";
      f.title = btn.getAttribute("aria-label") || "Video review";
      f.allow = "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen";
      f.allowFullscreen = true;
      btn.innerHTML = "";
      btn.appendChild(f);
      btn.style.cursor = "default";
    }, { once: true });
  });

  // Brief form -> WhatsApp
  var form = doc.getElementById("brief");
  if (form) {
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var v = function (n) { return (form.elements[n].value || "").trim(); };
      var name = v("name");
      if (!name) { form.elements.name.focus(); form.elements.name.style.borderColor = "#C2410C"; return; }
      var lines = [
        "Hi Iqbal, I'm " + name + ".",
        "I need: " + v("type"),
        "Budget: " + v("budget")
      ];
      if (v("site")) lines.push("Website: " + v("site"));
      if (v("msg")) lines.push("", v("msg"));
      var url = "https://wa.me/" + window.WA_NUMBER + "?text=" + encodeURIComponent(lines.join("\n"));
      if (window.va) { try { window.va("event", { name: "brief_submit" }); } catch (e) {} }
      window.open(url, "_blank", "noopener");
    });
  }
})();
