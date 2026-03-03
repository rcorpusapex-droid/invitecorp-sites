// public/weather-pro.js
(() => {
  const root = document.getElementById("weatherPro");
  if (!root) return;

  const inv = window.INVITACION || {};
  const cfg = inv.weather && inv.weather.enabled !== false ? inv.weather : null;
  if (!cfg) {
    root.hidden = true;
    return;
  }

  const $ = (id) => document.getElementById(id);

  const elCity = $("wproCity");
  const elDate = $("wproDate");
  const elTemp = $("wproTemp");
  const elDesc = $("wproDesc");
  const elHint = $("wproHint");
  const elRainProb = $("wproRainProb");
  const elWind = $("wproWind");
  const elCer = $("wproCeremony");
  const elIcon = $("wproIcon");
  const elHours = $("wproHours");
  const elBadge = $("wproBadge");
  const btnRefresh = $("wproRefresh");
  const themeToggle = $("wproTheme");

  const elDaysDesktop =
    document.getElementById("wproDaysDesktop") ||
    document.getElementById("wproDays");
  const elDaysMobile = document.getElementById("wproDaysMobile");
  const acc = $("wproAcc");

  const THEME_KEY = "WEATHER_PRO_THEME";

  // ✅ aplica tema. persist=true solo cuando el usuario cambia el switch
  function setTheme(mode, persist = false) {
    root.classList.toggle("is-light", mode === "light");
    if (themeToggle) themeToggle.checked = mode === "light";
    if (persist) localStorage.setItem(THEME_KEY, mode);
  }

  // ✅ default PRO: siempre arranca en claro (si no hay elección guardada)
  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark") {
      return setTheme(saved, false);
    }

    // si quieres forzar oscuro desde config: cfg.theme = "dark"
    const initial = cfg.theme === "dark" ? "dark" : "light";
    setTheme(initial, false);
  }

  // ✅ fecha del evento desde config principal
  function getWeddingDate() {
    const iso = inv?.fechaISO || inv?.evento?.startISO; // prioridad: fechaISO
    if (!iso) return null;
    return String(iso).slice(0, 10); // YYYY-MM-DD
  }

  function getNow() {
    return cfg.debugNow ? new Date(cfg.debugNow + "T00:00:00") : new Date();
  }

  function daysUntil(dateStr) {
    const now = getNow();
    const t = new Date(dateStr + "T00:00:00");
    return Math.ceil((t.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }

  function fmtWithTZ(dateStr, tz, opts) {
    const dt = new Date(dateStr + "T12:00:00Z"); // evita corrimientos
    return new Intl.DateTimeFormat("es-MX", {
      timeZone: tz || "America/Mexico_City",
      ...opts,
    }).format(dt);
  }

  function fmtDate(dateStr, tz) {
    return fmtWithTZ(dateStr, tz, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function fmtShort(dateStr, tz) {
    return fmtWithTZ(dateStr, tz, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  }

  function iconFor(code, isDay) {
    if (code === 0) return "#wx-sun";
    if (code === 1 || code === 2) return isDay ? "#wx-cloud-sun" : "#wx-cloud";
    if (code === 3) return "#wx-cloud";
    if (code === 45 || code === 48) return "#wx-fog";
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return "#wx-rain";
    if ([95, 96, 99].includes(code)) return "#wx-storm";
    return "#wx-cloud";
  }

  function labelFor(code) {
    const map = {
      0: "Despejado",
      1: "Mayormente despejado",
      2: "Parcialmente nublado",
      3: "Nublado",
      45: "Niebla",
      48: "Niebla",
      51: "Llovizna ligera",
      53: "Llovizna",
      55: "Llovizna intensa",
      61: "Lluvia ligera",
      63: "Lluvia",
      65: "Lluvia intensa",
      80: "Chubascos ligeros",
      81: "Chubascos",
      82: "Chubascos intensos",
      95: "Tormenta",
      96: "Tormenta con granizo",
      99: "Tormenta fuerte",
    };
    return map[code] || "Pronóstico";
  }

  function setIcon(symbolId) {
    if (!elIcon) return;
    elIcon.innerHTML = `<svg><use href="${symbolId}"></use></svg>`;
  }

  async function fetchForecast() {
    const params = new URLSearchParams({
      latitude: String(cfg.lat),
      longitude: String(cfg.lon),
      timezone: cfg.timezone || "auto",
      forecast_days: String(cfg.forecastDays || 16), // ✅ 16 días
      hourly: "temperature_2m,precipitation_probability,weather_code",
      daily:
        "temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code,wind_speed_10m_max",
    });

    const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
    const r = await fetch(url);
    if (!r.ok) throw new Error("Open-Meteo error");
    return r.json();
  }

  function pickHourlyWindow(data, dateStr, centerHHMM) {
    const times = data.hourly?.time || [];
    const t2m = data.hourly?.temperature_2m || [];
    const pop = data.hourly?.precipitation_probability || [];
    const wcode = data.hourly?.weather_code || [];

    const [hh, mm] = (centerHHMM || "17:00").split(":").map(Number);
    const targetPrefix = `${dateStr}T${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;

    let idx = times.findIndex((t) => t.startsWith(targetPrefix));
    if (idx === -1) idx = times.findIndex((t) => t.startsWith(dateStr + "T"));
    if (idx === -1) return [];

    const start = Math.max(0, idx - 3);
    const end = Math.min(times.length, idx + 4);

    const out = [];
    for (let i = start; i < end; i++) {
      if (!times[i].startsWith(dateStr + "T")) continue;
      out.push({
        time: times[i].slice(11, 16),
        temp: Math.round(t2m[i]),
        pop: pop && pop[i] != null ? pop[i] : null,
        code: wcode ? wcode[i] : 3,
        isFocus: i === idx,
      });
    }
    return out;
  }

  function renderHours(hours) {
    if (!elHours) return;
    elHours.innerHTML = "";

    if (!hours.length) {
      elHours.innerHTML = `<div style="color:var(--wmuted);padding:6px 0;">Pronóstico por horas no disponible.</div>`;
      return;
    }

    hours.forEach((h) => {
      const sym = iconFor(h.code, true);
      const div = document.createElement("div");
      div.className = "wproHour" + (h.isFocus ? " is-focus" : "");
      div.innerHTML = `
        <div class="wproHour__t">${h.time}</div>
        <div class="wproHour__row">
          <div class="wproHour__ic"><svg><use href="${sym}"></use></svg></div>
          <div class="wproHour__v">${h.temp}°</div>
        </div>
        <div style="margin-top:8px;color:var(--wmuted);font-size:12px;display:flex;justify-content:space-between;">
          <span>Lluvia</span><span>${h.pop ?? "—"}%</span>
        </div>
      `;
      elHours.appendChild(div);
    });
  }

  function buildWeekSlice(dailyTimes, eventIdx, windowDays) {
    const len = dailyTimes.length;
    const w = Math.max(3, windowDays || 7);
    const half = Math.floor(w / 2);

    let start = eventIdx - half;
    let end = eventIdx + half;

    if (start < 0) {
      start = 0;
      end = Math.min(len - 1, w - 1);
    }
    if (end > len - 1) {
      end = len - 1;
      start = Math.max(0, len - w);
    }

    return { start, end };
  }

  function renderWeek(data, weddingDate) {
    const showWeek = cfg.showWeek !== false;

    if (!showWeek) {
      if (acc) acc.style.display = "none";
      if (elDaysDesktop) elDaysDesktop.innerHTML = "";
      if (elDaysMobile) elDaysMobile.innerHTML = "";
      return;
    }

    const dailyTimes = data.daily?.time || [];
    const idx = dailyTimes.indexOf(weddingDate);
    if (idx === -1) return;

    const { start, end } = buildWeekSlice(dailyTimes, idx, cfg.weekWindowDays || 7);

    const tmax = data.daily.temperature_2m_max || [];
    const tmin = data.daily.temperature_2m_min || [];
    const popm = data.daily.precipitation_probability_max || [];
    const code = data.daily.weather_code || [];

    const rows = [];
    for (let i = start; i <= end; i++) {
      const day = dailyTimes[i];
      const isEvent = day === weddingDate;
      const sym = iconFor(code[i], true);

      rows.push(`
        <div class="wproDay ${isEvent ? "is-event" : ""}">
          <div>
            <div class="wproDay__d">${fmtShort(day, cfg.timezone)}</div>
            ${isEvent ? `<div class="wproDay__badge">Día del evento</div>` : ``}
          </div>
          <div class="wproDay__m">${labelFor(code[i])}</div>
          <div class="wproDay__r">
            <span class="wproMini"><svg><use href="${sym}"></use></svg></span>
            <span>${Math.round(tmin[i])}° / ${Math.round(tmax[i])}°</span>
            <span style="color:var(--wmuted);font-weight:800;">${popm?.[i] ?? "—"}%</span>
          </div>
        </div>
      `);
    }

    const html = rows.join("");
    if (elDaysDesktop) elDaysDesktop.innerHTML = html;
    if (elDaysMobile) elDaysMobile.innerHTML = html;
  }

  async function load() {
    const weddingDate = getWeddingDate();
    if (!weddingDate) {
      root.hidden = true;
      return;
    }

    const gate = Number(cfg.hideUntilDays ?? 16);
    const remaining = daysUntil(weddingDate);

    if (remaining > gate) {
      root.hidden = true;
      return;
    }

    const data = await fetchForecast();

    const dailyTimes = data.daily?.time || [];
    if (!dailyTimes.includes(weddingDate)) {
      root.hidden = true;
      return;
    }

    root.hidden = false;

    elCity.textContent = cfg.cityLabel || "—";
    elDate.textContent = fmtDate(weddingDate, cfg.timezone);
    elCer.textContent = cfg.ceremonyTime || "—";

    const idx = dailyTimes.indexOf(weddingDate);
    const tmax = data.daily.temperature_2m_max[idx];
    const tmin = data.daily.temperature_2m_min[idx];
    const pop = data.daily.precipitation_probability_max?.[idx];
    const wcode = data.daily.weather_code?.[idx];
    const wmax = data.daily.wind_speed_10m_max?.[idx];

    elBadge.textContent = "Día del evento";
    elTemp.textContent = Math.round((tmax + tmin) / 2);
    elDesc.textContent = labelFor(wcode);
    setIcon(iconFor(wcode, true));
    elRainProb.textContent = pop != null ? pop : "—";
    elWind.textContent = wmax != null ? Math.round(wmax) : "—";
    elHint.textContent = "Pronóstico estimado. Se afina conforme se acerque la fecha.";

    renderHours(pickHourlyWindow(data, weddingDate, cfg.ceremonyTime || "17:00"));
    renderWeek(data, weddingDate);
  }

  // ✅ init
  initTheme();

  themeToggle?.addEventListener("change", () => {
    setTheme(themeToggle.checked ? "light" : "dark", true); // aquí sí guardamos
  });

  btnRefresh?.addEventListener("click", () => load().catch(() => (root.hidden = true)));
  load().catch(() => (root.hidden = true));
})();