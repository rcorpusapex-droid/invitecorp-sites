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
     Hero background
  ========================== */
  const heroBg = document.getElementById("heroBg");
  if (heroBg && cfg.portada) {
    heroBg.style.backgroundImage = `url('${cfg.portada}')`;
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
  // Footer (firma)
  const footerNames = document.getElementById("footerNames");
  if (footerNames) {
    const n = cfg.footerNombres || "";
    footerNames.textContent = n ? `| ${n} |` : "";
  }

  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  const contactLink = document.getElementById("contactLink");
  if (contactLink) {
    contactLink.href = cfg.contactoLink || "#";
  }

  const footerBrand = document.getElementById("footerBrand");
  if (footerBrand) {
    footerBrand.textContent = cfg.footerMarca || "INVITECORP.MX";
    footerBrand.href = cfg.footerMarcaLink || "#";
  }

  /* =========================
     Itinerario (PRO + iconos PNG/SVG)
  ========================== */
  const itWrap = document.getElementById("itinerary");
  if (itWrap && Array.isArray(cfg.itinerario)) {
    // Cambia el contenedor a nuestro layout editorial
    itWrap.classList.remove("cards");
    itWrap.classList.add("itTimeline");

    itWrap.innerHTML = "";

    cfg.itinerario.forEach((item) => {
      const iconIsImg =
        typeof item.icon === "string" &&
        /\.(png|svg|webp|jpg|jpeg)$/i.test(item.icon.trim());

      const iconHTML = iconIsImg
        ? `<img src="${item.icon}" alt="" loading="lazy" />`
        : escapeHtml(item.icon || "✦");

      itWrap.insertAdjacentHTML(
        "beforeend",
        `
      <div class="itText">
        <div class="itLine">
          <span class="itTitle">${escapeHtml(item.titulo || "")}</span>
          <span class="itSep">—</span>
          <span class="itHour">${escapeHtml(item.hora || "")}</span>
        </div>
        ${item.lugar ? `<div class="itPlace">${escapeHtml(item.lugar)}</div>` : ``}
        ${item.mapa ? `<a class="itMap" target="_blank" rel="noreferrer" href="${item.mapa}">VER MAPA</a>` : ``}
      </div>

      <div class="itDot" aria-hidden="true"></div>

      <div class="itIcon" aria-hidden="true">
        ${iconHTML}
      </div>
      `,
      );
    });
  }

  /* =========================
     Gallery
  ========================== */
  const gWrap = document.getElementById("gallery");
  if (gWrap && Array.isArray(cfg.galeria)) {
    gWrap.innerHTML = "";
    cfg.galeria.forEach((src) => {
      const div = document.createElement("div");
      div.className = "photo";
      div.innerHTML = `<img src="${src}" alt="Foto" loading="lazy" />`;
      gWrap.appendChild(div);
    });
  }

  /* =========================
   Lightbox (Galería)
========================= */
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

    // click en miniaturas
    // click en cualquier parte de la foto (img o overlay)
    gWrap.addEventListener("click", (e) => {
      const photo = e.target.closest(".photo");
      if (!photo) return;

      const photos = Array.from(gWrap.querySelectorAll(".photo"));
      const i = photos.indexOf(photo);
      if (i >= 0) openAt(i);
    });

    // cerrar
    lbClose?.addEventListener("click", close);

    // click en fondo cierra (no cierra si das click en imagen o botones)
    lb.addEventListener("click", (e) => {
      if (e.target === lb) close();
    });

    // nav
    lbPrev?.addEventListener("click", (e) => {
      e.stopPropagation();
      prev();
    });
    lbNext?.addEventListener("click", (e) => {
      e.stopPropagation();
      next();
    });

    // teclado
    document.addEventListener("keydown", (e) => {
      if (lb.hidden) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    });

    // swipe móvil
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
      if (Math.abs(dx) > 45) {
        dx > 0 ? prev() : next();
      }
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
     Lodging (opcional)
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
        const div = document.createElement("div");
        div.className = "lodge";
        div.innerHTML = `
          <h3>${escapeHtml(h.nombre || "")}</h3>
          <p class="muted">${escapeHtml(h.texto || "")}</p>
          ${h.link ? `<a class="map" target="_blank" rel="noreferrer" href="${h.link}">VER MAPA</a>` : ``}
        `;
        lodgingWrap.appendChild(div);
      });
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
   RSVP -> Google Sheets (Apps Script) SIN CORS (no preflight)
========================= */
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
    const asistire = String(fd.get("asistire") || ""); // "Si" / "No"
    const personasSel = Number(fd.get("personas") || 0);
    const notas = String(fd.get("mensaje") || "").trim();

    const asistira = (asistire === "No") ? "no" : "si";
    const personas = (asistira === "si") ? personasSel : 0;

    const body = new URLSearchParams({
      nombre,
      telefono,
      asistira,
      personas: String(personas),
      notas,
      source: "web",
      ua: navigator.userAgent
    });

    msg.textContent = "Enviando…";

    // Intento normal (si CORS deja leer)
    try {
      const res = await fetch(endpoint, { method: "POST", body, redirect: "follow" });
      const out = await res.json();
      if (out.ok) {
        msg.textContent = "✅ ¡Confirmación guardada!";
        form.reset();
        return;
      }
      msg.textContent = "❌ " + (out.error || "No se pudo guardar");
      return;
    } catch (_) {
      // Fallback: manda aunque no puedas leer respuesta
      await fetch(endpoint, { method: "POST", mode: "no-cors", body });
      msg.textContent = "✅ Enviado. Revisa tu Google Sheet.";
      form.reset();
    }
  });
}

/* =========================
     Dress Code (tarjeta + paleta)
  ========================== */
  (function renderDressCode() {
    const tA = document.getElementById("attireTitleA");
    const tB = document.getElementById("attireTitleB");
    const line = document.getElementById("attireDressCodeLine");
    const intro = document.getElementById("attireIntro");
    const thanks = document.getElementById("attireThanks");
    const swWrap = document.getElementById("attireSwatches");

    // Si no existe la sección en el HTML, no hacemos nada
    if (!swWrap) return;

    if (tA) tA.textContent = cfg.titleA || "WEDDING";
    if (tB) tB.textContent = cfg.titleB || "attire";
    if (line) line.textContent = cfg.dressCodeLine || "";
    if (intro) intro.textContent = cfg.intro || "";
    if (thanks) thanks.textContent = cfg.thanks || "";

    // Paleta: soporta tu estructura actual (paleta como key suelta)
    const paletteKey = cfg.paletteId || "sage_blush";
    const paletteObj = (cfg && cfg[paletteKey]) ? cfg[paletteKey] : null;

    // fallback si por algo no existe
    const colors =
      (paletteObj && Array.isArray(paletteObj.colors) ? paletteObj.colors : null) ||
      (cfg.sage_blush && Array.isArray(cfg.sage_blush.colors) ? cfg.sage_blush.colors : []) ||
      [];

    swWrap.innerHTML = "";
    colors.forEach((hex) => {
      const dot = document.createElement("span");
      dot.className = "attireSwatch";
      dot.style.setProperty("--c", hex);
      dot.setAttribute("aria-label", hex);
      swWrap.appendChild(dot);
    });
  })();

})();
