// Builds the site into /dist from data/content.json.
// Vercel runs this on every push (see vercel.json). Locally: node tools/build.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "dist");
const C = JSON.parse(fs.readFileSync(path.join(ROOT, "data/content.json"), "utf8"));
const SITE = C.site_url.replace(/\/$/, "");
const WA = String(C.whatsapp).replace(/\D/g, "");
const TODAY = new Date().toISOString().slice(0, 10);
const V = Date.now().toString(36);

const e = (s = "") => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
const wa = (t) => `https://wa.me/${WA}?text=${encodeURIComponent(t)}`;
const host = (u) => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return u; } };
const S = C.stats;

const ARROW = '<svg class="ic" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 11L11 5M6 5h5v5"/></svg>';
const WA_ICON = '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.4-.5c.2-.2.2-.3.3-.5.1-.2.1-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.3-.6-.4zM12 21.8c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4C2.7 15.6 2.2 13.8 2.2 12 2.2 6.6 6.6 2.2 12 2.2c2.6 0 5.1 1 6.9 2.9 1.8 1.8 2.9 4.3 2.9 6.9 0 5.4-4.4 9.8-9.8 9.8zm8.4-18.2C18.2 1.3 15.2 0 12 0 5.4 0 0 5.4 0 12c0 2.1.6 4.2 1.6 6L0 24l6.2-1.6c1.8 1 3.8 1.5 5.8 1.5 6.6 0 12-5.4 12-12 0-3.2-1.2-6.2-3.6-8.3z"/></svg>';
const STAR = '<span class="stars" aria-hidden="true">★★★★★</span>';
const GH = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 0C3.6 0 0 3.6 0 8c0 3.5 2.3 6.5 5.5 7.6.4.1.5-.2.5-.4v-1.4c-2.2.5-2.7-1-2.7-1-.4-.9-.9-1.2-.9-1.2-.7-.5.1-.5.1-.5.8.1 1.2.8 1.2.8.7 1.2 1.9.9 2.3.7.1-.5.3-.9.5-1.1-1.8-.2-3.6-.9-3.6-4 0-.9.3-1.6.8-2.1-.1-.2-.4-1 .1-2.1 0 0 .7-.2 2.2.8.6-.2 1.3-.3 2-.3s1.4.1 2 .3c1.5-1 2.2-.8 2.2-.8.4 1.1.2 1.9.1 2.1.5.6.8 1.3.8 2.1 0 3.1-1.9 3.7-3.6 3.9.3.3.5.8.5 1.5v2.2c0 .2.1.5.6.4C13.7 14.5 16 11.5 16 8c0-4.4-3.6-8-8-8z"/></svg>';
const HELLO = "Hi Iqbal, I found your website and I'd like to talk about a project.";

const head = (eyebrow, title, sub, extra = "") => `
    <header class="sec-head reveal">
      <span class="eyebrow">${eyebrow}</span>
      <h2>${title}</h2>
      ${sub ? `<p>${sub}</p>` : ""}${extra}
    </header>`;

const workCards = C.featured.map((p, i) => `
      <a class="work reveal" style="--d:${(i % 3) * 80}ms" data-cat="${e(p.cat)}" href="${e(p.url)}" target="_blank" rel="noopener">
        <div class="work-shot"><div class="browser" aria-hidden="true"><i></i><i></i><i></i><em>${e(host(p.url))}</em></div>
          <img src="${e(p.image)}" alt="${e(p.name)} website by Iqbal Hossen" width="800" height="500" loading="lazy" decoding="async"></div>
        <div class="work-body">
          <div class="work-meta">${p.tags.map((t, j) => `<span class="tag${j ? " alt" : ""}">${e(t)}</span>`).join("")}</div>
          <h3>${e(p.name)}</h3>
          <p>${e(p.desc)}</p>
          <span class="visit">View live site <span class="mk">${e(p.market)}</span>${ARROW}</span>
        </div>
      </a>`).join("");

const TOTAL = C.index.reduce((n, c) => n + c.sites.length, 0);
const indexCols = C.index.map((c) => `<div class="index-col"><h4>${e(c.title)}</h4><ul>${c.sites.map((s) => `<li><a href="https://${e(s)}" target="_blank" rel="noopener nofollow">${e(s)}</a></li>`).join("")}</ul></div>`).join("");

const reviewCard = (r) => `<figure class="rcard"><div class="rtop">${STAR}<span>${e(r.project)}</span></div><blockquote>“${e(r.text)}”</blockquote><figcaption><span class="avatar" aria-hidden="true">${e(r.name[0])}</span><span><b>${e(r.name)}</b><small>${e(r.country)} · Fiverr</small></span></figcaption></figure>`;
const half = Math.ceil(C.reviews.length / 2);
const rowA = C.reviews.slice(0, half).map(reviewCard).join("");
const rowB = C.reviews.slice(half).map(reviewCard).join("");

