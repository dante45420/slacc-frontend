import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import { Section, PageHero, Button, Spinner } from "../ui";
import { apiGet } from "../../api/client";
import { currentLanguage } from "../../i18n";
import { formatDate, getDateLocale, parseApiDate } from "../../utils/i18nLocale";
import { CONTACT_EMAIL } from "./contactInfo";

// Congreso / Congress / Congresso
const CONGRESS_RE = /congres/i;
const UPCOMING_LIMIT = 4;

const SECTIONS = [
  {
    id: "about",
    to: "/nosotros",
    icon: "fa-landmark",
    title: { en: "About the Society", pt: "A Sociedade" },
    text: {
      en: "Mission, board of directors, history, committees and statutes.",
      pt: "Missão, diretoria, história, comitês e estatutos.",
    },
  },
  {
    id: "education",
    to: "/educacion",
    icon: "fa-graduation-cap",
    title: { en: "Education and Fellowships", pt: "Educação e Fellowships" },
    text: {
      en: "Training standards, fellowships and the members' virtual classroom.",
      pt: "Padrões de formação, fellowships e a sala de aula virtual para sócios.",
    },
  },
  {
    id: "events",
    to: "/eventos",
    icon: "fa-calendar-days",
    title: { en: "Scientific Events", pt: "Eventos Científicos" },
    text: {
      en: "Congresses, courses and webinars across Latin America.",
      pt: "Congressos, cursos e webinars em toda a América Latina.",
    },
  },
  {
    id: "membership",
    to: "/por-que-ser-socio",
    icon: "fa-id-card",
    title: { en: "Membership", pt: "Associação" },
    text: {
      en: "Benefits of joining SLACC and how to apply.",
      pt: "Benefícios de se associar à SLACC e como se candidatar.",
    },
  },
  {
    id: "news",
    to: "/noticias",
    icon: "fa-newspaper",
    title: { en: "News and Publications", pt: "Notícias e Publicações" },
    text: {
      en: "Scientific articles, featured articles and editorials.",
      pt: "Artigos científicos, artigos em destaque e editoriais.",
    },
  },
  {
    id: "contact",
    to: "/contacto",
    icon: "fa-envelope",
    title: { en: "Contact", pt: "Contato" },
    text: {
      en: "Write to the SLACC Secretariat at {{email}}.",
      pt: "Escreva para a Secretaria da SLACC em {{email}}.",
    },
  },
];

const isUrl = value => /^https?:\/\//i.test(String(value || "").trim());

// A webinar's location holds the meeting link / access data (EventForm labels
// it "Enlace de conexión"), so it is never shown publicly; same rule as
// EventCard. Physical locations that happen to be URLs are hidden too.
const publicPlace = ev =>
  !ev || ev.format === "webinar" || isUrl(ev.location) ? null : ev.location || null;

/**
 * Landing page for foreign visitors (/en, /pt). The copy is always rendered in
 * the landing's own language (fixed translator), and visiting the page switches
 * the site UI (header, footer, <html lang>) to that language.
 */
