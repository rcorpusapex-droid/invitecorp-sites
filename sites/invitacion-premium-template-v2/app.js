// app.js
(function () {
  const cfg = window.INVITACION || {};

  /* =========================
     Helpers
  ========================== */
  function escapeHtml(str) {
    return String(str ?? "").replace(
      /[&<>"']/g,
      (m) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#039;",
        })[m],
    );
  }

  function isImagePath(val) {
    return (
      typeof val === "string" && /\.(png|svg|webp|jpg|jpeg)$/i.test(val.trim())
    );
  }

  // Fade-in para <img class="imgFade">
  function enableFadeImages(root = document) {
    root.querySelectorAll("img.imgFade").forEach((img) => {
      const done = () => img.classList.add("is-loaded");
      if (img.complete) done();
      else img.addEventListener("load", done, { once: true });
    });
  }

  /* =========================
     Scroll Reveal (sin librerías)
     Blur -> claridad al ir bajando
  ========================== */
  function setupReveal() {
    const selectors = [
      "[data-reveal]",
      ".section .title",
      ".section .lead",
      "#itinerary .itCard",
      "#lodging .lodge",
      ".giftCard",
      ".calCard",
      "#gallery .gallerySwiper",
      ".parents__col",
    ];

    const set = new Set();
    selectors.forEach((sel) =>
      document.querySelectorAll(sel).forEach((el) => set.add(el)),
    );
    if (set.size === 0) return;

    // Accesibilidad
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      set.forEach((el) => el.classList.add("reveal", "is-in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("is-in");
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -10% 0px" },
    );

    set.forEach((el) => {
      // Evita animar cosas fijas/overlay
      if (el.closest(".hero")) return;
      if (el.closest(".topbar")) return;
      if (el.closest(".lightbox")) return;

      // Idempotente
      if (el.classList.contains("reveal")) return;

      el.classList.add("reveal");
      io.observe(el);
    });
  }

  /* =========================
     Mobile nav (drawer)
  ========================== */
  const burger = document.getElementById("burger");
  const mobile = document.getElementById("mobile");
  const backdrop = document.getElementById("backdrop");
  const mobileClose = document.getElementById("mobileClose");

  function openMenu() {
    if (!burger || !mobile || !backdrop) return;
    burger.setAttribute("aria-expanded", "true");
    mobile.hidden = false;
    backdrop.hidden = false;
    document.body.classList.add("menu-open");
    requestAnimationFrame(() => mobile.classList.add("is-open"));
  }

  function closeMenu() {
    if (!burger || !mobile || !backdrop) return;
    burger.setAttribute("aria-expanded", "false");
    mobile.classList.remove("is-open");
    document.body.classList.remove("menu-open");

    let finished = false;
    const done = () => {
      if (finished) return;
      finished = true;
      mobile.hidden = true;
      backdrop.hidden = true;
      mobile.removeEventListener("transitionend", done);
    };

    mobile.addEventListener("transitionend", done);
    setTimeout(done, 450);
  }

  if (burger && mobile) {
    burger.addEventListener("click", () => {
      const isOpen = burger.getAttribute("aria-expanded") === "true";
      isOpen ? closeMenu() : openMenu();
    });

    backdrop?.addEventListener("click", closeMenu);
    mobileClose?.addEventListener("click", closeMenu);

    mobile
      .querySelectorAll("a")
      .forEach((a) => a.addEventListener("click", closeMenu));

    document.addEventListener("keydown", (e) => {
      const isOpen = burger.getAttribute("aria-expanded") === "true";
      if (isOpen && e.key === "Escape") closeMenu();
    });
  }

  /* =========================
     Hero background (preload + fade)
  ========================== */
  const heroBg = document.getElementById("heroBg");
  if (heroBg && cfg.portada) {
    const url = cfg.portada;

    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = url;
    document.head.appendChild(link);

    const img = new Image();
    img.src = url;
    img.onload = () => {
      heroBg.style.backgroundImage = `url('${url}')`;
      heroBg.classList.add("is-loaded");
    };
  }

  /* =========================
     Names + Date
  ========================== */
  const names = document.getElementById("names");
  if (names && cfg.nombresHTML) names.innerHTML = cfg.nombresHTML;

  const dateText = document.getElementById("dateText");
  if (dateText) dateText.textContent = cfg.fechaTexto || "";

  /* =========================
     Padres (opcional)
  ========================== */
  const padresSection = document.getElementById("padres");
  const parentsTitle = document.getElementById("parentsTitle");
  const parentsGrid = document.getElementById("parentsGrid");

  if (padresSection && parentsGrid && cfg.padres) {
    padresSection.hidden = false;
    if (parentsTitle)
      parentsTitle.textContent =
        cfg.padres.titulo || "EN COMPAÑÍA DE NUESTROS PADRES";

    const col = (title, namesArr = []) => `
      <div class="parents__col">
        <h3 class="parents__colTitle">${escapeHtml(title || "")}</h3>
        ${(namesArr || []).map((n) => `<p class="parents__name">${escapeHtml(n)}</p>`).join("")}
      </div>
    `;

    parentsGrid.innerHTML =
      col(cfg.padres.noviaTitulo, cfg.padres.novia) +
      col(cfg.padres.novioTitulo, cfg.padres.novio);
  } else if (padresSection) {
    padresSection.hidden = true;
  }

  /* =========================
     Footer
  ========================== */
  const footerNames = document.getElementById("footerNames");
  if (footerNames) {
    const n = cfg.footerNombres || "";
    footerNames.textContent = n ? `| ${n} |` : "";
  }

  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  const contactLink = document.getElementById("contactLink");
  if (contactLink) contactLink.href = cfg.contactoLink || "#";

  const footerBrand = document.getElementById("footerBrand");
  if (footerBrand) {
    footerBrand.textContent = cfg.footerMarca || "INVITECORP.MX";
    footerBrand.href = cfg.footerMarcaLink || "#";
  }

  /* =========================
     Itinerario (VERTICAL PRO alternado)
  ========================== */
  const itWrap = document.getElementById("itinerary");
  if (itWrap && Array.isArray(cfg.itinerario)) {
    itWrap.classList.remove("cards");
    itWrap.classList.add("itTimelineAlt");
    itWrap.innerHTML = "";

    cfg.itinerario.forEach((item) => {
      const iconIsImg =
        typeof item.icon === "string" &&
        /\.(png|svg|webp|jpg|jpeg)$/i.test(item.icon.trim());

      const iconHTML = iconIsImg
        ? `<img src="${item.icon}" alt="" loading="lazy" />`
        : `<span class="itEmoji">${escapeHtml(item.icon || "✦")}</span>`;

      itWrap.insertAdjacentHTML(
        "beforeend",
        `
        <article class="itItem">
          <div class="itCard">
            <div class="itCard__title">${escapeHtml(item.titulo || "")}</div>
            ${item.lugar ? `<div class="itCard__place">${escapeHtml(item.lugar)}</div>` : ``}
            ${item.mapa ? `<a class="itMap" target="_blank" rel="noreferrer" href="${item.mapa}">VER MAPA</a>` : ``}
          </div>

          <div class="itNode" aria-hidden="true">
            <div class="itTime">${escapeHtml(item.hora || "")}</div>
            <div class="itDot"></div>
            <div class="itStem"></div>
            <div class="itMedal">${iconHTML}</div>
          </div>
        </article>
        `,
      );
    });
  }

  /* =========================
     Gallery (Coverflow PRO + fade)
  ========================== */
  const gWrap = document.getElementById("gallery");
  let gallerySwiper = null;

  if (gWrap && Array.isArray(cfg.galeria)) {
    gWrap.classList.add("gallery--swiper");

    gWrap.innerHTML = `
      <div class="swiper gallerySwiper" aria-label="Galería">
        <div class="swiper-wrapper" id="galleryWrapper"></div>
        <div class="swiper-button-prev" aria-label="Anterior"></div>
        <div class="swiper-button-next" aria-label="Siguiente"></div>
        <div class="swiper-pagination" aria-label="Paginación"></div>
      </div>
    `;

    const wrapper = document.getElementById("galleryWrapper");
    wrapper.innerHTML = "";

    cfg.galeria.forEach((src, i) => {
      const slide = document.createElement("div");
      slide.className = "swiper-slide";
      slide.innerHTML = `
        <div class="photo" data-i="${i}">
          <img class="imgFade" src="${src}" alt="Foto" loading="lazy" decoding="async" />
        </div>
      `;
      wrapper.appendChild(slide);
    });

    enableFadeImages(wrapper);

    if (window.Swiper) {
      gallerySwiper?.destroy?.(true, true);
      const mid = Math.floor((cfg.galeria.length - 1) / 2);

      gallerySwiper = new Swiper(".gallerySwiper", {
        loop: false,
        speed: 650,
        grabCursor: true,
        centeredSlides: true,
        slidesPerView: "auto",
        spaceBetween: 18,
        initialSlide: mid,

        effect: "coverflow",
        coverflowEffect: {
          rotate: 35,
          stretch: 0,
          depth: 180,
          modifier: 1,
          slideShadows: false,
        },

        pagination: { el: ".swiper-pagination", clickable: true },
        navigation: {
          nextEl: ".swiper-button-next",
          prevEl: ".swiper-button-prev",
        },
        keyboard: { enabled: true },
        a11y: true,
      });

      requestAnimationFrame(() => {
        gallerySwiper.update();
        gallerySwiper.slideTo(mid, 0);
      });
    }
  }

  /* =========================
     Lightbox (Galería)
  ========================== */
  (function setupLightbox() {
    const lb = document.getElementById("lightbox");
    const gWrap = document.getElementById("gallery");

    const lbImg = document.getElementById("lbImg");
    const lbCount = document.getElementById("lbCount");
    const lbClose = document.getElementById("lbClose");
    const lbPrev = document.getElementById("lbPrev");
    const lbNext = document.getElementById("lbNext");

    if (!gWrap || !lb || !lbImg || !lbCount) return;
    if (!Array.isArray(cfg.galeria) || cfg.galeria.length === 0) return;

    let index = 0;
    let startX = 0;
    let dx = 0;

    function render() {
      lbImg.src = cfg.galeria[index];
      lbCount.textContent = `${index + 1} / ${cfg.galeria.length}`;
    }

    function openAt(i) {
      index = (i + cfg.galeria.length) % cfg.galeria.length;
      lb.hidden = false;
      lb.setAttribute("aria-hidden", "false");
      document.body.classList.add("lb-open");
      render();
    }

    function close() {
      lb.hidden = true;
      lb.setAttribute("aria-hidden", "true");
      document.body.classList.remove("lb-open");
    }

    function prev() {
      index = (index - 1 + cfg.galeria.length) % cfg.galeria.length;
      render();
    }

    function next() {
      index = (index + 1) % cfg.galeria.length;
      render();
    }

    gWrap.addEventListener("click", (e) => {
      const photo = e.target.closest(".photo");
      if (!photo) return;

      if (gallerySwiper && gallerySwiper.allowClick === false) return;

      const i = Number(photo.dataset.i);
      if (!Number.isNaN(i)) openAt(i);
    });

    lbClose?.addEventListener("click", close);

    lb.addEventListener("click", (e) => {
      if (e.target === lb) close();
    });

    lbPrev?.addEventListener("click", (e) => {
      e.stopPropagation();
      prev();
    });
    lbNext?.addEventListener("click", (e) => {
      e.stopPropagation();
      next();
    });

    document.addEventListener("keydown", (e) => {
      if (lb.hidden) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    });

    lbImg.addEventListener(
      "touchstart",
      (e) => {
        startX = e.touches[0].clientX;
        dx = 0;
      },
      { passive: true },
    );

    lbImg.addEventListener(
      "touchmove",
      (e) => {
        dx = e.touches[0].clientX - startX;
      },
      { passive: true },
    );

    lbImg.addEventListener("touchend", () => {
      if (Math.abs(dx) > 45) dx > 0 ? prev() : next();
    });
  })();

  /* =========================
     Gifts
  ========================== */
  const giftsIntro = document.getElementById("giftsIntro");
  if (giftsIntro) giftsIntro.textContent = cfg.regalosIntro || "";

  const gift1 = document.getElementById("gift1");
  const gift2 = document.getElementById("gift2");

  if (gift1 && cfg.regalo1) {
    gift1.href = cfg.regalo1.link || "#";
    const img = gift1.querySelector("img");
    if (img && cfg.regalo1.img) img.src = cfg.regalo1.img;
  }

  if (gift2 && cfg.regalo2) {
    gift2.href = cfg.regalo2.link || "#";
    const img = gift2.querySelector("img");
    if (img && cfg.regalo2.img) img.src = cfg.regalo2.img;
  }

  const bank1 = document.getElementById("bankLine1");
  const bank2 = document.getElementById("bankLine2");
  if (bank1 && cfg.banco) bank1.textContent = cfg.banco.linea1 || "";
  if (bank2 && cfg.banco) bank2.textContent = cfg.banco.linea2 || "";

  /* =========================
     Lodging (PRO cards + blur + fade)
  ========================== */
  const navHosp = document.getElementById("navHospedaje");
  const mobHosp = document.getElementById("mobileHospedaje");
  const lodgingWrap = document.getElementById("lodging");
  const lodgingIntro = document.getElementById("lodgingIntro");

  const hasLodging = Array.isArray(cfg.hospedaje) && cfg.hospedaje.length > 0;

  if (!hasLodging) {
    if (navHosp) navHosp.style.display = "none";
    if (mobHosp) mobHosp.style.display = "none";
  } else {
    if (lodgingIntro)
      lodgingIntro.textContent = cfg.hospedajeIntro || lodgingIntro.textContent;

    if (lodgingWrap) {
      lodgingWrap.innerHTML = "";

      cfg.hospedaje.forEach((h) => {
        const fotoOk = isImagePath(h.foto);
        const tag = h.tag
          ? `<span class="lodge__tag">${escapeHtml(h.tag)}</span>`
          : "";

        const reservaBtn = h.reserva
          ? `<a class="lodge__btn lodge__btn--ghost" target="_blank" rel="noreferrer" href="${h.reserva}">RESERVAR</a>`
          : `<span></span>`;

        const div = document.createElement("div");
        div.className = "lodge";

        div.innerHTML = `
          <div class="lodge__media" style="${fotoOk ? `--bg:url('${h.foto}')` : ""}">
            ${fotoOk ? `<img class="imgFade" src="${h.foto}" alt="${escapeHtml(h.nombre || "Hotel")}" loading="lazy" decoding="async" />` : ``}
            ${tag}
          </div>

          <div class="lodge__body">
            <h3 class="lodge__name">${escapeHtml(h.nombre || "")}</h3>
            <p class="lodge__text">${escapeHtml(h.texto || "")}</p>

            <div class="lodge__actions">
              ${h.link ? `<a class="lodge__btn" target="_blank" rel="noreferrer" href="${h.link}">VER MAPA</a>` : `<span></span>`}
              ${reservaBtn}
            </div>
          </div>
        `;

        lodgingWrap.appendChild(div);
      });

      enableFadeImages(lodgingWrap);
    }
  }

  /* =========================
     Countdown
  ========================== */
  const target = cfg.fechaISO ? new Date(cfg.fechaISO) : null;
  const els = {
    d: document.getElementById("d"),
    h: document.getElementById("h"),
    m: document.getElementById("m"),
    s: document.getElementById("s"),
  };

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function tick() {
    if (!target || Number.isNaN(target.getTime())) return;

    const now = new Date();
    let diff = target.getTime() - now.getTime();
    if (diff < 0) diff = 0;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hrs = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    const secs = Math.floor((diff / 1000) % 60);

    if (els.d) els.d.textContent = String(days).padStart(3, "0");
    if (els.h) els.h.textContent = pad(hrs);
    if (els.m) els.m.textContent = pad(mins);
    if (els.s) els.s.textContent = pad(secs);
  }

  setInterval(tick, 1000);
  tick();

  /* =========================
     RSVP -> Google Sheets
  ========================== */
  const form = document.getElementById("rsvpForm");
  const msg = document.getElementById("formMsg");

  if (form && msg) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const endpoint = cfg.rsvpEndpoint;
      if (!endpoint) {
        msg.textContent = "⚠️ Falta rsvpEndpoint en config.js";
        return;
      }

      const fd = new FormData(form);
      const nombre = String(fd.get("nombre") || "").trim();
      const telefono = String(fd.get("telefono") || "").trim();
      const asistire = String(fd.get("asistire") || "");
      const personasSel = Number(fd.get("personas") || 0);
      const notas = String(fd.get("mensaje") || "").trim();

      const asistira = asistire === "No" ? "no" : "si";
      const personas = asistira === "si" ? personasSel : 0;

      const body = new URLSearchParams({
        nombre,
        telefono,
        asistira,
        personas: String(personas),
        notas,
        source: "web",
        ua: navigator.userAgent,
      });

      msg.textContent = "Enviando…";

      try {
        const res = await fetch(endpoint, {
          method: "POST",
          body,
          redirect: "follow",
        });
        const out = await res.json();
        if (out.ok) {
          msg.textContent = "✅ ¡Confirmación guardada!";
          form.reset();
          return;
        }
        msg.textContent = "❌ " + (out.error || "No se pudo guardar");
        return;
      } catch (_) {
        await fetch(endpoint, { method: "POST", mode: "no-cors", body });
        msg.textContent = "✅ Enviado. Revisa tu Google Sheet.";
        form.reset();
      }
    });
  }

  /* =========================
     Dress Code (vestido + traje) + fade
  ========================== */
  (function renderDressCode() {
    const tA = document.getElementById("attireTitleA");
    const tB = document.getElementById("attireTitleB");
    const line = document.getElementById("attireDressCodeLine");
    const intro = document.getElementById("attireIntro");
    const thanks = document.getElementById("attireThanks");
    const swWrap = document.getElementById("attireSwatches");

    const dressImg = document.getElementById("attireDressImg");
    const suitImg = document.getElementById("attireSuitImg");

    if (!swWrap) return;

    if (tA) tA.textContent = cfg.titleA || "BODA";
    if (tB) tB.textContent = cfg.titleB || "atuendo";
    if (line) line.textContent = cfg.dressCodeLine || "";
    if (intro) intro.textContent = cfg.intro || "";
    if (thanks) thanks.textContent = cfg.thanks || "¡Gracias!";

    if (dressImg && isImagePath(cfg.vestidoImg)) {
      dressImg.classList.add("imgFade");
      dressImg.src = cfg.vestidoImg;
    } else if (dressImg) {
      dressImg.hidden = true;
    }

    if (suitImg && isImagePath(cfg.trajeImg)) {
      suitImg.classList.add("imgFade");
      suitImg.src = cfg.trajeImg;
    } else if (suitImg) {
      suitImg.hidden = true;
    }

    const key = cfg.paletteId || "sage_blush";
    const paletteObj = cfg && cfg[key] ? cfg[key] : null;

    const colors =
      (paletteObj && Array.isArray(paletteObj.colors)
        ? paletteObj.colors
        : null) ||
      (cfg.sage_blush && Array.isArray(cfg.sage_blush.colors)
        ? cfg.sage_blush.colors
        : []) ||
      [];

    swWrap.innerHTML = "";
    colors.forEach((hex) => {
      const dot = document.createElement("span");
      dot.className = "attireSwatch";
      dot.style.setProperty("--c", hex);
      dot.setAttribute("aria-label", hex);
      swWrap.appendChild(dot);
    });

    enableFadeImages(document);
  })();

  /* =========================
     Agendar evento (Google / iOS / Outlook)
  ========================== */
  function toGoogleDateUTC(d) {
    return d
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}Z$/, "Z");
  }

  function icsEscape(s) {
    return String(s || "")
      .replace(/\\/g, "\\\\")
      .replace(/\n/g, "\\n")
      .replace(/,/g, "\\,")
      .replace(/;/g, "\\;");
  }

  (function setupAddToCalendar() {
    const elTitle = document.getElementById("calTitle");
    const elSub = document.getElementById("calSub");
    const menu = document.getElementById("calMenu");

    const aGoogle = document.getElementById("calGoogle");
    const aICS = document.getElementById("calICS");
    const aOutlook = document.getElementById("calOutlook");

    if (!aGoogle || !aICS || !aOutlook) return;

    const ev = cfg.evento || {};
    const title =
      ev.titulo || (cfg.footerNombres ? `Boda ${cfg.footerNombres}` : "Evento");

    const location = ev.ubicacion || "";
    const details = ev.descripcion || "";
    const tz = ev.timezone || "America/Mexico_City";

    const startISO = ev.startISO || cfg.fechaISO;
    if (!startISO) return;

    const start = new Date(startISO);
    const end = ev.endISO
      ? new Date(ev.endISO)
      : new Date(start.getTime() + 6 * 60 * 60 * 1000);

    if (elTitle) elTitle.textContent = title;

    try {
      const fmt = new Intl.DateTimeFormat("es-MX", {
        dateStyle: "full",
        timeStyle: "short",
        timeZone: tz,
      });
      const when = fmt.format(start);
      const where = location ? ` · ${location}` : "";
      if (elSub) elSub.textContent = `${when}${where}`.toUpperCase();
    } catch {
      if (elSub)
        elSub.textContent =
          `${cfg.fechaTexto || ""}${location ? " · " + location : ""}`.trim();
    }

    const startG = toGoogleDateUTC(start);
    const endG = toGoogleDateUTC(end);

    const gParams = new URLSearchParams({
      action: "TEMPLATE",
      text: title,
      dates: `${startG}/${endG}`,
      details,
      location,
      ctz: tz,
    });
    aGoogle.href = `https://calendar.google.com/calendar/render?${gParams.toString()}`;

    const oParams = new URLSearchParams({
      subject: title,
      body: details,
      location,
      startdt: start.toISOString(),
      enddt: end.toISOString(),
    });
    aOutlook.href = `https://outlook.live.com/calendar/0/deeplink/compose?${oParams.toString()}`;

    const dtStamp = toGoogleDateUTC(new Date());
    const uid = `${Date.now()}-${Math.random().toString(16).slice(2)}@invite`;

    const ics = `BEGIN:VCALENDAR\r
VERSION:2.0\r
PRODID:-//INVITACION//ES\r
CALSCALE:GREGORIAN\r
METHOD:PUBLISH\r
BEGIN:VEVENT\r
UID:${uid}\r
DTSTAMP:${dtStamp}\r
DTSTART:${startG}\r
DTEND:${endG}\r
SUMMARY:${icsEscape(title)}\r
DESCRIPTION:${icsEscape(details)}\r
LOCATION:${icsEscape(location)}\r
END:VEVENT\r
END:VCALENDAR\r`;

    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    aICS.href = url;
    aICS.download = `${title.replace(/[^\w\s-]/g, "").trim() || "evento"}.ics`;

    [aGoogle, aICS, aOutlook].forEach((a) => {
      a.addEventListener("click", () => {
        if (menu && menu.open) menu.open = false;
      });
    });
  })();

  /* =========================
   SPLASH -> Click real activa audio
========================= */
  /* =========================
   MÚSICA — Ultra Premium Editorial (Collapse + AutoClose)
   Reemplaza tu splashUnlockAudio() por ESTE
========================= */
  /* =========================
   SPLASH -> Click real activa audio + Tap Anywhere + Sello JPG
   MÚSICA — Ultra Premium Editorial (Collapse + AutoClose)
   Reemplaza tu splashUnlockAudio() por ESTE
========================= */
  (function splashUnlockAudio() {
    const cfg = window.INVITACION || {};
    const music = cfg.musica || {
      enabled: cfg.enabled,
      src: cfg.src,
      title: cfg.title,
      subtitle: cfg.subtitle,
      autoplay: cfg.autoplay,
      volume: cfg.volume,
      remember: cfg.remember,
    };

    // Splash
    const splash = document.getElementById("splash");
    const enterBtn = document.getElementById("enterBtn");
    const hint = document.getElementById("splashHint");
    const sealBtn = document.getElementById("sealBtn");
    const sealImg = document.getElementById("sealImg");
    const sealMonogram = document.getElementById("sealMonogram"); // opcional (si lo tienes)
    const sealSub = document.getElementById("sealSub"); // opcional (si lo tienes)

    // Audio
    const audio = document.getElementById("bgAudio");
    const source = document.getElementById("bgAudioSrc");

    // UI (Editorial Collapse)
    const bar = document.getElementById("musicBar");
    const toggle = document.getElementById("musicToggle");
    const panel = document.getElementById("musicPanel");

    const playBtn = document.getElementById("playBtn");
    const playIcon = document.getElementById("playIcon");
    const pauseIcon = document.getElementById("pauseIcon");

    const seek = document.getElementById("seek");
    const vol = document.getElementById("vol");
    const muteBtn = document.getElementById("muteBtn");
    const volIcon = document.getElementById("volIcon");
    const muteIcon = document.getElementById("muteIcon");

    const curTime = document.getElementById("curTime");
    const durTime = document.getElementById("durTime");
    const closeBtn = document.getElementById("closeBtn");

    const trackTitle = document.getElementById("trackTitle");
    const trackSub = document.getElementById("trackSub");

    // Validación
    if (!music?.enabled || !audio || !source || !bar || !seek) {
      if (splash) splash.style.display = "none";
      return;
    }

    // =========================
    // Scroll lock PRO (evita “brinco”)
    // =========================
    const lockScroll = () => {
      const y = window.scrollY || 0;
      const sbw = window.innerWidth - document.documentElement.clientWidth;

      document.body.dataset.scrollY = String(y);
      document.body.style.position = "fixed";
      document.body.style.top = `-${y}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.width = "100%";

      // compensa scrollbar (evita shift horizontal)
      if (sbw > 0) document.body.style.paddingRight = `${sbw}px`;
    };

    const unlockScroll = () => {
      const y = parseInt(document.body.dataset.scrollY || "0", 10);

      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      document.body.style.paddingRight = "";
      delete document.body.dataset.scrollY;

      window.scrollTo(0, y);
    };

    // =========================
    // Splash: aplicar sello desde config + iniciales (si existen en HTML)
    // =========================
    if (sealImg) {
      const selloSrc = cfg.sello || "";
      if (selloSrc) sealImg.src = selloSrc;
      sealImg.alt = cfg.footerNombres || "Sello";
    }
    if (sealSub && cfg.footerNombres) {
      sealSub.textContent = cfg.footerNombres; // usa campo existente
    }
    if (sealMonogram && cfg.footerNombres) {
      const parts = cfg.footerNombres
        .split("&")
        .map((s) => s.trim())
        .filter(Boolean);
      const a = (parts[0]?.[0] || "E").toUpperCase();
      const b = (parts[1]?.[0] || "M").toUpperCase();
      sealMonogram.innerHTML = `${a}<span>&amp;</span>${b}`;
    }

    // Aplicar src + textos
    if (music.src) source.src = music.src;
    if (trackTitle) trackTitle.textContent = music.title || "Música";
    if (trackSub) trackSub.textContent = music.subtitle || "Música de fondo";

    // iOS inline
    audio.setAttribute("playsinline", "");
    audio.playsInline = true;
    audio.load();

    // Volumen inicial
    const initialVol = typeof music.volume === "number" ? music.volume : 0.8;
    audio.volume = initialVol;
    if (vol) vol.value = String(initialVol);

    // Mostrar barra
    bar.hidden = false;
    document.body.classList.add("has-musicbar");

    // Helpers
    const setIcons = (isPlaying) => {
      if (!playIcon || !pauseIcon) return;
      playIcon.style.display = isPlaying ? "none" : "block";
      pauseIcon.style.display = isPlaying ? "block" : "none";
    };

    const fmtTime = (s) => {
      if (!isFinite(s)) return "0:00";
      const m = Math.floor(s / 60);
      const r = Math.floor(s % 60)
        .toString()
        .padStart(2, "0");
      return `${m}:${r}`;
    };

    const safePlay = () => {
      try {
        audio.muted = false;
        audio.volume = initialVol;
        const p = audio.play();
        if (p && typeof p.catch === "function") p.catch(() => {});
        return p;
      } catch {
        return null;
      }
    };

    const hideSplashPro = () => {
      if (!splash) return;
      splash.classList.add("is-leaving");
      setTimeout(() => {
        splash.style.display = "none";
        unlockScroll(); // ✅ quita lock sin “brinco”
      }, 480);
    };

    // =========================
    // Collapse / Expand + AutoClose
    // =========================
    let rafId = null;
    let isSeeking = false;
    let isVolDragging = false;
    let autoCloseTimer = null;

    const openPanel = () => {
      bar.classList.add("is-open");
      toggle?.setAttribute("aria-expanded", "true");
      panel?.setAttribute("aria-hidden", "false");
      scheduleAutoClose();
    };

    const closePanel = () => {
      bar.classList.remove("is-open");
      toggle?.setAttribute("aria-expanded", "false");
      panel?.setAttribute("aria-hidden", "true");
      clearAutoClose();
    };

    const clearAutoClose = () => {
      if (autoCloseTimer) clearTimeout(autoCloseTimer);
      autoCloseTimer = null;
    };

    const scheduleAutoClose = () => {
      clearAutoClose();
      if (!bar.classList.contains("is-open")) return;

      autoCloseTimer = setTimeout(() => {
        if (isSeeking || isVolDragging) {
          scheduleAutoClose();
          return;
        }

        bar.classList.add("is-softclosing");
        setTimeout(() => {
          bar.classList.remove("is-softclosing");
          closePanel();
        }, 220);
      }, 2900);
    };

    const touchInside = () => {
      if (bar.classList.contains("is-open")) scheduleAutoClose();
    };

    toggle?.addEventListener("click", (e) => {
      const isPlayClick = e.target.closest("#playBtn");
      if (isPlayClick) return;
      bar.classList.contains("is-open") ? closePanel() : openPanel();
    });

    playBtn?.addEventListener("click", (e) => e.stopPropagation());
    muteBtn?.addEventListener("click", (e) => e.stopPropagation());
    closeBtn?.addEventListener("click", (e) => e.stopPropagation());

    panel?.addEventListener("pointerdown", touchInside, { passive: true });
    panel?.addEventListener("touchstart", touchInside, { passive: true });
    panel?.addEventListener("mousemove", touchInside, { passive: true });

    // =========================
    // Seek suave + Drag real
    // =========================
    const SEEK_MAX = 5000;
    seek.min = "0";
    seek.max = String(SEEK_MAX);
    seek.step = "1";
    seek.value = "0";

    let wasPlayingBeforeSeek = false;

    const startRaf = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateSeekSmooth);
    };

    const stopRaf = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
    };

    const updateSeekSmooth = () => {
      if (!isSeeking && isFinite(audio.duration) && audio.duration > 0) {
        const v = (audio.currentTime / audio.duration) * SEEK_MAX;
        seek.value = String(v);
      }
      rafId = requestAnimationFrame(updateSeekSmooth);
    };

    const applySeekValue = () => {
      if (!isFinite(audio.duration) || audio.duration <= 0) return;
      const v = Math.max(0, Math.min(SEEK_MAX, parseFloat(seek.value) || 0));
      const t = (v / SEEK_MAX) * audio.duration;
      audio.currentTime = t;
      if (curTime) curTime.textContent = fmtTime(t);
    };

    const seekStart = () => {
      isSeeking = true;
      wasPlayingBeforeSeek = !audio.paused;
      stopRaf();
      scheduleAutoClose();
    };

    const seekMove = () => {
      if (!isSeeking) return;
      applySeekValue();
      scheduleAutoClose();
    };

    const seekEnd = () => {
      if (!isSeeking) return;
      isSeeking = false;
      applySeekValue();

      if (wasPlayingBeforeSeek) {
        const p = audio.play();
        if (p && typeof p.catch === "function") p.catch(() => {});
      }
      if (!audio.paused) startRaf();
      scheduleAutoClose();
    };

    seek.addEventListener("pointerdown", seekStart);
    seek.addEventListener("pointermove", seekMove);
    seek.addEventListener("pointerup", seekEnd);
    seek.addEventListener("pointercancel", seekEnd);

    seek.addEventListener("touchstart", seekStart, { passive: true });
    seek.addEventListener("touchmove", seekMove, { passive: true });
    seek.addEventListener("touchend", seekEnd, { passive: true });
    seek.addEventListener("touchcancel", seekEnd, { passive: true });

    seek.addEventListener("input", () => {
      applySeekValue();
      scheduleAutoClose();
    });

    // =========================
    // Volumen (drag + autoClose)
    // =========================
    if (vol) {
      const volStart = () => {
        isVolDragging = true;
        scheduleAutoClose();
      };
      const volEnd = () => {
        isVolDragging = false;
        scheduleAutoClose();
      };

      vol.addEventListener("pointerdown", volStart);
      vol.addEventListener("pointerup", volEnd);
      vol.addEventListener("pointercancel", volEnd);

      vol.addEventListener("touchstart", volStart, { passive: true });
      vol.addEventListener("touchend", volEnd, { passive: true });
      vol.addEventListener("touchcancel", volEnd, { passive: true });

      vol.addEventListener("input", () => {
        audio.volume = parseFloat(vol.value);
        if (audio.muted && audio.volume > 0) {
          audio.muted = false;
          if (volIcon) volIcon.style.display = "inline";
          if (muteIcon) muteIcon.style.display = "none";
        }
        scheduleAutoClose();
      });
    }

    muteBtn?.addEventListener("click", () => {
      audio.muted = !audio.muted;
      if (volIcon) volIcon.style.display = audio.muted ? "none" : "inline";
      if (muteIcon) muteIcon.style.display = audio.muted ? "inline" : "none";
      scheduleAutoClose();
    });

    // =========================
    // Audio events
    // =========================
    audio.addEventListener("loadedmetadata", () => {
      if (durTime) durTime.textContent = fmtTime(audio.duration);
    });

    audio.addEventListener("timeupdate", () => {
      if (curTime) curTime.textContent = fmtTime(audio.currentTime);
    });

    audio.addEventListener("playing", () => {
      setIcons(true);
      startRaf();
      openPanel();
    });

    audio.addEventListener("pause", () => {
      setIcons(false);
      stopRaf();
      if (bar.classList.contains("is-open")) scheduleAutoClose();
    });

    audio.addEventListener("ended", () => {
      setIcons(false);
      stopRaf();
      seek.value = "0";
      if (curTime) curTime.textContent = "0:00";
      if (bar.classList.contains("is-open")) scheduleAutoClose();
    });

    // =========================
    // Controles
    // =========================
    playBtn?.addEventListener("click", () => {
      if (audio.paused) safePlay();
      else audio.pause();
      if (bar.classList.contains("is-open")) scheduleAutoClose();
    });

    closeBtn?.addEventListener("click", () => {
      clearAutoClose();
      stopRaf();

      audio.pause();
      try {
        audio.currentTime = 0;
      } catch {}
      seek.value = "0";
      if (curTime) curTime.textContent = "0:00";

      closePanel();
      bar.hidden = true;
      document.body.classList.remove("has-musicbar");
    });

    // =========================
    // Splash: click real desbloquea audio + tap anywhere + sello
    // =========================
    if (splash) {
      lockScroll(); // ✅ lock PRO (sin brinco)

      let entered = false;

      const doEnter = () => {
        if (entered) return;
        entered = true;

        if (hint) hint.textContent = "";

        try {
          audio.currentTime = 0;
        } catch {}
        const p = safePlay();

        if (p && typeof p.then === "function") {
          p.then(() => hideSplashPro()).catch(() => {
            entered = false;
            if (hint) hint.textContent = "Toca nuevamente para activar audio.";
          });
        } else {
          hideSplashPro();
        }
      };

      enterBtn?.addEventListener("click", (e) => {
        e.stopPropagation();
        doEnter();
      });

      sealBtn?.addEventListener("click", (e) => {
        e.stopPropagation();
        doEnter();
      });

      splash.addEventListener("click", () => doEnter(), { passive: true });
    } else {
      if (splash) splash.style.display = "none";
    }

    // Estado inicial de iconos
    setIcons(!audio.paused);
  })();

  // IMPORTANTE: llama reveal al final, cuando ya renderizaste todo
  setupReveal();
})();