const pricing = C.pricing.map((p, i) => `
      <div class="price${p.featured ? " featured" : ""} reveal" style="--d:${i * 80}ms">${p.featured ? '<span class="badge">Most popular</span>' : ""}
        <h3>${e(p.name)}</h3><p class="muted">${e(p.sub)}</p>
        <div class="amt"><small>from</small>$<span data-count="${e(p.price)}">${e(p.price)}</span></div><div class="eta">Delivery in ${e(p.eta)}</div>
        <ul>${p.items.map((x) => `<li>${e(x)}</li>`).join("")}</ul>
        <a class="btn ${p.featured ? "btn-light" : "btn-ghost"}" href="${wa(p.wa)}" target="_blank" rel="noopener">Get a quote ${ARROW}</a>
      </div>`).join("");

const FAQ = [
  ["Do you work with clients outside Bangladesh?", "Yes. Almost all of my clients are in Germany, Switzerland, the UK, the US and Australia. I'm used to working across time zones and I usually reply within an hour during my working day (GMT+6)."],
  ["How do payments work?", "You can hire me through Fiverr or Upwork, where your payment is protected until you approve the work. For direct projects I send a Payoneer payment request. Larger projects are split into milestones."],
  ["Do you use AI? Is the work AI generated?", "I use AI tools like Claude and ChatGPT to research, draft and speed up repetitive work, so you get faster delivery. Every page is still designed, built, tested on real devices and checked by me before it goes live."],
  ["Can you work on my existing Shopify or WordPress site?", "Yes. A lot of my work is improving existing stores and sites: new landing pages, redesigns, speed fixes, migrations and new features, without breaking what already works."],
  ["Can you build pages for the German or EU market?", "Yes. Most of my recent Shopify landing pages are for German and Swiss brands. I handle multiple languages, EUR or CHF pricing and legal pages like Impressum, Datenschutz and AGB (you provide the legal text)."],
  ["What happens after launch?", "Every project includes free support for small fixes after delivery. If you want ongoing help, I offer monthly care or hourly work for updates, new pages and maintenance."],
];

const OSS = [
  ["bot-traffic-shield", "Bot Traffic Shield", "Detects and blocks bad bots and fake traffic so your analytics and server stay clean."],
  ["comments-shield", "Comments Shield", "Stops comment spam on WordPress sites without annoying real visitors."],
  ["zenvy-shipping-progress-bar-for-woocommerce", "Zenvy Shipping Progress Bar", "A free shipping progress bar for WooCommerce that nudges customers to add more to the cart."],
  ["quick-search-replace", "Quick Search Replace", "Search and replace text across your WordPress database safely, from the dashboard."],
  ["easy-svg-upload", "Easy SVG Upload", "Upload SVG files to the media library, with sanitization for security."],
  ["simple-disable-xml-rpc", "Simple Disable XML-RPC", "One click hardening that closes a common WordPress attack surface."],
];

const TITLE = "Iqbal Hossen | Shopify, WordPress, GoHighLevel and AI Automation Developer";
const DESC = `Iqbal Hossen builds high converting Shopify landing pages, Shopify stores, WordPress websites, GoHighLevel funnels and AI automation for brands in Germany, the UK, the US and Australia. Rated ${S.rating} from ${S.reviews} reviews on Fiverr.`;

const ld = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Person", "@id": SITE + "/#person", name: "Iqbal Hossen", jobTitle: "Shopify, WordPress and GoHighLevel Developer", url: SITE + "/", image: SITE + "/assets/img/iqbal-avatar.webp",
      address: { "@type": "PostalAddress", addressCountry: "BD" },
      worksFor: { "@type": "Organization", name: "TechSkills Institute", url: "https://techskills.institute/" },
      knowsAbout: ["Shopify", "Shopify landing pages", "Replo", "PageFly", "GemPages", "WordPress", "Elementor", "WooCommerce", "GoHighLevel", "Wix", "HubSpot CMS", "Technical SEO", "Web performance", "AI automation", "AI agents", "AI chatbots", "Claude", "ChatGPT"],
      sameAs: [C.fiverr, C.upwork, C.github] },
    { "@type": "ProfessionalService", "@id": SITE + "/#service", name: "Iqbal Hossen Web Development", url: SITE + "/", image: SITE + "/assets/img/og.jpg", founder: { "@id": SITE + "/#person" },
      areaServed: "Worldwide", priceRange: "$$", telephone: "+" + WA,
      description: "Shopify landing pages, Shopify stores, WordPress websites and GoHighLevel automation for brands in Europe, the US and Australia.",
      hasOfferCatalog: { "@type": "OfferCatalog", name: "Web development services", itemListElement: C.pricing.map((p) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: p.name, description: p.sub }, priceSpecification: { "@type": "PriceSpecification", minPrice: Number(p.price), priceCurrency: "USD" } })) } },
    { "@type": "WebSite", "@id": SITE + "/#website", url: SITE + "/", name: "Iqbal Hossen", publisher: { "@id": SITE + "/#person" }, inLanguage: "en" },
    { "@type": "ProfilePage", "@id": SITE + "/#webpage", url: SITE + "/", name: TITLE, isPartOf: { "@id": SITE + "/#website" }, mainEntity: { "@id": SITE + "/#person" }, dateModified: TODAY },
    { "@type": "FAQPage", mainEntity: FAQ.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
  ],
};

