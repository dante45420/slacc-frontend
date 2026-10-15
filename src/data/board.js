// SLACC executive board. Shared by the Directiva page and the home page.
// `role` is the Spanish label and also the key under `directiva.roles.*` in the
// locale files. `photo` is null until a real portrait is available — the UI
// then shows the member's initials instead of a stock photo.
export const executiveBoard = [
  {
    name: "Dr. Dante Parodi",
    role: "Presidente",
    country: "Chile",
    photo: null,
  },
  {
    name: "Dr. Marcelo Queiroz",
    role: "1er. Vicepresidente",
    country: "Brasil",
    photo: null,
  },
  {
    name: "Dr. Ricardo Munafo",
    role: "2do vicepresidente",
    country: "Argentina",
    photo: "/directiva/Ricardo Munafo.jpeg",
  },
  {
    name: "Dr. Pablo Cornejo",
    role: "Secretario",
    country: "Ecuador",
    photo: "/directiva/Pablo Cornejo.jpeg",
  },
  {
    name: "Dr. Yuri Ochoa",
    role: "Tesorero",
    country: "Perú",
    photo: null,
  },
  {
    name: "Dr. Fidel Dobarganes",
    role: "Director internacional",
    country: "México",
    photo: "/directiva/Fidel Dobarganes.jpeg",
  },
  {
    name: "Dra. Daniela Seidel",
    role: "Directora Next Gen",
    country: "México",
    photo: null,
  },
];

/** "Dr. Dante Parodi" → "DP" */
export function initials(name) {
  return name
    .replace(/^(Dra?\.|Prof\.)\s+/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0].toUpperCase())
    .join("");
}

// Spanish country names in the data → ISO codes, so the UI can show them in
// the current language through Intl.DisplayNames (Brasil → Brazil…).
const COUNTRY_CODES = {
  argentina: "AR",
  bolivia: "BO",
  brasil: "BR",
  brazil: "BR",
  chile: "CL",
  colombia: "CO",
  "costa rica": "CR",
  cuba: "CU",
  ecuador: "EC",
  guatemala: "GT",
  mexico: "MX",
  panama: "PA",
  paraguay: "PY",
  peru: "PE",
  uruguay: "UY",
  venezuela: "VE",
};

export function normalizeName(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

const displayNamesCache = new Map();

/** Country label in the given UI language; falls back to the stored name. */
export function countryName(country, lang = "es") {
  const code = COUNTRY_CODES[normalizeName(country)];
  if (!code) return country;
  try {
    if (!displayNamesCache.has(lang)) {
      displayNamesCache.set(lang, new Intl.DisplayNames([lang], { type: "region" }));
    }
    return displayNamesCache.get(lang).of(code) || country;
  } catch {
    return country;
  }
}

// Some portraits are not square headshots: keep the face inside the circle.
// (Fidel Dobarganes' file is a tall phone screenshot and Pablo Cornejo's is
// off-centre; replace them with square headshots and delete these entries.)
const PHOTO_FRAMING = {
  "/directiva/Fidel Dobarganes.jpeg": {
    objectPosition: "50% 0%",
    transform: "scale(1.8)",
    transformOrigin: "50% 27%",
  },
  "/directiva/Pablo Cornejo.jpeg": {
    objectPosition: "50% 0%",
    transform: "scale(1.55)",
    transformOrigin: "66% 0%",
  },
};

/** Inline style that frames a portrait inside a circular avatar. */
export function photoStyle(photo) {
  return PHOTO_FRAMING[photo];
}
