#!/usr/bin/env python3
"""Builds index.html, sitemap.xml and robots.txt from data/content.json.

Edit data/content.json (projects, links, WhatsApp, domain), then run:
    python3 tools/build.py
and commit. Vercel redeploys automatically.
"""
import json, html, datetime, pathlib, urllib.parse

ROOT = pathlib.Path(__file__).resolve().parent.parent
C = json.loads((ROOT / "data/content.json").read_text())
SITE = C["site_url"].rstrip("/")
WA = C["whatsapp"]
TODAY = datetime.date.today().isoformat()

def e(s): return html.escape(s, quote=True)
def wa(text): return f"https://wa.me/{WA}?text=" + urllib.parse.quote(text)

ARROW = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 11L11 5M6 5h5v5"/></svg>'
WA_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.4-.5c.2-.2.2-.3.3-.5.1-.2.1-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.3-.6-.4zM12 21.8h0c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4C2.7 15.6 2.2 13.8 2.2 12 2.2 6.6 6.6 2.2 12 2.2c2.6 0 5.1 1 6.9 2.9 1.8 1.8 2.9 4.3 2.9 6.9 0 5.4-4.4 9.8-9.8 9.8zm8.4-18.2C18.2 1.3 15.2 0 12 0 5.4 0 0 5.4 0 12c0 2.1.6 4.2 1.6 6L0 24l6.2-1.6c1.8 1 3.8 1.5 5.8 1.5h0c6.6 0 12-5.4 12-12 0-3.2-1.2-6.2-3.6-8.3z"/></svg>'
STAR = "★★★★★"

CAT_LABEL = {"landing": "Ad landing pages", "store": "Shopify stores", "wordpress": "WordPress", "other": "Wix & HubSpot"}

def work_cards():
    out = []
    for p in C["featured"]:
        host = urllib.parse.urlparse(p["url"]).netloc.replace("www.", "")
        tags = "".join(f'<span class="tag{" alt" if i else ""}">{e(t)}</span>' for i, t in enumerate(p["tags"]))
        out.append(f'''
        <a class="work reveal" data-cat="{p["cat"]}" href="{e(p["url"])}" target="_blank" rel="noopener">
          <div class="work-shot"><div class="browser" aria-hidden="true"><i></i><i></i><i></i><em>{e(host)}</em></div>
            <img src="/assets/work/{p["slug"]}.webp" alt="{e(p["name"])} website built by Iqbal Hossen" width="800" height="500" loading="lazy" decoding="async"></div>
          <div class="work-body">
            <div class="work-meta">{tags}</div>
            <h3>{e(p["name"])}</h3>
            <p>{e(p["desc"])}</p>
            <span class="visit">View live site · {e(p["market"])} {ARROW}</span>
          </div>
        </a>''')
    return "".join(out)

def index_cols():
    out = []
    for title, sites in C["index"].items():
        lis = "".join(f'<li><a href="https://{e(s)}" target="_blank" rel="noopener nofollow">{e(s)}</a></li>' for s in sites)
        out.append(f'<div class="index-col"><h4>{e(title)}</h4><ul>{lis}</ul></div>')
    return "".join(out)

TOTAL = sum(len(v) for v in C["index"].values())

FAQ = [
    ("Do you work with clients outside Bangladesh?",
     "Yes. Almost all of my clients are in Germany, Switzerland, the UK, the US and Australia. I'm used to working across time zones and I usually reply within an hour during my working day (GMT+6)."),
    ("How do payments work?",
     "You can hire me through Fiverr or Upwork, where your payment is protected until you approve the work. For direct projects I send a Payoneer payment request. Larger projects are split into milestones."),
    ("Do you use AI? Is the work AI-generated?",
     "I use AI tools like Claude and ChatGPT to research, draft and speed up repetitive work, so you get faster delivery. Every page is still designed, built, tested on real devices and checked by me before it goes live."),
    ("Can you work on my existing Shopify or WordPress site?",
     "Yes. A lot of my work is improving existing stores and sites: new landing pages, redesigns, speed fixes, migrations and new features, without breaking what already works."),
    ("Can you build pages for the German or EU market?",
     "Yes. Most of my recent Shopify landing pages are for German and Swiss brands. I handle multiple languages, EUR or CHF pricing and legal pages like Impressum, Datenschutz and AGB (you provide the legal text)."),
    ("What happens after launch?",
     "Every project includes free support for small fixes after delivery. If you want ongoing help, I offer monthly care plans or hourly work for updates, new pages and maintenance."),
]