const brands = ["PHOEBÉ", "TitanBoard®", "Homardo", "Nepimi Organics", "TAJATI®", "St. Clair London", "The Mint Museum", "TechSkills", "Broughton", "PrimeFlow", "Mplus Design", "Dr. Wuffy", "Happy Feedbag", "Just Peloponnes", "Blunsdon Abbey"];
const marquee = brands.map((n) => `<span>${e(n)}</span>`).join("");

const page = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${e(TITLE)}</title>
<meta name="description" content="${e(DESC)}">
<link rel="canonical" href="${SITE}/">
<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1">
<meta name="author" content="Iqbal Hossen">
<meta name="theme-color" content="#F5F3EE">
<meta property="og:type" content="profile">
<meta property="og:site_name" content="Iqbal Hossen">
<meta property="og:locale" content="en_US">
<meta property="og:title" content="${e(TITLE)}">
<meta property="og:description" content="${e(DESC)}">
<meta property="og:url" content="${SITE}/">
<meta property="og:image" content="${SITE}/assets/img/og.jpg">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Iqbal Hossen, Shopify and WordPress developer">
<meta property="profile:first_name" content="Iqbal"><meta property="profile:last_name" content="Hossen">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${e(TITLE)}">
<meta name="twitter:description" content="${e(DESC)}">
<meta name="twitter:image" content="${SITE}/assets/img/og.jpg">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter+Tight:wght@400;500;600;700&display=swap">
<link rel="preload" as="image" href="/assets/img/iqbal-cutout.webp" type="image/webp" fetchpriority="high">
<link rel="stylesheet" href="/assets/css/style.css?v=${V}">
<script type="application/ld+json">${JSON.stringify(ld)}</script>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<div class="progress" aria-hidden="true"></div>

<header class="header">
  <nav class="wrap nav" aria-label="Main">
    <a class="brand" href="/" aria-label="Iqbal Hossen, home"><span class="brand-mark" aria-hidden="true">i</span><span>Iqbal Hossen<small>Shopify · WordPress · GHL</small></span></a>
    <ul class="nav-links" id="nav-links">
      <li><a href="#work">Work</a></li><li><a href="#services">Services</a></li><li><a href="#ai">AI</a></li><li><a href="#pricing">Pricing</a></li><li><a href="#reviews">Reviews</a></li><li><a href="#about">About</a></li><li><a href="#faq">FAQ</a></li>
    </ul>
    <div class="nav-cta">
      <a class="btn btn-ghost btn-sm hide-m" href="${e(C.fiverr)}" target="_blank" rel="noopener">Fiverr profile</a>
      <a class="btn btn-wa btn-sm" href="${wa(HELLO)}" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">${WA_ICON}<span>WhatsApp me</span></a>
      <button class="menu-btn" aria-label="Open menu" aria-expanded="false" aria-controls="nav-links"><span></span></button>
    </div>
  </nav>
</header>

<main id="main">

<section class="hero">
  <div class="wrap hero-grid">
    <div class="hero-copy">
      ${C.available ? '<span class="status reveal"><span class="dot" aria-hidden="true"></span>Available for new projects · replies within 1 hour</span>' : ""}
      <h1 class="split">Websites that turn <span class="serif">ad clicks</span> into customers.</h1>
      <p class="lead reveal" style="--d:300ms">I'm Iqbal Hossen, a Shopify, WordPress and GoHighLevel developer. For ${e(S.years)} years I've built landing pages, stores and business websites for brands in Germany, Switzerland, the UK, the US and Australia. I use AI to work faster, and I check every detail by hand.</p>
      <div class="hero-actions reveal" style="--d:420ms">
        <a class="btn btn-primary magnetic" href="#contact">Start a project ${ARROW}</a>
        <a class="btn btn-ghost" href="#work">See my work</a>
      </div>
      <div class="proof reveal" style="--d:540ms">
        <div><strong><span data-count="${e(S.rating)}" data-dec="1">${e(S.rating)}</span> ${STAR}</strong><span>${e(S.reviews)} Fiverr reviews</span></div>
        <div><strong><span data-count="${parseInt(S.websites)}">${parseInt(S.websites)}</span>${/\+/.test(S.websites) ? "+" : ""}</strong><span>websites delivered</span></div>
        <div><strong><span data-count="${parseInt(S.countries)}">${parseInt(S.countries)}</span>${/\+/.test(S.countries) ? "+" : ""}</strong><span>client countries</span></div>
      </div>
    </div>
    <div class="hero-photo">
      <div class="arch"><img src="/assets/img/iqbal-cutout.webp" alt="Iqbal Hossen, web developer" width="754" height="876" fetchpriority="high"></div>
      <div class="float-card fc-1"><span class="stars" aria-hidden="true">★★★★★</span><b>“The communication was just great.”</b><small>evotec · Germany</small></div>
      <div class="float-card fc-2"><div class="row"><span class="dot" aria-hidden="true"></span><b>Fiverr Level 2</b></div><small>${e(S.five_star)} of ${e(S.reviews)} reviews are 5★</small></div>
    </div>
  </div>
