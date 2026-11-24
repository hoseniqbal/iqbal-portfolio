(function () {
  "use strict";
  var doc = document, win = window;
  var reduce = win.matchMedia && win.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = win.matchMedia && win.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* Headline: split into words for a staggered reveal */
  doc.querySelectorAll(".split").forEach(function (el) {
    var i = 0;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = doc.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(doc.createTextNode(part)); return; }
            var w = doc.createElement("span"); w.className = "w";
            var inner = doc.createElement("span"); inner.textContent = part; inner.style.setProperty("--i", i++);
            w.appendChild(inner); frag.appendChild(w);
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1) { walk(n); }
      });
    })(el);
    requestAnimationFrame(function () { setTimeout(function () { el.classList.add("in"); }, 60); });
  });

  /* Header, progress bar, floating WhatsApp, parallax */
  var header = doc.querySelector(".header");
  var bar = doc.querySelector(".progress");
  var waFloat = doc.querySelector(".wa-float");
  var par = doc.querySelectorAll("[data-speed]");
  var heroImg = doc.querySelector(".arch img");
  var ticking = false;
  function frame() {
    ticking = false;
    var y = win.scrollY, h = doc.documentElement.scrollHeight - win.innerHeight;
    header.classList.toggle("scrolled", y > 8);
    if (bar) bar.style.transform = "scaleX(" + (h > 0 ? y / h : 0) + ")";
    if (waFloat) waFloat.classList.toggle("show", y > 700);
    if (reduce) return;
    if (heroImg && y < 900) heroImg.style.transform = "translateX(-50%) translateY(" + y * 0.06 + "px)";
    par.forEach(function (el) {
      var r = el.getBoundingClientRect();
      var c = r.top + r.height / 2 - win.innerHeight / 2;
      el.style.translate = "0 " + (c * parseFloat(el.getAttribute("data-speed"))).toFixed(1) + "px";
    });
  }
  win.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
  frame();

  /* Mobile menu */
  var menuBtn = doc.querySelector(".menu-btn");
  if (menuBtn) {
    menuBtn.addEventListener("click", function () {
      var open = doc.body.classList.toggle("menu-open");
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
      menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    doc.querySelectorAll(".nav-links a").forEach(function (a) {
      a.addEventListener("click", function () { doc.body.classList.remove("menu-open"); menuBtn.setAttribute("aria-expanded", "false"); });
    });
  }

  /* Count up numbers */
  function countUp(el) {
    var end = parseFloat(el.getAttribute("data-count"));
    var dec = parseInt(el.getAttribute("data-dec") || "0", 10);
    if (isNaN(end) || reduce) return;
    var t0 = null, dur = 1400;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1), k = 1 - Math.pow(1 - p, 3);
      el.textContent = (end * k).toFixed(dec);
      if (p < 1) requestAnimationFrame(step); else el.textContent = end.toFixed(dec);
    }
    el.textContent = (0).toFixed(dec);
    requestAnimationFrame(step);
  }

  /* Reveal on scroll */
  var items = doc.querySelectorAll(".reveal, [data-count]");
  if ("IntersectionObserver" in win) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var t = en.target;
        if (t.classList.contains("reveal")) t.classList.add("in");
        if (t.hasAttribute("data-count")) countUp(t);
        io.unobserve(t);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    doc.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("in"); });
  }

  /* Project filters */
  var filters = doc.querySelectorAll(".filter");
  var cards = doc.querySelectorAll(".work");
  filters.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var f = btn.getAttribute("data-filter");
      filters.forEach(function (b) { b.setAttribute("aria-pressed", b === btn ? "true" : "false"); });
      var n = 0;
      cards.forEach(function (c) {
        var show = f === "all" || c.getAttribute("data-cat") === f;
        c.classList.toggle("is-hidden", !show);
        if (show) { c.classList.remove("in"); c.style.setProperty("--d", (n++ % 3) * 70 + "ms"); void c.offsetWidth; c.classList.add("in"); }
      });
    });
  });

  /* Card tilt + light follow (desktop only) */
  if (fine && !reduce) {
    cards.forEach(function (c) {
      c.addEventListener("pointermove", function (ev) {
        var r = c.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width, y = (ev.clientY - r.top) / r.height;
        c.style.transform = "perspective(900px) rotateX(" + ((0.5 - y) * 5).toFixed(2) + "deg) rotateY(" + ((x - 0.5) * 6).toFixed(2) + "deg) translateY(-4px)";
        c.style.setProperty("--mx", (x * 100).toFixed(1) + "%"); c.style.setProperty("--my", (y * 100).toFixed(1) + "%");
      });
      c.addEventListener("pointerleave", function () { c.style.transform = ""; });
    });
    doc.querySelectorAll(".magnetic").forEach(function (b) {
      b.addEventListener("pointermove", function (ev) {
        var r = b.getBoundingClientRect();
        b.style.transform = "translate(" + ((ev.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + "px," + ((ev.clientY - r.top - r.height / 2) * 0.25).toFixed(1) + "px)";
      });
      b.addEventListener("pointerleave", function () { b.style.transform = ""; });
    });
  }

  /* YouTube: load player only on click */
  doc.querySelectorAll(".video[data-yt]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var f = doc.createElement("iframe");
      f.src = "https://www.youtube-nocookie.com/embed/" + btn.getAttribute("data-yt") + "?autoplay=1&rel=0&playsinline=1";
      f.title = btn.getAttribute("aria-label") || "Video review";
      f.allow = "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen";
      f.allowFullscreen = true;
      btn.innerHTML = ""; btn.appendChild(f); btn.style.cursor = "default";
    }, { once: true });
  });

  /* Brief form to WhatsApp */
  var form = doc.getElementById("brief");
  if (form) {
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var v = function (n) { return (form.elements[n].value || "").trim(); };
      var name = v("name");
      if (!name) { form.elements.name.focus(); form.elements.name.style.borderColor = "#C2410C"; return; }
      var lines = ["Hi Iqbal, I'm " + name + ".", "I need: " + v("type"), "Budget: " + v("budget")];
      if (v("site")) lines.push("Website: " + v("site"));
      if (v("msg")) lines.push("", v("msg"));
      if (win.va) { try { win.va("event", { name: "brief_submit" }); } catch (e) {} }
      win.open("https://wa.me/" + win.WA_NUMBER + "?text=" + encodeURIComponent(lines.join("\n")), "_blank", "noopener");
    });
  }
})();