export default function IntlLanding({ lang }) {
  const { i18n } = useTranslation();
  const t = useMemo(() => i18n.getFixedT(lang), [i18n, lang]);
  // Translate with a fallback in this landing's language until the key exists.
  const tx = (key, defaults, options = {}) =>
    t(`intl_landing.${key}`, { defaultValue: defaults[lang] ?? defaults.en, ...options });

  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState("loading");

  // Switch the site UI to the landing's language once per visit. react-i18next
  // hands out a new `i18n` wrapper on every language change, so without the
  // guard this effect would re-run and undo any later switch (the footer
  // ES/EN/PT buttons, or "View the site in Spanish" below).
  const forcedLangRef = useRef(null);
  useEffect(() => {
    if (forcedLangRef.current === lang) return;
    forcedLangRef.current = lang;
    if (currentLanguage(i18n) !== lang) {
      i18n.changeLanguage(lang);
    }
  }, [i18n, lang]);

  const pageTitle = tx("hero_title", {
    en: "Latin American Hip Surgery Society",
    pt: "Sociedade Latino-Americana de Cirurgia do Quadril",
  });

  useEffect(() => {
    document.title = `${pageTitle} · SLACC`;
  }, [pageTitle, i18n.language]);

  useEffect(() => {
    let cancelled = false;
    apiGet("/events?past=false")
      .then(data => {
        if (cancelled) return;
        const list = Array.isArray(data) ? data : [];
        list.sort(
          (a, b) =>
            (parseApiDate(a.start_date)?.getTime() ?? Infinity) -
            (parseApiDate(b.start_date)?.getTime() ?? Infinity),
        );
        setEvents(list);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const congress = events.find(ev => CONGRESS_RE.test(ev.title || ""));
  const upcoming = events.filter(ev => ev !== congress).slice(0, UPCOMING_LIMIT);

  const goSpanish = () => {
    i18n.changeLanguage("es");
  };

  const formatLabel = ev => {
    if (ev.format === "webinar") return t("events.format_webinar");
    if (ev.format === "presencial") return t("events.format_in_person");
    return null;
  };

  const eventMeta = ev => [formatLabel(ev), publicPlace(ev)].filter(Boolean).join(" · ");

  const dateParts = value => {
    const date = parseApiDate(value);
    if (!date) return null;
    const locale = getDateLocale(lang);
    return {
      day: date.toLocaleDateString(locale, { day: "2-digit" }),
      month: date.toLocaleDateString(locale, { month: "short" }).replace(".", ""),
      full: formatDate(value, {}, lang),
    };
  };

  const congressDate = congress ? formatDate(congress.start_date, {}, lang) : null;

  return (
    <div className="page intl-page" lang={lang}>
      <PageHero
        className="intl-hero"
        kicker={tx("hero_kicker", { en: "SLACC International", pt: "SLACC Internacional" })}
        title={pageTitle}
        subtitle={tx("hero_subtitle", {
          en: "The scientific society that brings together hip surgeons from across Latin America to advance education, research and clinical excellence.",
          pt: "A sociedade científica que reúne cirurgiões de quadril de toda a América Latina para promover a educação, a pesquisa e a excelência clínica.",
        })}
      >
        <div className="page-hero__actions">
          <Button to="/eventos/proximos" size="lg">
            <i className="fa-regular fa-calendar" aria-hidden="true"></i>
            {tx("cta_events", { en: "Upcoming events", pt: "Próximos eventos" })}
          </Button>
          <Button to="/solicitar-membresia" variant="outline" size="lg">
            {tx("cta_join", { en: "Become a member", pt: "Seja sócio" })}
          </Button>
        </div>
        <p className="intl-hero__note">
          <i className="fa-solid fa-language" aria-hidden="true"></i>
          <span>
            {tx("lang_note", {
              en: "Most of our website is in Spanish. This page summarises the essentials in English.",
              pt: "A maior parte do nosso site está em espanhol. Esta página resume o essencial em português.",
            })}{" "}
            <Link to="/" onClick={goSpanish} className="intl-hero__switch">
              {tx("view_spanish", { en: "View the site in Spanish", pt: "Ver o site em espanhol" })}
            </Link>
          </span>
        </p>
      </PageHero>

      <Section className="intl-sections">
        <div className="section-head">
          <div className="section-head__text">
            <p className="eyebrow">
              {tx("sections_eyebrow", { en: "Main sections", pt: "Seções principais" })}
            </p>
            <h2 className="section-title">
              {tx("sections_heading", { en: "Explore the society", pt: "Conheça a sociedade" })}
            </h2>
            <p className="section-lead">
              {tx("sections_lead", {
                en: "Find your way around the main areas of the SLACC website.",
                pt: "Navegue pelas principais áreas do site da SLACC.",
              })}
            </p>
          </div>
        </div>

        <ul className="intl-grid">
          {SECTIONS.map(section => (
            <li key={section.id}>
              <Link to={section.to} className="card card-hoverable intl-card">
                <span className="icon-tile" aria-hidden="true">
                  <i className={`fa-solid ${section.icon}`}></i>
                </span>
                <span className="intl-card__body">
                  <span className="intl-card__title">
                    {tx(`section_${section.id}_title`, section.title)}
                  </span>
                  <span className="intl-card__text">
                    {tx(`section_${section.id}_text`, section.text, { email: CONTACT_EMAIL })}
                  </span>
                </span>
                <span className="link-arrow intl-card__more">
                  <span className="intl-card__more-label">
                    {tx("section_more", { en: "Learn more", pt: "Saiba mais" })}
                  </span>
                  <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <Section variant="surface" className="intl-events">
        <div className="section-head">
          <div className="section-head__text">
            <p className="eyebrow">
              {tx("events_eyebrow", { en: "Congress and events", pt: "Congresso e eventos" })}
            </p>
            <h2 className="section-title">
              {tx("events_heading", { en: "What's coming up", pt: "Próximas atividades" })}
            </h2>
          </div>
          <Button to="/eventos" variant="outline">
            {tx("upcoming_all", { en: "See all events", pt: "Ver todos os eventos" })}
          </Button>
        </div>

        <div className="intl-events__grid">
          <article className="intl-congress">
            <p className="eyebrow intl-congress__label">
              {tx("congress_label", { en: "Main congress", pt: "Congresso principal" })}
            </p>
            <h3 className="intl-congress__title">
              {status === "loading" ? (
                <>
                  <span className="intl-congress__skeleton" aria-hidden="true"></span>
                  <span className="sr-only">
                    {tx("upcoming_loading", { en: "Loading events…", pt: "Carregando eventos…" })}
                  </span>
                </>
              ) : (
                congress?.title ||
                tx("congress_fallback", {
                  en: "SLACC Latin American Congress",
                  pt: "Congresso Latino-Americano SLACC",
                })
              )}
            </h3>
            {status === "ready" && (
              <ul className="intl-congress__meta">
                <li>
                  <i className="fa-regular fa-calendar" aria-hidden="true"></i>
                  {congressDate ||
                    tx("congress_tba", { en: "Dates to be announced", pt: "Datas a confirmar" })}
                </li>
                {congress?.format === "webinar" ? (
                  <li>
                    <i className="fa-solid fa-video" aria-hidden="true"></i>
                    {t("events.online", { defaultValue: lang === "pt" ? "On-line" : "Online" })}
                  </li>
                ) : (
                  publicPlace(congress) && (
                    <li>
                      <i className="fa-solid fa-location-dot" aria-hidden="true"></i>
                      {publicPlace(congress)}
                    </li>
                  )
                )}
              </ul>
            )}
            <p className="intl-congress__text">
              {tx("congress_text", {
                en: "Follow congress updates, abstract submissions and the registration timeline in our Events section.",
                pt: "Acompanhe as novidades do congresso, o envio de trabalhos e o cronograma de inscrições na seção de Eventos.",
              })}
            </p>
            <div className="intl-congress__actions">
              <Button
                to={congress ? `/eventos/${congress.id}` : "/eventos/proximos"}
                variant="inverse"
              >
                {tx("congress_btn", { en: "View congress info", pt: "Ver informações do congresso" })}
                <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
              </Button>
            </div>
          </article>

          <div className="intl-upcoming">
            <h3 className="intl-upcoming__title">
              {tx("upcoming_title", { en: "Upcoming events", pt: "Próximos eventos" })}
            </h3>

            {status === "loading" && (
              <div className="intl-status">
                <Spinner
                  size="sm"
                  label={tx("upcoming_loading", { en: "Loading events…", pt: "Carregando eventos…" })}
                />
                <span aria-hidden="true">
                  {tx("upcoming_loading", { en: "Loading events…", pt: "Carregando eventos…" })}
                </span>
              </div>
            )}

            {status === "error" && (
              <p className="intl-status intl-status--error" role="alert">
                <i className="fa-solid fa-circle-exclamation" aria-hidden="true"></i>
                {tx("upcoming_error", {
                  en: "We couldn't load the events right now. Please try again later.",
                  pt: "Não foi possível carregar os eventos agora. Tente novamente mais tarde.",
                })}
              </p>
            )}

            {status === "ready" && upcoming.length === 0 && (
              <p className="intl-status">
                <i className="fa-regular fa-calendar-xmark" aria-hidden="true"></i>
                {tx("upcoming_empty", {
                  en: "No upcoming events have been announced yet.",
                  pt: "Ainda não há próximos eventos anunciados.",
                })}
              </p>
            )}

            {status === "ready" && upcoming.length > 0 && (
              <ul className="intl-upcoming__list">
                {upcoming.map(ev => {
                  const parts = dateParts(ev.start_date);
                  const meta = eventMeta(ev);
                  return (
                    <li key={ev.id}>
                      <Link to={`/eventos/${ev.id}`} className="intl-event">
                        <span className="intl-event__date" aria-hidden={parts ? "true" : undefined}>
                          {parts ? (
                            <>
                              <span className="intl-event__day">{parts.day}</span>
                              <span className="intl-event__month">{parts.month}</span>
                            </>
                          ) : (
                            <i className="fa-regular fa-calendar" aria-hidden="true"></i>
                          )}
                        </span>
                        <span className="intl-event__body">
                          <span className="intl-event__title">{ev.title}</span>
                          <span className="intl-event__meta">
                            {parts && <span className="sr-only">{parts.full}. </span>}
                            {meta}
                          </span>
                        </span>
                        <i className="fa-solid fa-chevron-right intl-event__arrow" aria-hidden="true"></i>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </Section>
    </div>
  );
}

IntlLanding.propTypes = {
  lang: PropTypes.oneOf(["en", "pt"]).isRequired,
};