</section>

<div class="marquee" aria-label="Brands I've built for">
  <p class="marquee-label">Brands I've built for</p>
  <div class="marquee-track"><div class="marquee-inner">${marquee}${marquee}</div></div>
</div>

<section class="section" id="work">
  <div class="wrap">${head("Selected work", 'Real sites, live today. <span class="serif">Click any of them.</span>', "Every project below is a live client website. Filter by type, or open the full list of " + TOTAL + " sites at the bottom.", `
      <div class="filters" role="group" aria-label="Filter projects">
        <button class="filter" data-filter="all" aria-pressed="true">All</button>
        <button class="filter" data-filter="landing" aria-pressed="false">Ad landing pages</button>
        <button class="filter" data-filter="store" aria-pressed="false">Shopify stores</button>
        <button class="filter" data-filter="wordpress" aria-pressed="false">WordPress</button>
        <button class="filter" data-filter="other" aria-pressed="false">Wix and HubSpot</button>
      </div>`)}
    <div class="work-grid m-carousel">${workCards}
    </div>
    <p class="swipe-hint">Swipe to see more →</p>
    <details class="index reveal">
      <summary><span>Full project list<small>${TOTAL} live websites across Shopify, WordPress, Wix and HubSpot</small></span><span class="plus" aria-hidden="true">+</span></summary>
      <div class="index-body">${indexCols}</div>
    </details>
  </div>
</section>

<section class="section dark" id="landing-pages">
  <div class="wrap">${head("Specialty", 'Shopify landing pages <span class="serif">built for paid traffic.</span>', "Most of my Shopify work is landing pages for Meta and Google ads. A store's home page isn't built to sell one product to a cold visitor. A landing page is.")}
    <div class="lp-grid">
      <div>
        <ul class="lp-list m-carousel">
          <li class="reveal"><span class="n">01</span><b>One message from ad to checkout</b><span>The headline, offer and visuals continue the ad, so visitors know they're in the right place.</span></li>
          <li class="reveal" style="--d:80ms"><span class="n">02</span><b>Offers that raise order value</b><span>Bundles, quantity breaks, subscriptions and free gifts, set up the way your theme and apps support them.</span></li>
          <li class="reveal" style="--d:160ms"><span class="n">03</span><b>Trust before the price</b><span>Reviews, guarantees, ingredients, comparisons and FAQs placed where buyers hesitate.</span></li>
          <li class="reveal" style="--d:240ms"><span class="n">04</span><b>Fast on mobile</b><span>Most ad traffic is on a phone. Every page is built mobile first and checked for speed.</span></li>
        </ul>
        <div class="platforms reveal"><span>Replo</span><span>PageFly</span><span>GemPages</span><span>Online Store 2.0</span><span>Liquid</span><span>Advertorials and listicles</span></div>
      </div>
      <div class="stack-shots" aria-hidden="true">
        <figure class="s1" data-speed="-0.06"><img src="/assets/work/titanboard.webp" alt="" width="800" height="500" loading="lazy"></figure>
        <figure class="s2" data-speed="0.05"><img src="/assets/work/homardo.webp" alt="" width="800" height="463" loading="lazy"></figure>
        <figure class="s3" data-speed="-0.03"><img src="/assets/work/justpeloponnes.webp" alt="" width="800" height="500" loading="lazy"></figure>
      </div>
    </div>
  </div>
</section>

