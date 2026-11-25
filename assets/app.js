(function () {
  "use strict";
  var PAGES = ["home", "about", "projects", "impact", "governance", "partners", "contact"];
  var EXTRA = ["enset-2026", "robotique"];
  function allItems(t) { return [t.robotics.card].concat(t.projects.items); }
  var LANGS = ["ar", "fr", "en"];
  var state = { lang: "fr", page: "home", filter: -1, hidePh: false };

  try { var saved = localStorage.getItem("aaa-lang"); if (LANGS.indexOf(saved) > -1) state.lang = saved; } catch (e) {}

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  // {{...}} => information ou fichier manquant, marqué
  function f(s) { return esc(s).replace(/\{\{(.+?)\}\}/g, '<span class="ph">$1</span>'); }
  function strip(s) { return String(s).replace(/\{\{|\}\}/g, ""); }
  function chip(t) { return '<span class="ph-chip">' + esc(t.chip) + "</span>"; }
  var PATTERN = '<span class="pattern" aria-hidden="true"></span>';
  function img(name) { return "img/" + name + ".jpg"; }
  function shot(name, caption, cls) {
    return '<figure class="shot' + (cls ? " " + cls : "") + '"><img src="' + img(name) + '" alt="' + esc(caption) + '" loading="lazy"><figcaption>' + f(caption) + "</figcaption></figure>";
  }

  // Logo provisoire inspiré de l'emblème (mains + pousse). À remplacer par le fichier officiel.
  var LOGO = '<img class="logo-img" src="img/logo-ayadi.jpg" alt="" width="48" height="47">';

  function sectionHead(eyebrow, title, lead, extra) {
    return '<div class="section-head">' + (eyebrow ? '<div class="eyebrow">' + f(eyebrow) + (extra || "") + "</div>" : "") +
      '<h2 class="h2">' + f(title) + "</h2>" + (lead ? '<p class="lead">' + f(lead) + "</p>" : "") + "</div>";
  }
  function pageHero(p, more) {
    return '<section class="page-hero">' + PATTERN + '<div class="wrap"><div class="eyebrow">' + f(p.eyebrow) + "</div><h1>" + f(p.title) + '</h1><p class="lead">' + f(p.lead) + "</p>" + (more || "") + "</div></section>";
  }
  function figures(list) {
    return '<div class="figures">' + list.map(function (x) { return '<div class="figure"><strong>' + f(x[0]) + "</strong><span>" + f(x[1]) + "</span></div>"; }).join("") + "</div>";
  }
  function projectCard(t, p) {
    var L = t.projects.labels, meta = "";
    if (p.l) meta += "<dt>" + esc(L.place) + "</dt><dd>" + f(p.l) + "</dd>";
    if (p.b) meta += "<dt>" + esc(L.ben) + "</dt><dd>" + f(p.b) + "</dd>";
    if (p.pa) meta += "<dt>" + esc(L.partners) + "</dt><dd>" + f(p.pa) + "</dd>";
    var photos = typeof p.photos === "string" ? '<figure class="card-shot"><img src="img/' + p.photos + '" alt="' + esc(p.t) + '" loading="lazy"></figure>' : p.photos ? '<div class="photo card-photo">' + PATTERN + '<span class="photo-label">' + esc(t.projects.photosTodo) + "</span></div>" : "";
    return '<article class="card project"><div class="project-top" data-d="' + p.d + '">' + PATTERN + '<span class="tag">' + f(t.axes[p.d][0]) + "</span></div>" +
      '<div class="project-body"><span class="period">' + f(p.pe || t.projects.period) + "</span><h3>" + f(p.t) + "</h3><p>" + f(p.p) + "</p>" +
      (meta ? '<dl class="meta">' + meta + "</dl>" : "") + photos + (p.link ? '<a class="card-link" href="#' + p.link + '">' + esc(t.robotics.more) + ' <span class="arrow" aria-hidden="true">→</span></a>' : "") + "</div></article>";
  }
  function docRow(d) {
    return '<div class="doc"><div class="doc-title"><span class="doc-ico">PDF</span><strong>' + f(d[0]) + "</strong></div>" + (d[2] ? '<a class="doc-link" href="' + d[2] + '" target="_blank" rel="noopener">' + esc(d[1]) + "</a>" : "<small>" + f(d[1]) + "</small>") + "</div>";
  }
  function kv(rows) {
    return '<div class="table-wrap"><table class="kv"><tbody>' + rows.map(function (r) { return '<tr><th scope="row">' + f(r[0]) + "</th><td>" + f(r[1]) + "</td></tr>"; }).join("") + "</tbody></table></div>";
  }
  function checks(list) { return '<ul class="check-list">' + list.map(function (x) { return "<li><span>" + f(x) + "</span></li>"; }).join("") + "</ul>"; }
  function link(page, label, cls) { return '<a class="btn ' + cls + '" href="#' + page + '">' + esc(label) + ' <span class="arrow" aria-hidden="true">→</span></a>'; }
  function ctaBand(t) {
    return '<section class="cta-band"><div class="wrap"><div><h2>' + f(t.home.ctaTitle) + "</h2><p>" + f(t.home.ctaText) + '</p></div><div class="actions">' +
      link("partners", t.cta.partner, "btn-primary") + link("contact", t.cta.contact, "btn-ghost") + "</div></div></section>";
  }
  function partnerCard(t, p, pending) {
    var signed = p[3] === "signed";
    var pill = '<span class="pill ' + (pending ? "pending" : signed ? "signed" : "on") + '">' + esc(pending ? t.partners.statusPending : signed ? t.partners.statusSigned : t.partners.statusActive) + "</span>";
    if (p[2]) {
      return '<div class="card partner has-logo"><div class="logo-tile' + (p[2] === "almoubadara" ? " dark" : "") + '"><img src="img/logos/' + p[2] + '.jpg" alt="' + esc(strip(p[0])) + '" loading="lazy"></div>' +
        '<div class="partner-text"><strong>' + f(p[0]) + "</strong><small>" + f(p[1]) + "</small>" + pill + "</div></div>";
    }
    return '<div class="card partner name-only"><span class="rule" aria-hidden="true"></span><strong>' + f(p[0]) + "</strong><small>" + f(p[1]) + "</small>" + pill + "</div>";
  }
  function partnerGrid(t, list, pending) {
    var withLogo = list.filter(function (p) { return p[2]; }), names = list.filter(function (p) { return !p[2]; });
    return (withLogo.length ? '<div class="grid g3">' + withLogo.map(function (p) { return partnerCard(t, p, pending); }).join("") + "</div>" : "") +
      (names.length ? '<div class="grid g3" style="margin-top:1.2rem">' + names.map(function (p) { return partnerCard(t, p, pending); }).join("") + "</div>" : "");
  }
  function president(t) {
    var p = t.about.president;
    return '<div class="card president"><img class="avatar" src="img/presidente.jpg" alt="' + esc(strip(p[0])) + '"><div><strong>' + f(p[0]) + "</strong><p>" + f(p[1]) + "</p></div></div>";
  }

  var MAP_EMBED = "https://www.google.com/maps/embed?pb=!1m10!1m8!1m3!1d13279.31734561688!2d-7.338599000000001!3d33.687483!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sfr!2sus!4v1795472792269!5m2!1sfr!2sus";
  var MAP_LINK = "https://www.google.com/maps?q=33.687483,-7.338599";
  // Carte Google intégrée sur le site publié ; dans l'aperçu (qui bloque les iframes), un lien remplace la carte.
  function mapBlock(c) {
    var head = '<div class="map-head"><strong>' + esc(c.map) + '</strong><a href="' + MAP_LINK + '" target="_blank" rel="noopener">' + esc(c.mapOpen) + ' <span class="arrow" aria-hidden="true">→</span></a></div>';
    var mapImg = '<a class="map-shot" href="' + MAP_LINK + '" target="_blank" rel="noopener"><img src="img/plan-acces.jpg" alt="' + esc(c.map) + '" loading="lazy"></a>';
    if (window.SITE_EMBED_MAP) {
      return '<div class="card map-card">' + head + mapImg + '<div class="map-frame"><iframe src="' + MAP_EMBED + '" title="' + esc(c.map) + '" loading="lazy" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div></div>';
    }
    return '<div class="card map-card">' + head + mapImg + '</div>';
  }

  function partnerContact(t) {
    var p = t.contact.partnerContact;
    return '<div class="card partner-contact"><h3>' + esc(p.title) + '</h3><p class="muted">' + esc(p.lead) + '</p>' +
      '<div class="pc-person"><img src="img/responsable-partenariats.jpg" alt="' + esc(p.name) + '" class="pc-photo"><div><strong>' + esc(p.name) + "</strong><span>" + esc(p.role) + "</span></div></div>" +
      '<ul class="info-list"><li><small>' + esc(p.phoneLabel) + '</small><span class="ltr">+33 6 07 13 53 25</span></li><li><small>' + esc(p.emailLabel) + '</small><span class="ltr">koutariwael23@gmail.com</span></li></ul></div>';
  }

  var R = {
    home: function (t) {
      var h = t.home;
      return '<section class="hero"><div class="wrap"><div class="hero-text"><div class="eyebrow">' + f(h.eyebrow) + "</div><h1>" + f(h.title) + '</h1><p class="lead">' + f(h.lead) +
        '</p><div class="actions">' + link("projects", t.cta.programmes, "btn-primary") + link("partners", t.cta.partner, "btn-ghost") + "</div></div>" +
        '<div class="hero-visual">' + shot("enset-salle", h.heroCaption) + "</div></div></section>" +
        '<section class="section"><div class="wrap">' + sectionHead(h.figuresTitle, "", "").replace('<h2 class="h2"></h2>', "") + figures(h.figures) + "</div></section>" +
        '<section class="section"><div class="wrap">' + sectionHead(h.axesEyebrow, h.axesTitle, h.axesLead) +
        '<div class="grid g5">' + t.axes.map(function (d, i) { return '<div class="card domain"><span class="num">0' + (i + 1) + "</span><h3>" + f(d[0]) + "</h3><p>" + f(d[1]) + "</p></div>"; }).join("") + "</div></div></section>" +
        '<section class="section"><div class="wrap"><div class="feature">' + shot("enset-rabbah", t.event.gallery[1][1]) +
        '<div class="feature-text"><div class="eyebrow">' + f(h.enset.eyebrow) + "</div><h3>" + f(h.enset.title) + "</h3><p>" + f(h.enset.text) + '</p><div class="actions">' + link("enset-2026", t.cta.enset, "btn-primary") + "</div></div></div></div></section>" +
        '<section class="section"><div class="wrap">' + sectionHead(h.featuredEyebrow, h.featuredTitle, "") +
        '<div class="grid g3">' + allItems(t).slice(0, 3).map(function (p) { return projectCard(t, p); }).join("") + '</div><div class="actions" style="margin-top:1.5rem">' + link("projects", t.cta.all, "btn-ghost") + "</div></div></section>" +
        '<section class="section"><div class="wrap">' + sectionHead(h.partnersEyebrow, h.partnersTitle, "") +
        partnerGrid(t, t.partners.active, false) + "</div></section>" + ctaBand(t);
    },
    about: function (t) {
      var a = t.about;
      return pageHero(a) +
        '<section class="section"><div class="wrap split"><div class="prose"><h2 class="h2">' + f(a.orientTitle) + "</h2><p>" + f(a.orient) + '</p><h3 style="margin-top:.5rem">' + f(a.publicsTitle) + '</h3><div class="chips">' +
        a.publics.map(function (x) { return "<span>" + f(x) + "</span>"; }).join("") + '</div></div><div class="stack"><h2 class="h2">' + f(a.legalTitle) + "</h2>" + kv(a.legal) + "</div></div></section>" +
        '<section class="section"><div class="wrap stack"><h2 class="h2">' + f(a.axesTitle || t.home.axesTitle) + '</h2><div class="grid g5">' + t.axes.map(function (d) { return '<div class="card domain"><h3>' + f(d[0]) + "</h3><p>" + f(d[1]) + "</p></div>"; }).join("") + "</div></div></section>" +
        '<section class="section"><div class="wrap stack" style="max-width:820px"><h2 class="h2">' + f(a.objectivesTitle) + "</h2>" + checks(a.objectives) + "</div></section>" +
        '<section class="section"><div class="wrap split"><div class="stack"><h2 class="h2">' + f(a.presidentTitle) + "</h2>" + president(t) + '</div><div class="stack"><h2 class="h2">' + f(a.storyTitle) + "</h2>" + [].concat(a.story).map(function (x) { return "<p>" + f(x) + "</p>"; }).join("") + "</div></div></section>" + ctaBand(t);
    },
    projects: function (t) {
      var p = t.projects;
      var btns = '<button type="button" data-filter="-1" aria-pressed="' + (state.filter === -1) + '">' + esc(p.all) + "</button>" +
        t.axes.map(function (d, i) { return '<button type="button" data-filter="' + i + '" aria-pressed="' + (state.filter === i) + '">' + esc(d[0]) + "</button>"; }).join("");
      var items = allItems(t).filter(function (x) { return state.filter === -1 || x.d === state.filter; });
      return pageHero(p) + '<section class="section"><div class="wrap"><div class="filters" role="group">' + btns + '</div><div class="grid g3">' +
        items.map(function (x) { return projectCard(t, x); }).join("") + '</div></div></section><section class="section"><div class="wrap"><div class="feature">' + shot("enset-boulmalf", t.event.gallery[2][1]) +
        '<div class="feature-text"><div class="eyebrow">' + f(t.home.enset.eyebrow) + "</div><h3>" + f(t.home.enset.title) + "</h3><p>" + f(t.home.enset.text) + '</p><div class="actions">' + link("enset-2026", t.cta.enset, "btn-primary") + "</div></div></div></div></section>" + ctaBand(t);
    },
    impact: function (t) {
      var m = t.impact, max = 900;
      var bars = m.bars.map(function (b) {
        return '<div class="hbar"><span class="hbar-label">' + esc(b[0]) + '</span><div class="hbar-track"><div class="hbar-fill" style="width:' + (b[1] / max * 100).toFixed(1) + '%">' + esc(b[2]) + "</div></div></div>";
      }).join("");
      return pageHero(m) + '<section class="section"><div class="wrap">' + figures(t.home.figures) + "</div></section>" +
        '<section class="section"><div class="wrap split"><div class="chart"><div class="eyebrow">' + esc(m.chartTitle) + '</div><div class="hbars">' + bars + '</div><small class="muted">' + esc(m.chartNote) + "</small></div>" +
        '<div class="stack"><h2 class="h2">' + f(m.reportsTitle) + "</h2>" + m.reports.map(docRow).join("") + "</div></div></section>" +
        '<section class="section"><div class="wrap split"><div class="stack"><h2 class="h2">' + f(m.challengesTitle) + "</h2>" + checks(m.challenges) + '</div><div class="stack"><h2 class="h2">' + f(m.outlookTitle) + "</h2>" + checks(m.outlook) + "</div></div></section>" + ctaBand(t);
    },
    governance: function (t) {
      var g = t.governance;
      return pageHero(g) +
        '<section class="section"><div class="wrap split"><div class="stack"><h2 class="h2">' + f(g.presTitle) + "</h2>" + president(t) + '</div><div class="stack"><h2 class="h2">' + f(g.boardTitle) + "</h2><p>" + f(g.boardNote) + "</p>" +
        '<ul class="board-list">' + g.board.map(function (m) { return '<li><strong>' + f(m[0]) + "</strong><span>" + f(m[1]) + "</span></li>"; }).join("") + "</ul></div></div></section>" +
        '<section class="section"><div class="wrap stack" style="max-width:760px;margin-inline:auto"><h2 class="h2">' + f(g.docsTitle) + "</h2>" + g.docs.map(docRow).join("") + "</div></section>" + ctaBand(t);
    },
    partners: function (t) {
      var p = t.partners;
      return pageHero(p) +
        '<section class="section"><div class="wrap">' + sectionHead("", p.activeTitle, "") + partnerGrid(t, p.active, false) +
        '<h2 class="h2" style="margin:2.5rem 0 1.2rem">' + f(p.pendingTitle) + '</h2>' + partnerGrid(t, p.pending, true) + "</div></section>" +
        '<section class="section"><div class="wrap feature">' + shot("enset-elfaiga", t.event.gallery[3][1]) + '<div class="feature-text"><h3>' + f(p.academicTitle) + "</h3>" + checks(p.academic) +
        '<div class="actions">' + link("enset-2026", t.cta.enset, "btn-primary") + "</div></div></div></section>" + '<section class="section"><div class="wrap" style="max-width:640px">' + partnerContact(t) + "</div></section>" + ctaBand(t);
    },
    "enset-2026": function (t) {
      var e = t.event;
      var facts = '<dl class="facts">' + e.facts.map(function (x) { return "<div><dt>" + esc(x[0]) + "</dt><dd>" + f(x[1]) + "</dd></div>"; }).join("") + "</dl>";
      var poster = e.gallery[5];
      var gallery = e.gallery.slice(0, 5).map(function (g, i) { return shot(g[0], g[1], i === 0 ? "wide" : ""); }).join("");
      var slots = ""; for (var i = 0; i < 4; i++) slots += '<div class="photo slot">' + PATTERN + '<span class="photo-label">' + esc(t.photoTodo) + " " + (i + 1) + "</span></div>";
      return pageHero(e, (e.titleNote ? '<p class="title-note" lang="ar" dir="rtl">' + esc(e.titleNote) + "</p>" : "") + facts) +
        '<section class="section"><div class="wrap">' + sectionHead("", e.speakersTitle, "") + '<div class="speakers-wrap"><div class="grid g2">' +
        e.speakers.map(function (s, i) { return '<div class="card speaker' + (i === 4 ? " lead-role" : "") + '"><strong>' + f(s[0]) + "</strong><p>" + f(s[1]) + "</p></div>"; }).join("") + "</div>" + shot(poster[0], poster[1], "poster") + "</div></div></section>" +
        '<section class="section"><div class="wrap">' + sectionHead("", e.galleryTitle, "") + '<div class="gallery">' + gallery + "</div></div></section>" +
        '<section class="section"><div class="wrap">' + sectionHead("", e.officialTitle, e.officialLead, "") + '<div class="slots">' + slots + '</div><div class="actions" style="margin-top:1.5rem">' + link("home", e.back, "btn-ghost") + "</div></div></section>";
    },
    robotique: function (t) {
      var r = t.robotics;
      var facts = '<dl class="facts">' + r.facts.map(function (x) { return "<div><dt>" + esc(x[0]) + "</dt><dd>" + f(x[1]) + "</dd></div>"; }).join("") + "</dl>";
      var slots = ""; for (var i = 0; i < 3; i++) slots += '<div class="photo slot">' + PATTERN + '<span class="photo-label">' + esc(r.photosTodo) + " " + (i + 1) + "</span></div>";
      return pageHero(r, facts) +
        '<section class="section"><div class="wrap">' + sectionHead("", r.figuresTitle, "") + figures(r.figures) + '<p class="muted" style="margin-top:1rem">' + f(r.figuresNote) + "</p></div></section>" +
        '<section class="section"><div class="wrap">' + sectionHead("", r.pathTitle, "") + '<ol class="steps">' + r.path.map(function (x, i) { return '<li class="card"><span class="num">' + (i + 1) + "</span><h3>" + f(x[0]) + "</h3><p>" + f(x[1]) + "</p></li>"; }).join("") + "</ol></div></section>" +
        '<section class="section"><div class="wrap split"><div class="stack"><h2 class="h2">' + f(r.goalsTitle) + "</h2>" + checks(r.goals) + '</div><div class="stack"><h2 class="h2">' + f(r.challengeTitle) + '</h2><div class="mv"><p>' + f(r.challenge) + "</p></div></div></div></section>" +
        '<section class="section"><div class="wrap">' + sectionHead("", r.planTitle, "") + '<div class="grid g3">' + r.plan.map(function (x) { return '<div class="card domain"><h3>' + f(x[0]) + "</h3><p>" + f(x[1]) + "</p></div>"; }).join("") + "</div></div></section>" +
        '<section class="section"><div class="wrap">' + sectionHead("", r.partnersTitle, "") + '<div class="grid g2">' + r.partners.map(function (x) { return '<div class="card"><h3>' + f(x[0]) + "</h3><p>" + f(x[1]) + "</p></div>"; }).join("") + "</div></div></section>" +
        '<section class="section"><div class="wrap">' + sectionHead("", r.photosTitle, "") + '<div class="slots">' + slots + "</div></div></section>" +
        '<section class="section"><div class="wrap" style="max-width:640px">' + partnerContact(t) + "</div></section>" + ctaBand(t);
    },
    contact: function (t) {
      var c = t.contact, F = c.form;
      function info(x, ltr) { return "<li><small>" + esc(x[0]) + "</small><span" + (ltr ? ' class="ltr"' : "") + ">" + f(x[1]) + "</span></li>"; }
      return pageHero(c) +
        '<section class="section"><div class="wrap contact-grid"><form class="form" id="contact-form" novalidate>' +
        '<div class="grid g2"><div class="field"><label for="cf-name">' + esc(F.name) + '</label><input id="cf-name" name="name" required autocomplete="name"></div>' +
        '<div class="field"><label for="cf-email">' + esc(F.email) + '</label><input id="cf-email" name="email" type="email" required autocomplete="email" dir="ltr"></div></div>' +
        '<div class="grid g2"><div class="field"><label for="cf-org">' + esc(F.org) + '</label><input id="cf-org" name="org" autocomplete="organization"></div>' +
        '<div class="field"><label for="cf-subject">' + esc(F.subject) + '</label><select id="cf-subject" name="subject">' + F.subjects.map(function (s) { return "<option>" + esc(s) + "</option>"; }).join("") + "</select></div></div>" +
        '<input type="text" name="_honey" tabindex="-1" autocomplete="off" aria-hidden="true" class="hp">' + '<div class="field"><label for="cf-message">' + esc(F.message) + '</label><textarea id="cf-message" name="message" required></textarea></div>' +
        '<div class="actions"><button class="btn btn-primary" type="submit">' + esc(F.send) + '</button></div><p class="form-note" id="cf-note" role="status" hidden></p></form>' +
        '<aside class="stack"><div class="card"><h3>' + esc(c.infoTitle) + '</h3><ul class="info-list">' + info(c.president) + info(c.address) + info(c.phone, true) + info(c.email, true) + info(c.social) + "</ul></div>" +
        partnerContact(t) + mapBlock(c) + "</aside></div></section>";
    }
  };

  function header(t) {
    return '<div class="banner"><div class="wrap"><span>' + esc(t.banner) + '</span><button type="button" id="toggle-ph">' + esc(t.hidePh) + "</button></div></div>" +
      '<header class="site-header"><div class="wrap"><a class="brand" href="#home">' + LOGO + '<span class="brand-text"><span class="brand-ar" lang="ar" dir="rtl">جمعية أيادي الأمل للتنمية والتعاون</span><span class="brand-latin">' +
      esc(state.lang === "ar" ? "Association Ayadi Al Amal" : t.orgShort + " · " + t.orgSub) + "</span></span></a>" +
      '<button class="menu-btn" type="button" id="menu-btn" aria-expanded="false" aria-controls="nav">' + esc(t.menu) + "</button>" +
      '<nav class="nav" id="nav" aria-label="' + esc(t.menu) + '">' + PAGES.map(function (p) { return '<a href="#' + p + '"' + (p === state.page ? ' aria-current="page"' : "") + ">" + esc(t.nav[p]) + "</a>"; }).join("") + "</nav>" +
      '<div class="lang" role="group" aria-label="Langue / Language / اللغة">' +
      '<button type="button" data-lang="ar" lang="ar" aria-pressed="' + (state.lang === "ar") + '" title="العربية">ع</button>' +
      '<button type="button" data-lang="fr" lang="fr" aria-pressed="' + (state.lang === "fr") + '" title="Français">FR</button>' +
      '<button type="button" data-lang="en" lang="en" aria-pressed="' + (state.lang === "en") + '" title="English">EN</button></div></div></header>';
  }
  function footer(t) {
    var c = t.contact;
    return '<footer class="site-footer"><div class="wrap"><div class="stack"><a class="brand" href="#home">' + LOGO + '<span class="brand-text"><span class="brand-ar" lang="ar" dir="rtl">جمعية أيادي الأمل للتنمية والتعاون</span><span class="brand-latin">' + esc(t.orgShort) + "</span></span></a><p>" + f(t.footer.about) + "</p></div>" +
      "<div><h4>" + esc(t.footer.pages) + "</h4><ul>" + PAGES.map(function (p) { return '<li><a href="#' + p + '">' + esc(t.nav[p]) + "</a></li>"; }).join("") + '<li><a href="#robotique">' + esc(t.robotics.nav) + '</a></li><li><a href="#enset-2026">' + esc(t.enset) + "</a></li></ul></div>" +
      "<div><h4>" + esc(t.footer.follow) + "</h4><ul><li>" + f(c.address[1]) + '</li><li class="ltr">' + f(c.phone[1]) + '</li><li class="ltr">' + f(c.email[1]) + "</li></ul></div></div>" +
      '<div class="footer-bottom"><div class="wrap"><span>© ' + new Date().getFullYear() + " " + esc(t.orgFull) + ". " + esc(t.footer.rights) + "</span></div></div></footer>";
  }

  function render(scrollTop) {
    var t = window.I18N[state.lang];
    var root = document.documentElement;
    root.lang = state.lang; root.dir = t.dir;
    var label = state.page === "enset-2026" ? t.enset : state.page === "robotique" ? t.robotics.nav : t.nav[state.page];
    document.title = (state.page === "home" ? "" : label + " · ") + t.orgShort;
    document.getElementById("app").innerHTML = header(t) + '<main id="main">' + R[state.page](t) + "</main>" + footer(t);
    document.body.classList.toggle("hide-ph", state.hidePh);
    var restore = document.getElementById("restore-ph");
    restore.textContent = t.showPh; restore.hidden = !state.hidePh;
    var tg = document.getElementById("toggle-ph"); if (tg) tg.textContent = state.hidePh ? t.showPh : t.hidePh;
    if (scrollTop) window.scrollTo(0, 0);
  }

  function route() {
    var h = (location.hash || "").replace("#", "");
    state.page = PAGES.indexOf(h) > -1 || EXTRA.indexOf(h) > -1 ? h : "home";
    render(true);
  }

  document.addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    if (b.dataset.lang) {
      state.lang = b.dataset.lang;
      try { localStorage.setItem("aaa-lang", state.lang); } catch (err) {}
      render(false);
    } else if (b.dataset.filter !== undefined) {
      state.filter = parseInt(b.dataset.filter, 10); render(false);
    } else if (b.id === "menu-btn") {
      var nav = document.getElementById("nav"); var open = nav.classList.toggle("open"); b.setAttribute("aria-expanded", String(open));
    } else if (b.id === "toggle-ph" || b.id === "restore-ph") {
      state.hidePh = !state.hidePh; render(false);
    }
  });
  document.addEventListener("submit", function (e) {
    if (e.target.id !== "contact-form") return;
    e.preventDefault();
    var form = e.target;
    if (!form.checkValidity()) { form.reportValidity(); return; }
    var F = window.I18N[state.lang].contact.form, note = document.getElementById("cf-note"), btn = form.querySelector("button[type=submit]");
    if (!window.SITE_LIVE) { note.textContent = F.sent; note.hidden = false; return; }
    // Formulaire relié à FormSubmit : message envoyé à la présidente, copie au responsable des partenariats.
    var d = new FormData(form);
    if (d.get("_honey")) return;
    btn.disabled = true; note.textContent = F.sending; note.hidden = false;
    fetch("https://formsubmit.co/ajax/slk.fatiha@gmail.com", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ name: d.get("name"), email: d.get("email"), organisation: d.get("org") || "-", subject: d.get("subject"), message: d.get("message"),
        _cc: "koutariwael23@gmail.com", _replyto: d.get("email"), _subject: "Site Ayadi Al Amal : " + d.get("subject") + " (" + d.get("name") + ")", _template: "table", _captcha: "false" })
    }).then(function (r) { return r.json().then(function (j) { if (!r.ok || String(j.success) !== "true") throw new Error(j.message || "error"); }); })
      .then(function () { note.textContent = F.ok; form.reset(); })
      .catch(function () { note.textContent = F.fail; })
      .then(function () { btn.disabled = false; });
  });
  window.addEventListener("hashchange", route);
  route();
})();