def faq_html():
    return "".join(f"<details><summary>{e(q)}</summary><p>{e(a)}</p></details>" for q, a in FAQ)

def jsonld():
    person = {
        "@context": "https://schema.org",
        "@graph": [
            {"@type": "Person", "@id": SITE + "/#person", "name": "Iqbal Hossen",
             "jobTitle": "Shopify, WordPress & GoHighLevel Developer",
             "url": SITE + "/", "image": SITE + "/assets/img/iqbal-avatar.webp",
             "address": {"@type": "PostalAddress", "addressCountry": "BD"},
             "knowsAbout": ["Shopify", "Shopify landing pages", "WordPress", "Elementor", "WooCommerce", "GoHighLevel", "Wix", "HubSpot CMS", "Web performance", "Technical SEO", "AI automation"],
             "sameAs": [C["fiverr"], C["upwork"], C["github"]]},
            {"@type": "ProfessionalService", "@id": SITE + "/#service", "name": "Iqbal Hossen — Web Development",
             "url": SITE + "/", "image": SITE + "/assets/img/og.jpg", "founder": {"@id": SITE + "/#person"},
             "areaServed": "Worldwide", "priceRange": "$60 - $500",
             "telephone": "+" + WA,
             "description": "Shopify landing pages, Shopify stores, WordPress websites and GoHighLevel automation for brands in Europe, the US and Australia."},
            {"@type": "WebSite", "@id": SITE + "/#website", "url": SITE + "/", "name": "Iqbal Hossen", "publisher": {"@id": SITE + "/#person"}, "inLanguage": "en"},
            {"@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in FAQ]},
        ]}
    return json.dumps(person, ensure_ascii=False)

TITLE = "Iqbal Hossen — Shopify, WordPress & GoHighLevel Developer"
DESC = "Iqbal Hossen builds high-converting Shopify landing pages, Shopify stores, WordPress websites and GoHighLevel funnels for brands in Germany, the UK, the US and Australia. 5.0★ on Fiverr."

page = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>{e(TITLE)}</title>
<meta name="description" content="{e(DESC)}">
<link rel="canonical" href="{SITE}/">
<meta name="robots" content="index,follow,max-image-preview:large">
<meta name="author" content="Iqbal Hossen">
<meta name="theme-color" content="#F5F3EE">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Iqbal Hossen">
<meta property="og:title" content="{e(TITLE)}">
<meta property="og:description" content="{e(DESC)}">
<meta property="og:url" content="{SITE}/">
<meta property="og:image" content="{SITE}/assets/img/og.jpg">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Iqbal Hossen, Shopify and WordPress developer">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{e(TITLE)}">
<meta name="twitter:description" content="{e(DESC)}">
<meta name="twitter:image" content="{SITE}/assets/img/og.jpg">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter+Tight:wght@400;500;600;700&display=swap">
<link rel="preload" as="image" href="/assets/img/iqbal-cutout.webp" type="image/webp">
<link rel="stylesheet" href="/assets/css/style.css?v={TODAY}">
<script type="application/ld+json">{jsonld()}</script>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>

<header class="header" id="top">
  <nav class="wrap nav" aria-label="Main">
    <a class="brand" href="/" aria-label="Iqbal Hossen, home">
      <span class="brand-mark" aria-hidden="true">i</span>
      <span>Iqbal Hossen<small>Shopify · WordPress · GHL</small></span>
    </a>
    <ul class="nav-links" id="nav-links">
      <li><a href="#work">Work</a></li>
      <li><a href="#services">Services</a></li>
      <li><a href="#pricing">Pricing</a></li>
      <li><a href="#reviews">Reviews</a></li>
      <li><a href="#about">About</a></li>
      <li><a href="#faq">FAQ</a></li>
    </ul>
    <div class="nav-cta">
      <a class="btn btn-ghost btn-sm" href="{C["fiverr"]}" target="_blank" rel="noopener">Fiverr profile</a>
      <a class="btn btn-wa btn-sm" href="{wa("Hi Iqbal, I found your website and I'd like to talk about a project.")}" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">{WA_ICON}<span>WhatsApp me</span></a>
      <button class="menu-btn" aria-label="Open menu" aria-expanded="false" aria-controls="nav-links"><span></span></button>
    </div>
  </nav>
</header>

<main id="main">

<section class="hero">
  <div class="wrap hero-grid">
    <div class="hero-copy">
      <span class="status"><span class="dot" aria-hidden="true"></span>Available for new projects · replies within 1 hour</span>
      <h1>Websites that turn <span class="serif">ad clicks</span> into customers.</h1>
      <p class="lead">I'm Iqbal Hossen, a Shopify, WordPress and GoHighLevel developer. For 5+ years I've built landing pages, stores and business websites for brands in Germany, Switzerland, the UK, the US and Australia. I use AI to work faster, and I check every detail by hand.</p>
      <div class="hero-actions">
        <a class="btn btn-primary" href="#contact">Start a project {ARROW}</a>
        <a class="btn btn-ghost" href="#work">See my work</a>
      </div>
      <div class="proof">
        <div><strong>5.0 <span class="stars" aria-hidden="true">{STAR}</span></strong><span>89 Fiverr reviews</span></div>
        <div><strong>150+</strong><span>websites delivered</span></div>
        <div><strong>5+ yrs</strong><span>building for the web</span></div>
      </div>
    </div>
    <div class="hero-photo">
      <img src="/assets/img/iqbal-cutout.webp" alt="Iqbal Hossen, web developer" width="754" height="876" fetchpriority="high">
      <div class="float-card fc-1"><span class="stars" aria-hidden="true">{STAR}</span><b>“The communication was just great.”</b><span style="color:var(--muted)">evotec · Germany</span></div>
      <div class="float-card fc-2"><div class="row"><span class="dot" aria-hidden="true"></span><b>Fiverr Level 2 Seller</b></div><span style="color:var(--muted)">88 of 89 reviews are 5★</span></div>
    </div>
  </div>
</section>

<div class="marquee" aria-label="Some of the brands I've built for">
  <p class="marquee-label">Brands I've built for</p>
  <div class="marquee-inner" aria-hidden="true">
    {"".join(f"<span>{n}</span>" for n in ["PHOEBÉ","TitanBoard®","Homardo","Nepimi Organics","TAJATI®","St. Clair London","The Mint Museum","TechSkills","The Credit Pros","Broughton","PrimeFlow","Mplus Design","Dr. Wuffy","Happy Feedbag","Just Peloponnes"]*2)}
  </div>
</div>

<section class="section" id="work">
  <div class="wrap">
    <div class="section-head">
      <div><span class="eyebrow">Selected work</span><h2>Real sites, live today. <span class="serif">Click any of them.</span></h2></div>
      <div class="filters" role="group" aria-label="Filter projects">
        <button class="filter" data-filter="all" aria-pressed="true">All</button>
        <button class="filter" data-filter="landing" aria-pressed="false">Ad landing pages</button>
        <button class="filter" data-filter="store" aria-pressed="false">Shopify stores</button>
        <button class="filter" data-filter="wordpress" aria-pressed="false">WordPress</button>
        <button class="filter" data-filter="other" aria-pressed="false">Wix & HubSpot</button>
      </div>
    </div>
    <div class="work-grid">{work_cards()}
    </div>

    <details class="index reveal">
      <summary><span>Full project list<small>{TOTAL} live websites across Shopify, WordPress, Wix and HubSpot</small></span><span class="plus" aria-hidden="true">+</span></summary>
      <div class="index-body">{index_cols()}</div>
    </details>
  </div>
</section>

<section class="section dark" id="landing-pages">
  <div class="wrap lp-grid">
    <div>
      <span class="eyebrow">Specialty</span>
      <h2 style="font-size:clamp(36px,4.8vw,56px);margin-top:14px">Shopify landing pages <span class="serif">built for paid traffic.</span></h2>
      <p class="lead" style="margin-top:20px">Most of my Shopify work is landing pages for Meta and Google ads. A store's home page isn't built to sell one product to a cold visitor. A landing page is.</p>
      <ul class="lp-list">
        <li><span class="n">01</span><div><b>One message from ad to checkout</b><span>The headline, offer and visuals continue the ad, so visitors know they're in the right place.</span></div></li>
        <li><span class="n">02</span><div><b>Offers that raise order value</b><span>Bundles, quantity breaks, subscriptions and free gifts, set up the way your theme and apps actually support them.</span></div></li>
        <li><span class="n">03</span><div><b>Trust before the price</b><span>Reviews, guarantees, ingredients, comparisons and FAQs placed where buyers hesitate.</span></div></li>
        <li><span class="n">04</span><div><b>Fast on mobile</b><span>Most ad traffic is on a phone. Every page is built mobile-first and checked for speed.</span></div></li>
      </ul>
      <div class="platforms"><span>Replo</span><span>PageFly</span><span>GemPages</span><span>Online Store 2.0</span><span>Liquid</span><span>Advertorials & listicles</span></div>
    </div>
    <div class="stack-shots reveal" aria-hidden="true">
      <figure class="s1"><img src="/assets/work/titanboard.webp" alt="" width="800" height="500" loading="lazy"></figure>
      <figure class="s2"><img src="/assets/work/homardo.webp" alt="" width="800" height="463" loading="lazy"></figure>
      <figure class="s3"><img src="/assets/work/justpeloponnes.webp" alt="" width="800" height="500" loading="lazy"></figure>
    </div>
  </div>
</section>

<section class="section" id="services">
  <div class="wrap">
    <div class="section-head">
      <div><span class="eyebrow">Services</span><h2>One developer for your store, <span class="serif">site and funnels.</span></h2></div>
      <p>You don't need three freelancers. I handle the design, the build and the technical setup behind it.</p>
    </div>
    <div class="svc-grid">
      <article class="svc reveal"><div class="ico"><svg viewBox="0 0 24 24" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4h2l2.4 11.2a1 1 0 0 0 1 .8h8.9a1 1 0 0 0 1-.8L20 8H6"/><circle cx="9" cy="20" r="1"/><circle cx="17" cy="20" r="1"/></svg></div>
        <h3>Shopify landing pages</h3><p>Product pages, advertorials and campaign pages designed to convert ad traffic, or a clone of a page you like, rebuilt properly.</p><ul><li>Replo</li><li>PageFly</li><li>GemPages</li></ul></article>
      <article class="svc reveal"><div class="ico"><svg viewBox="0 0 24 24" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9l1-5h14l1 5M4 9v11h16V9M4 9h16M9 20v-6h6v6"/></svg></div>
        <h3>Shopify store design</h3><p>New stores and redesigns, especially for skincare, beauty, supplement and wellness brands in the EU and US.</p><ul><li>OS 2.0 themes</li><li>Liquid</li><li>Subscriptions</li></ul></article>
      <article class="svc reveal"><div class="ico"><svg viewBox="0 0 24 24" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3.5 9h17M3.5 15h17M12 3c2.5 2.6 3.7 5.6 3.7 9s-1.2 6.4-3.7 9c-2.5-2.6-3.7-5.6-3.7-9S9.5 5.6 12 3z"/></svg></div>
        <h3>WordPress websites</h3><p>Business websites, custom themes and plugins, WooCommerce and Elementor or Gutenberg builds your team can edit.</p><ul><li>Elementor</li><li>Gutenberg</li><li>WooCommerce</li><li>PHP</li></ul></article>
      <article class="svc reveal"><div class="ico"><svg viewBox="0 0 24 24" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h5v5H4zM15 13h5v5h-5zM9 8.5h4a2 2 0 0 1 2 2v2.5"/><path d="M13 16H9"/></svg></div>
        <h3>GoHighLevel & automation</h3><p>Funnels, lead follow-up workflows, AI booking agents and GHL connected to your Shopify store.</p><ul><li>Workflows</li><li>Conversation AI</li><li>Snapshots</li></ul></article>
      <article class="svc reveal"><div class="ico"><svg viewBox="0 0 24 24" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4z"/><path d="M18 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/></svg></div>
        <h3>AI site to WordPress</h3><p>Built something in Lovable, Base44 or Replit? I turn it into a real WordPress or Shopify site you can host, edit and rank.</p><ul><li>Lovable</li><li>Base44</li><li>Replit</li></ul></article>
      <article class="svc reveal"><div class="ico"><svg viewBox="0 0 24 24" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="7" rx="1.5"/><rect x="3" y="13" width="18" height="7" rx="1.5"/><path d="M7 7.5h.01M7 16.5h.01"/></svg></div>
        <h3>Hosting, speed & care</h3><p>Migrations, cPanel/WHM hosting, security clean-ups, speed optimization and technical SEO, plus Wix and HubSpot sites.</p><ul><li>cPanel / WHM</li><li>Core Web Vitals</li><li>Wix</li><li>HubSpot</li></ul></article>
    </div>
  </div>
</section>

<section class="section" style="padding-top:0">
  <div class="wrap">
    <div class="section-head">
      <div><span class="eyebrow">How we'll work</span><h2>Clear steps, <span class="serif">no surprises.</span></h2></div>
      <p>You always know what's happening, what it costs and when it will be ready.</p>
    </div>
    <div class="process">
      <div class="step reveal"><h3>Quick brief</h3><p>Send your store link or idea on WhatsApp, Fiverr or Upwork. A short message is enough to start.</p></div>
      <div class="step reveal"><h3>Fixed quote & plan</h3><p>Within 24 hours you get a clear scope, price and delivery date before any work starts.</p></div>
      <div class="step reveal"><h3>Build & updates</h3><p>I build on a draft theme or staging site, so your live store is never touched until you approve.</p></div>
      <div class="step reveal"><h3>Launch & support</h3><p>We go live together. Small fixes after launch are included, and you get a simple handover.</p></div>
    </div>
  </div>
</section>

<section class="section" id="pricing" style="background:#fff;border-top:1px solid var(--line);border-bottom:1px solid var(--line)">
  <div class="wrap">
    <div class="section-head">
      <div><span class="eyebrow">Pricing</span><h2>Honest starting prices. <span class="serif">Fixed quote before we start.</span></h2></div>
      <p>The final price depends on your scope. You'll always get a fixed quote first, with no hidden extras.</p>
    </div>
    <div class="price-grid">
      <div class="price reveal"><h3>Shopify landing page</h3><p class="muted">One high-converting product or ad landing page.</p>
        <div class="amt"><small>from</small>$120</div><div class="eta">Delivery in 2–3 days</div>
        <ul><li>Replo, PageFly, GemPages or theme sections</li><li>Offer, bundle and review sections</li><li>Mobile-first and speed-checked</li><li>Clone of a reference page if you want</li></ul>
        <a class="btn btn-ghost" href="{wa("Hi Iqbal, I need a Shopify landing page.")}" target="_blank" rel="noopener">Get a quote</a></div>
      <div class="price featured reveal"><span class="badge">Most popular</span><h3>Shopify store</h3><p class="muted">Store design or redesign, up to 5 key pages.</p>
        <div class="amt"><small>from</small>$180</div><div class="eta">Delivery in about 5 days</div>
        <ul><li>Home, product, collection, about, contact</li><li>Trust, reviews and FAQ sections</li><li>EU-ready: languages, EUR/CHF, legal pages</li><li>Speed and mobile checks</li></ul>
        <a class="btn btn-light" href="{wa("Hi Iqbal, I'd like a quote for a Shopify store.")}" target="_blank" rel="noopener">Get a quote</a></div>
      <div class="price reveal"><h3>WordPress website</h3><p class="muted">A complete business website your team can edit.</p>
        <div class="amt"><small>from</small>$250</div><div class="eta">Delivery in about 7 days</div>
        <ul><li>Elementor or Gutenberg</li><li>Up to 5 pages, contact forms</li><li>On-page SEO and analytics</li><li>Training video on how to edit</li></ul>
        <a class="btn btn-ghost" href="{wa("Hi Iqbal, I need a WordPress website.")}" target="_blank" rel="noopener">Get a quote</a></div>
      <div class="price reveal"><h3>GHL automation</h3><p class="muted">Funnels, workflows and AI agents in GoHighLevel.</p>
        <div class="amt"><small>from</small>$130</div><div class="eta">Delivery in about 4 days</div>
        <ul><li>Lead follow-up workflows</li><li>AI agent with calendar booking</li><li>Shopify and form integrations</li><li>Documented, easy to change</li></ul>
        <a class="btn btn-ghost" href="{wa("Hi Iqbal, I need help with GoHighLevel automation.")}" target="_blank" rel="noopener">Get a quote</a></div>
    </div>
    <p class="price-note">Ongoing updates, fixes and maintenance: <strong style="color:var(--ink)">$25 per hour</strong>. Also available on <a href="{C["fiverr"]}" target="_blank" rel="noopener">Fiverr</a> and <a href="{C["upwork"]}" target="_blank" rel="noopener">Upwork</a>.</p>
  </div>
</section>

<section class="section" id="reviews">
  <div class="wrap">
    <div class="section-head">
      <div><span class="eyebrow">Client reviews</span><h2>Don't take my word for it. <span class="serif">Hear it from clients.</span></h2></div>
      <p>Every review here comes from a real, paid project. Watch the videos or read all 89 reviews on Fiverr.</p>
    </div>
    <div class="rating-bar reveal">
      <div class="rating-big"><strong>5.0</strong><div><span class="stars" aria-label="5 out of 5 stars">{STAR}</span><small>89 reviews on Fiverr · 88 five-star</small></div></div>
      <div class="rating-split"><div><b>5.0</b><span>Communication</span></div><div><b>5.0</b><span>Quality of delivery</span></div><div><b>4.9</b><span>Value for money</span></div></div>
    </div>
    <div class="rev-grid">
      <button class="video reveal" data-yt="g5_53jJT79w" aria-label="Play video review from Gisela">
        <img src="https://i.ytimg.com/vi/g5_53jJT79w/hq720.jpg" onerror="this.src='https://i.ytimg.com/vi/g5_53jJT79w/hqdefault.jpg'" alt="Video review from Gisela Sanders Alcántara" loading="lazy" width="405" height="720">
        <span class="play"><svg viewBox="0 0 24 24"><path d="M7 4l14 8-14 8z"/></svg></span>
        <span class="cap"><b>Gisela Sanders Alcántara</b><span>Author & speaker · giselasa.com</span></span>
      </button>
      <button class="video reveal" data-yt="YJRHXkw92yY" aria-label="Play video review from Michaela">
        <img src="https://i.ytimg.com/vi/YJRHXkw92yY/hq720.jpg" onerror="this.src='https://i.ytimg.com/vi/YJRHXkw92yY/hqdefault.jpg'" alt="Video review from Michaela" loading="lazy" width="405" height="720">
        <span class="play"><svg viewBox="0 0 24 24"><path d="M7 4l14 8-14 8z"/></svg></span>
        <span class="cap"><b>Michaela</b><span>Video review</span></span>
      </button>
      <div class="quotes">
        <figure class="quote reveal"><blockquote>“He did finish the job even earlier as expected and the communication was just great.”</blockquote>
          <figcaption><span class="avatar" aria-hidden="true">E</span><span><b>evotec</b> · Germany · Website design</span><span class="stars" aria-hidden="true">{STAR}</span></figcaption></figure>
        <figure class="quote reveal"><blockquote>“It has been an absolute pleasure working with Mr. Iqbal.”</blockquote>
          <figcaption><span class="avatar" aria-hidden="true">A</span><span><b>adnancassim88</b> · Sri Lanka · WordPress</span><span class="stars" aria-hidden="true">{STAR}</span></figcaption></figure>
        <figure class="quote reveal"><blockquote>“I am truly satisfied with his work and the quick but also well done service.”</blockquote>
          <figcaption><span class="avatar" aria-hidden="true">P</span><span><b>paugra</b> · United States · Repeat client</span><span class="stars" aria-hidden="true">{STAR}</span></figcaption></figure>
      </div>
    </div>
    <div class="rev-more">
      <a class="btn btn-ghost" href="{C["fiverr"]}" target="_blank" rel="noopener">Read all 89 reviews on Fiverr {ARROW}</a>
      <a class="btn btn-ghost" href="{C["upwork"]}" target="_blank" rel="noopener">View Upwork profile {ARROW}</a>
    </div>
  </div>
</section>

<section class="section about" id="about" style="padding-top:40px">
  <div class="wrap about-grid">
    <figure class="about-photo reveal"><img src="/assets/img/iqbal-portrait.webp" alt="Portrait of Iqbal Hossen" width="754" height="867" loading="lazy">
      <figcaption><span>Iqbal Hossen</span><span>Based in Bangladesh · GMT+6</span></figcaption></figure>
    <div>
      <span class="eyebrow">About me</span>
      <h2>Developer first, <span class="serif">with a marketer's eye.</span></h2>
      <p>I started my career in 2021 at Am2Am Software, writing HTML, CSS and JavaScript, then PHP, Vue and React. I even built mobile apps with React Native. Over four years there I moved into WordPress and Shopify, building custom themes, plugins and client sites every week.</p>
      <p>Today I work with e-commerce brands and agencies on the things that bring in revenue: landing pages for ads, stores that build trust, and automations that follow up on leads. I'm also a web developer at TechSkills Institute in Australia, and I help maintain open-source WordPress plugins.</p>
      <p>I use AI tools like Claude and ChatGPT every day to research, draft and move faster. The judgement, design and final checks are always mine.</p>
      <ol class="timeline">
        <li><time>2025 – now</time><div><b>Web Developer (WordPress), TechSkills Institute</b><span>Australia · building pages, performance, SEO and hosting for the institute and its partners</span></div></li>
        <li><time>2021 – 2025</time><div><b>Website Developer (WordPress & Shopify), Am2Am Software</b><span>Custom websites, themes, plugins, payment gateways and React Native apps</span></div></li>
        <li><time>Ongoing</time><div><b>Freelance on Fiverr & Upwork</b><span>Fiverr Level 2 · 5.0★ from 89 reviews · clients across 4 continents</span></div></li>
      </ol>
      <div class="stack">
        <h3>Tools I work with</h3>
        <div class="stack-groups">
          <div class="stack-row"><b>E-commerce</b><div class="chips"><span>Shopify</span><span>Liquid</span><span>Replo</span><span>PageFly</span><span>GemPages</span><span>WooCommerce</span></div></div>
          <div class="stack-row"><b>CMS</b><div class="chips"><span>WordPress</span><span>Elementor</span><span>Gutenberg</span><span>Wix</span><span>HubSpot CMS</span><span>GoHighLevel</span></div></div>
          <div class="stack-row"><b>Code</b><div class="chips"><span>HTML / CSS</span><span>JavaScript</span><span>PHP</span><span>React</span><span>React Native</span><span>Vue</span></div></div>
          <div class="stack-row"><b>AI</b><div class="chips"><span>Claude</span><span>ChatGPT</span><span>Custom APIs</span><span>AI agents</span></div></div>
          <div class="stack-row"><b>Workflow</b><div class="chips"><span>Figma</span><span>Adobe</span><span>cPanel / WHM</span><span>GitHub</span><span>Slack</span><span>Asana</span><span>Basecamp</span></div></div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="section dark" id="open-source">
  <div class="wrap">
    <div class="section-head">
      <div><span class="eyebrow">Open source</span><h2>WordPress plugins <span class="serif">anyone can use.</span></h2></div>
      <p>Free plugins I build and maintain with the WordPress Satkhira Community. The code is public on GitHub.</p>
    </div>
    <div class="oss-grid">
      {"".join(f'''<a class="oss reveal" href="https://github.com/WordPress-Satkhira-Community/{r}" target="_blank" rel="noopener"><div class="top"><span>WordPress plugin</span><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 0C3.6 0 0 3.6 0 8c0 3.5 2.3 6.5 5.5 7.6.4.1.5-.2.5-.4v-1.4c-2.2.5-2.7-1-2.7-1-.4-.9-.9-1.2-.9-1.2-.7-.5.1-.5.1-.5.8.1 1.2.8 1.2.8.7 1.2 1.9.9 2.3.7.1-.5.3-.9.5-1.1-1.8-.2-3.6-.9-3.6-4 0-.9.3-1.6.8-2.1-.1-.2-.4-1 .1-2.1 0 0 .7-.2 2.2.8.6-.2 1.3-.3 2-.3s1.4.1 2 .3c1.5-1 2.2-.8 2.2-.8.4 1.1.2 1.9.1 2.1.5.6.8 1.3.8 2.1 0 3.1-1.9 3.7-3.6 3.9.3.3.5.8.5 1.5v2.2c0 .2.1.5.6.4C13.7 14.5 16 11.5 16 8c0-4.4-3.6-8-8-8z"/></svg></div><h3>{n}</h3><p>{d}</p></a>''' for r,n,d in [
        ("bot-traffic-shield","Bot Traffic Shield","Detects and blocks bad bots and fake traffic so your analytics and server stay clean."),
        ("comments-shield","Comments Shield","Stops comment spam on WordPress sites without annoying real visitors."),
        ("zenvy-shipping-progress-bar-for-woocommerce","Zenvy Shipping Progress Bar","Free-shipping progress bar for WooCommerce that nudges customers to add more to the cart."),
        ("quick-search-replace","Quick Search Replace","Search and replace text across your WordPress database safely, from the dashboard."),
        ("easy-svg-upload","Easy SVG Upload","Upload SVG files to the media library with sanitization for security."),
        ("simple-disable-xml-rpc","Simple Disable XML-RPC","One-click hardening that closes a common WordPress attack surface."),
      ])}
    </div>
  </div>
</section>

<section class="section" id="faq">
  <div class="wrap faq-grid">
    <div><span class="eyebrow">FAQ</span><h2 style="font-size:clamp(34px,4.4vw,52px);margin-top:14px">Questions clients <span class="serif">usually ask.</span></h2>
      <p class="lead" style="margin-top:18px">Something else on your mind? Ask me on <a href="{wa("Hi Iqbal, I have a question.")}" target="_blank" rel="noopener">WhatsApp</a>.</p></div>
    <div class="faq-list">{faq_html()}</div>
  </div>
</section>

<section class="section" id="contact" style="padding-top:20px">
  <div class="wrap">
    <div class="contact">
      <div style="position:relative;z-index:1">
        <span class="eyebrow">Let's work together</span>
        <h2>Have a project in mind? <span class="serif">Let's talk.</span></h2>
        <p class="lead">Tell me what you need and I'll reply with ideas and a fixed quote, usually within an hour during my working day.</p>
        <div class="contact-links">
          <a href="{wa("Hi Iqbal, I found your website and I'd like to talk about a project.")}" target="_blank" rel="noopener"><b>WhatsApp</b><span>{C["whatsapp_display"]} ↗</span></a>
          <a href="{C["fiverr"]}" target="_blank" rel="noopener"><b>Fiverr</b><span>Level 2 · 5.0★ (89) ↗</span></a>
          <a href="{C["upwork"]}" target="_blank" rel="noopener"><b>Upwork</b><span>Hire with Upwork protection ↗</span></a>
          <a href="{C["github"]}" target="_blank" rel="noopener"><b>GitHub</b><span>@hoseniqbal ↗</span></a>
        </div>
      </div>
      <form class="form" id="brief" novalidate>
        <h3>Quick project brief</h3>
        <p>Fill this in and it opens WhatsApp with your message ready to send.</p>
        <div class="field-row">
          <div class="field"><label for="f-name">Your name</label><input id="f-name" name="name" autocomplete="name" required></div>
          <div class="field"><label for="f-site">Website (optional)</label><input id="f-site" name="site" placeholder="yourstore.com" inputmode="url"></div>
        </div>
        <div class="field-row">
          <div class="field"><label for="f-type">What do you need?</label>
            <select id="f-type" name="type"><option>Shopify landing page</option><option>Shopify store</option><option>WordPress website</option><option>GoHighLevel automation</option><option>Fix or update my site</option><option>Something else</option></select></div>
          <div class="field"><label for="f-budget">Budget</label>
            <select id="f-budget" name="budget"><option>Under $200</option><option>$200 – $500</option><option>$500 – $1,000</option><option>$1,000+</option><option>Not sure yet</option></select></div>
        </div>
        <div class="field"><label for="f-msg">Project details</label><textarea id="f-msg" name="msg" placeholder="What are you selling, who is it for, and when do you need it?"></textarea></div>
        <button class="btn btn-wa" type="submit">{WA_ICON} Send on WhatsApp</button>
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
    <div class="footer-bottom"><span>© <span id="yr">{datetime.date.today().year}</span> Iqbal Hossen. All rights reserved.</span><span>Project screenshots show live client websites.</span></div>
  </div>
</footer>

<a class="wa-float" href="{wa("Hi Iqbal, I found your website and I'd like to talk about a project.")}" target="_blank" rel="noopener" aria-label="Chat with Iqbal on WhatsApp">{WA_ICON}</a>

<script>window.WA_NUMBER="{WA}";</script>
<script src="/assets/js/main.js?v={TODAY}" defer></script>
<script defer src="/_vercel/insights/script.js"></script>
</body>
</html>
'''

(ROOT / "index.html").write_text(page)

(ROOT / "sitemap.xml").write_text(f'''<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url><loc>{SITE}/</loc><lastmod>{TODAY}</lastmod><changefreq>monthly</changefreq><priority>1.0</priority>
    <image:image><image:loc>{SITE}/assets/img/iqbal-portrait.webp</image:loc></image:image></url>
</urlset>
''')
(ROOT / "robots.txt").write_text(f"User-agent: *\nAllow: /\n\nSitemap: {SITE}/sitemap.xml\n")
print("built", SITE, "projects:", len(C["featured"]), "index:", TOTAL)