<section class="section" id="services">
  <div class="wrap">${head("Services", 'One developer for your store, <span class="serif">site and funnels.</span>', "You don't need three freelancers. I handle the design, the build and the technical setup behind it.")}
    <div class="svc-grid m-carousel">
      <article class="svc reveal"><div class="ico"><svg viewBox="0 0 24 24" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4h2l2.4 11.2a1 1 0 0 0 1 .8h8.9a1 1 0 0 0 1-.8L20 8H6"/><circle cx="9" cy="20" r="1"/><circle cx="17" cy="20" r="1"/></svg></div>
        <h3>Shopify landing pages</h3><p>Product pages, advertorials and campaign pages designed to convert ad traffic, or a page you like rebuilt properly for your brand.</p><ul><li>Replo</li><li>PageFly</li><li>GemPages</li></ul></article>
      <article class="svc reveal" style="--d:80ms"><div class="ico"><svg viewBox="0 0 24 24" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9l1-5h14l1 5M4 9v11h16V9M4 9h16M9 20v-6h6v6"/></svg></div>
        <h3>Shopify store design</h3><p>New stores and redesigns, especially for skincare, beauty, supplement and wellness brands in the EU and US.</p><ul><li>OS 2.0 themes</li><li>Liquid</li><li>Subscriptions</li></ul></article>
      <article class="svc reveal" style="--d:160ms"><div class="ico"><svg viewBox="0 0 24 24" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3.5 9h17M3.5 15h17M12 3c2.5 2.6 3.7 5.6 3.7 9s-1.2 6.4-3.7 9c-2.5-2.6-3.7-5.6-3.7-9S9.5 5.6 12 3z"/></svg></div>
        <h3>WordPress websites</h3><p>Business websites, custom themes and plugins, WooCommerce, and Elementor or Gutenberg builds your team can edit.</p><ul><li>Elementor</li><li>Gutenberg</li><li>WooCommerce</li><li>PHP</li></ul></article>
      <article class="svc reveal"><div class="ico"><svg viewBox="0 0 24 24" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h5v5H4zM15 13h5v5h-5zM9 8.5h4a2 2 0 0 1 2 2v2.5"/><path d="M13 16H9"/></svg></div>
        <h3>GoHighLevel and automation</h3><p>Funnels, lead follow up workflows, AI booking agents and GHL connected to your Shopify store.</p><ul><li>Workflows</li><li>Conversation AI</li><li>Snapshots</li></ul></article>
      <article class="svc reveal" style="--d:80ms"><div class="ico"><svg viewBox="0 0 24 24" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4z"/><path d="M18 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/></svg></div>
        <h3>AI site to WordPress</h3><p>Built something in Lovable, Base44 or Replit? I turn it into a real WordPress or Shopify site you can host, edit and rank.</p><ul><li>Lovable</li><li>Base44</li><li>Replit</li></ul></article>
      <article class="svc reveal" style="--d:160ms"><div class="ico"><svg viewBox="0 0 24 24" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="7" rx="1.5"/><rect x="3" y="13" width="18" height="7" rx="1.5"/><path d="M7 7.5h.01M7 16.5h.01"/></svg></div>
        <h3>Hosting, speed and care</h3><p>Migrations, cPanel and WHM hosting, security clean ups, speed optimization and technical SEO, plus Wix and HubSpot sites.</p><ul><li>cPanel / WHM</li><li>Core Web Vitals</li><li>Wix</li><li>HubSpot</li></ul></article>
    </div>
  </div>
</section>


<section class="section ai-sec" id="ai">
  <div class="wrap">${head("AI powered", 'AI that does real work <span class="serif">for your business.</span>', "I use AI every day to build faster, and I build AI into my clients' stores, websites and funnels. Practical tools that save time and bring in leads, not gimmicks.")}
    <div class="ai-grid">
      <div class="ai-cards m-carousel">
        ${[
          ["M8 10h8M8 14h5M21 12c0 4.4-4 8-9 8-1.5 0-2.9-.3-4.1-.9L3 20l1.3-3.9C3.5 14.9 3 13.5 3 12c0-4.4 4-8 9-8s9 3.6 9 8z", "AI chat and booking agents", "Agents that answer questions, qualify leads and book calls around the clock, inside GoHighLevel or on your website."],
          ["M4 12h4l3-7 3 14 3-7h3", "AI automation workflows", "Follow ups, lead routing, CRM updates and reports that run on their own, connected through custom APIs."],
          ["M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4zM18 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z", "AI built sites, made real", "Lovable, Base44 or Replit prototypes rebuilt as fast, editable WordPress or Shopify sites that can rank and convert."],
          ["M4 5h16v14H4zM4 15l4-4 4 4 3-3 5 5", "AI product visuals", "Lifestyle shots, model photos and ad creatives generated from your real product, ready for landing pages and ads."],
          ["M8 8l-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14", "AI features in your site", "Smart product recommendations, AI generated descriptions, size advice and search, built into WordPress, WooCommerce or Shopify."],
          ["M12 6v6l4 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z", "Faster delivery for you", "AI handles research, first drafts and repetitive code, so you get your project sooner. I review and test every line by hand."],
        ].map(([d, t, x], i) => `<article class="ai-card reveal" style="--d:${(i % 2) * 80}ms"><span class="ico"><svg viewBox="0 0 24 24" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></svg></span><h3>${t}</h3><p>${x}</p></article>`).join("")}
      </div>
      <div class="ai-demo reveal" aria-label="Example of an AI assisted workflow">
        <div class="ai-bar"><i></i><i></i><i></i><span>my workflow</span></div>
        <div class="ai-body" id="ai-log" aria-live="off">
          <p class="ln"><span class="k">brief</span> Landing page for a collagen brand, German market, Meta ads</p>
          <p class="ln"><span class="k ai">ai</span> Research: 12 competitor pages, top objections, offer ideas</p>
          <p class="ln"><span class="k ai">ai</span> Draft: page structure, headline options, FAQ</p>
          <p class="ln"><span class="k me">iqbal</span> Pick the angle, design the sections, build in Shopify</p>
          <p class="ln"><span class="k ai">ai</span> Write alt text, check copy, generate product scenes</p>
          <p class="ln"><span class="k me">iqbal</span> Test on real phones, speed check, final review</p>
          <p class="ln done"><span class="k ok">live</span> Delivered in 2 days. Ready for ads.</p>
        </div>
        <div class="ai-tools"><span>Claude</span><span>ChatGPT</span><span>Higgsfield</span><span>Custom APIs</span><span>GHL Conversation AI</span></div>
      </div>
    </div>
  </div>
</section>

<section class="section tight" id="process">
  <div class="wrap">${head("How we'll work", 'Clear steps, <span class="serif">no surprises.</span>', "You always know what's happening, what it costs and when it will be ready.")}
    <ol class="process m-carousel">
      <li class="step reveal"><h3>Quick brief</h3><p>Send your store link or idea on WhatsApp, Fiverr or Upwork. A short message is enough to start.</p></li>
      <li class="step reveal" style="--d:100ms"><h3>Fixed quote and plan</h3><p>Within 24 hours you get a clear scope, price and delivery date before any work starts.</p></li>
      <li class="step reveal" style="--d:200ms"><h3>Build with updates</h3><p>I build on a draft theme or staging site, so your live store is never touched until you approve.</p></li>
      <li class="step reveal" style="--d:300ms"><h3>Launch and support</h3><p>We go live together. Small fixes after launch are included, and you get a simple handover.</p></li>
    </ol>
    <p class="swipe-hint">Swipe to see more →</p>
  </div>
</section>

<section class="section band" id="pricing">
  <div class="wrap">${head("Pricing", 'Honest starting prices. <span class="serif">Fixed quote before we start.</span>', "The final price depends on your scope. You always get a fixed quote first, with no hidden extras.")}
    <div class="price-grid m-carousel">${pricing}
    </div>
    <p class="swipe-hint">Swipe to see more →</p>
    <p class="price-note">Ongoing updates, fixes and maintenance: <strong>$${e(C.hourly_rate)} per hour</strong>. Also available on <a href="${e(C.fiverr)}" target="_blank" rel="noopener">Fiverr</a> and <a href="${e(C.upwork)}" target="_blank" rel="noopener">Upwork</a>.</p>
  </div>
</section>

<section class="section" id="reviews">
  <div class="wrap">${head("Client reviews", 'Don\'t take my word for it. <span class="serif">Hear it from clients.</span>', `Every review comes from a real, paid project on Fiverr. Watch two clients on video, or read what others wrote.`)}
    <div class="rating-bar reveal">
      <div class="rating-big"><strong data-count="${e(S.rating)}" data-dec="1">${e(S.rating)}</strong><div>${STAR}<small>${e(S.reviews)} reviews on Fiverr · ${e(S.five_star)} five star</small></div></div>
      <div class="rating-split"><div><b>5.0</b><span>Communication</span></div><div><b>5.0</b><span>Quality of delivery</span></div><div><b>4.9</b><span>Value for money</span></div></div>
    </div>
    <div class="videos m-carousel">
      <button class="video reveal" data-yt="g5_53jJT79w" aria-label="Play video review from Gisela Sanders Alcántara">
        <img src="https://i.ytimg.com/vi/g5_53jJT79w/oardefault.jpg" alt="Video review from Gisela Sanders Alcántara" loading="lazy" width="405" height="720" onerror="this.onerror=null;this.src='https://i.ytimg.com/vi/g5_53jJT79w/hqdefault.jpg'">
        <span class="play"><svg viewBox="0 0 24 24"><path d="M7 4l14 8-14 8z"/></svg></span>
        <span class="cap"><b>Gisela Sanders Alcántara</b><span>Author and speaker · giselasa.com</span></span>
      </button>
      <div class="video-quote reveal" style="--d:100ms">
        <span class="qmark serif" aria-hidden="true">“</span>
        <blockquote>I love working with Iqbal. He is so gentle with feedback, he is patient explaining unfamiliar processes and concepts, and he provides ideas that fit our goals.</blockquote>
        <p class="who"><b>Gisela Sanders Alcántara</b> · repeat client, United States</p>
        <div class="vq-stats"><div><b>${e(S.rating)}</b><span>average rating</span></div><div><b>${e(S.countries)}</b><span>countries</span></div><div><b>10+</b><span>repeat clients</span></div></div>
      </div>
      <button class="video reveal" style="--d:200ms" data-yt="YJRHXkw92yY" aria-label="Play video review from Michaela">
        <img src="https://i.ytimg.com/vi/YJRHXkw92yY/oardefault.jpg" alt="Video review from Michaela" loading="lazy" width="405" height="720" onerror="this.onerror=null;this.src='https://i.ytimg.com/vi/YJRHXkw92yY/hqdefault.jpg'">
        <span class="play"><svg viewBox="0 0 24 24"><path d="M7 4l14 8-14 8z"/></svg></span>
        <span class="cap"><b>Michaela</b><span>Video review</span></span>
      </button>
    </div>
  </div>
  <div class="review-wall" aria-label="Written reviews from Fiverr">
    <div class="rrow"><div class="rtrack">${rowA}${rowA}</div></div>
    <div class="rrow rev"><div class="rtrack">${rowB}${rowB}</div></div>
  </div>
  <div class="wrap"><div class="rv-mobile m-carousel" aria-label="Written reviews from Fiverr">${C.reviews.map(reviewCard).join("")}</div><p class="swipe-hint">Swipe for more reviews →</p></div>
  <div class="wrap rev-more">
    <a class="btn btn-ghost" href="${e(C.fiverr)}" target="_blank" rel="noopener">Read all ${e(S.reviews)} reviews on Fiverr ${ARROW}</a>
    <a class="btn btn-ghost" href="${e(C.upwork)}" target="_blank" rel="noopener">View Upwork profile ${ARROW}</a>
  </div>
</section>

<section class="section about" id="about">
  <div class="wrap about-grid">
    <figure class="about-photo reveal"><img src="/assets/img/iqbal-workspace.webp" alt="Iqbal Hossen working at his desk" width="780" height="1045" loading="lazy">
      <figcaption><span>Iqbal Hossen</span><span>Bangladesh · GMT+6</span></figcaption></figure>
    <div class="reveal">
      <span class="eyebrow">About me</span>
      <h2>Developer first, <span class="serif">with a marketer's eye.</span></h2>
      <p>I started my career in 2021 at Am2Am Software, writing HTML, CSS and JavaScript, then PHP, Vue and React. I even built mobile apps with React Native. Over four years there I moved into WordPress and Shopify, building custom themes, plugins and client sites every week.</p>
      <p>Today I work with e-commerce brands and agencies on the things that bring in revenue: landing pages for ads, stores that build trust, and automations that follow up on leads. I'm also a web developer at TechSkills Institute in Australia, and I help maintain open source WordPress plugins.</p>
      <p>I use AI tools like Claude and ChatGPT every day to research, draft and move faster. The judgement, design and final checks are always mine.</p>
      <ol class="timeline">
        <li><time>2025 to now</time><div><b>Web Developer (WordPress), TechSkills Institute</b><span>Australia. Pages, performance, SEO and hosting for the institute and its partners.</span></div></li>
        <li><time>2021 to 2025</time><div><b>Website Developer (WordPress and Shopify), Am2Am Software</b><span>Custom websites, themes, plugins, payment gateways and React Native apps.</span></div></li>
        <li><time>Ongoing</time><div><b>Freelance on Fiverr and Upwork</b><span>Fiverr Level 2 seller, rated ${e(S.rating)} from ${e(S.reviews)} reviews, clients in ${e(S.countries)} countries.</span></div></li>
      </ol>
    </div>
  </div>
  <div class="wrap toolbox">
    <h3 class="toolbox-title reveal">Tools I work with every day</h3>
    <div class="tool-grid m-carousel">
      ${[
        ["E-commerce", "M3 4h2l2.4 11.2a1 1 0 0 0 1 .8h8.9a1 1 0 0 0 1-.8L20 8H6", ["Shopify","Liquid","Replo","PageFly","GemPages","WooCommerce"]],
        ["CMS and funnels", "M4 5h16v14H4zM4 9h16M9 9v10", ["WordPress","Elementor","Gutenberg","Wix","HubSpot CMS","GoHighLevel"]],
        ["Code", "M8 8l-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14", ["HTML and CSS","JavaScript","PHP","React","React Native","Vue"]],
        ["AI", "M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4z", ["Claude","ChatGPT","Custom APIs","AI agents"]],
        ["Workflow", "M4 12h4l3-7 3 14 3-7h3", ["Figma","Adobe","cPanel / WHM","GitHub","Slack","Asana","Basecamp"]],
      ].map(([t, d, list], i) => `<div class="tool reveal" style="--d:${i * 70}ms"><div class="tool-head"><span class="ico"><svg viewBox="0 0 24 24" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></svg></span><b>${t}</b></div><div class="chips">${list.map((x) => `<span>${x}</span>`).join("")}</div></div>`).join("")}
    </div>
  </div>
</section>

<section class="section dark" id="open-source">
  <div class="wrap">${head("Open source", 'WordPress plugins <span class="serif">anyone can use.</span>', "Free plugins I build and maintain with the WordPress Satkhira Community. The code is public on GitHub.")}
    <div class="oss-grid m-carousel">${OSS.map(([r, n, d], i) => `<a class="oss reveal" style="--d:${(i % 3) * 80}ms" href="https://github.com/WordPress-Satkhira-Community/${r}" target="_blank" rel="noopener"><div class="top"><span>WordPress plugin</span>${GH}</div><h3>${n}</h3><p>${d}</p></a>`).join("")}</div>
  </div>
</section>

<section class="section" id="faq">
  <div class="wrap faq-wrap">${head("FAQ", 'Questions clients <span class="serif">usually ask.</span>', `Something else on your mind? Ask me on <a href="${wa("Hi Iqbal, I have a question.")}" target="_blank" rel="noopener">WhatsApp</a>.`)}
    <div class="faq-list reveal">${FAQ.map(([q, a]) => `<details><summary>${e(q)}</summary><p>${e(a)}</p></details>`).join("")}</div>
  </div>
</section>

<section class="section tight" id="contact">
  <div class="wrap">
    <div class="contact reveal">
      <div class="contact-copy">
        <span class="eyebrow">Let's work together</span>
        <h2>Have a project in mind? <span class="serif">Let's talk.</span></h2>
        <p class="lead">Tell me what you need and I'll reply with ideas and a fixed quote, usually within an hour during my working day.</p>
        <div class="contact-links">
          <a href="${wa(HELLO)}" target="_blank" rel="noopener"><b>WhatsApp</b><span>${e(C.whatsapp_display)} ↗</span></a>
          ${C.email ? `<a href="mailto:${e(C.email)}"><b>Email</b><span>${e(C.email)} ↗</span></a>` : ""}
          <a href="${e(C.fiverr)}" target="_blank" rel="noopener"><b>Fiverr</b><span>Level 2 · ${e(S.rating)}★ (${e(S.reviews)}) ↗</span></a>
          <a href="${e(C.upwork)}" target="_blank" rel="noopener"><b>Upwork</b><span>Hire with Upwork protection ↗</span></a>
          <a href="${e(C.github)}" target="_blank" rel="noopener"><b>GitHub</b><span>@hoseniqbal ↗</span></a>
        </div>
      </div>
      <form class="form" id="brief" novalidate>
        <h3>Quick project brief</h3>
        <p>Fill this in and WhatsApp opens with your message ready to send.</p>
        <div class="field-row">
          <div class="field"><label for="f-name">Your name</label><input id="f-name" name="name" autocomplete="name" required></div>
          <div class="field"><label for="f-site">Website (optional)</label><input id="f-site" name="site" placeholder="yourstore.com" inputmode="url"></div>
        </div>
        <div class="field-row">
          <div class="field"><label for="f-type">What do you need?</label><select id="f-type" name="type"><option>Shopify landing page</option><option>Shopify store</option><option>WordPress website</option><option>GoHighLevel automation</option><option>Fix or update my site</option><option>Something else</option></select></div>
          <div class="field"><label for="f-budget">Budget</label><select id="f-budget" name="budget"><option>Under $200</option><option>$200 to $500</option><option>$500 to $1,000</option><option>$1,000+</option><option>Not sure yet</option></select></div>
        </div>
        <div class="field"><label for="f-msg">Project details</label><textarea id="f-msg" name="msg" placeholder="What are you selling, who is it for, and when do you need it?"></textarea></div>
        <button class="btn btn-wa" type="submit">${WA_ICON} Send on WhatsApp</button>
        <small>No spam. Your details go straight to my WhatsApp.</small>
      </form>
    </div>
  </div>
</section>

</main>

<footer class="footer">
  <div class="wrap">
    <div class="footer-top">
      <a class="brand" href="/"><span class="brand-mark" aria-hidden="true">i</span><span>Iqbal Hossen<small>Shopify · WordPress · GHL developer</small></span></a>
      <nav aria-label="Footer"><a href="#work">Work</a><a href="#services">Services</a><a href="#pricing">Pricing</a><a href="#reviews">Reviews</a><a href="#about">About</a><a href="#contact">Contact</a></nav>
    </div>
    <div class="footer-bottom"><span>© ${new Date().getFullYear()} Iqbal Hossen. All rights reserved.</span><span>Screenshots show live client websites.</span></div>
  </div>
</footer>

<a class="wa-float" href="${wa(HELLO)}" target="_blank" rel="noopener" aria-label="Chat with Iqbal on WhatsApp">${WA_ICON}</a>
<script>window.WA_NUMBER="${WA}";</script>
<script src="/assets/js/main.js?v=${V}" defer></script>
<script defer src="/_vercel/insights/script.js"></script>
<script defer src="/_vercel/speed-insights/script.js"></script>
</body>
</html>
`;

// guard: no long dashes anywhere in the generated page
const bad = page.match(/[\u2013\u2014]/g);
if (bad) { console.error(`Found ${bad.length} long dash characters. Remove them from data/content.json.`); process.exit(1); }

// write dist
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
const copy = (rel) => { const src = path.join(ROOT, rel); if (fs.existsSync(src)) fs.cpSync(src, path.join(OUT, rel), { recursive: true }); };
["assets", "admin", "404.html", "favicon.svg", "favicon.ico", "favicon-32.png", "apple-touch-icon.png", "site.webmanifest", "llms.txt"].forEach(copy);
fs.writeFileSync(path.join(OUT, "index.html"), page);
fs.writeFileSync(path.join(OUT, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url><loc>${SITE}/</loc><lastmod>${TODAY}</lastmod><changefreq>monthly</changefreq><priority>1.0</priority>
    <image:image><image:loc>${SITE}/assets/img/iqbal-workspace.webp</image:loc></image:image>
${C.featured.map((p) => `    <image:image><image:loc>${SITE}${e(p.image)}</image:loc></image:image>`).join("\n")}
  </url>
</urlset>
`);
fs.writeFileSync(path.join(OUT, "robots.txt"), `User-agent: *\nAllow: /\nDisallow: /admin/\n\nSitemap: ${SITE}/sitemap.xml\n`);
console.log(`Built ${SITE} → dist (${C.featured.length} projects, ${C.reviews.length} reviews, ${TOTAL} sites in index)`);
