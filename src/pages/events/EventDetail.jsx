import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Link, useLocation, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { apiGet } from "../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { Button, Section, Spinner } from "../../components/ui";
import EnrollmentModal from "../../components/events/EnrollmentModal.jsx";
import { EventMedia, KindBadge, PriceSummary, StatusBadge } from "../../components/events/EventParts.jsx";
import {
  enrollButtonLabel,
  formatHours,
  formatPrice,
  getEventKind,
  getEventStatus,
  getSchedule,
  getViewerPricing,
  isEnrollable,
  isHttpUrl,
  isLowSeats,
  seatsText,
  statusBadge,
} from "../../components/events/eventUtils";
import { initials } from "../../data/board";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { formatDate, formatDateTime, getDateLocale } from "../../utils/i18nLocale";
import { sanitizeHtml } from "../../utils/sanitize";

function Fact({ icon, label, children, className }) {
  return (
    <div className={`events-fact${className ? ` ${className}` : ""}`}>
      <dt>
        <i className={`events-fact__icon ${icon}`} aria-hidden="true"></i>
        {label}
      </dt>
      <dd>{children}</dd>
    </div>
  );
}

Fact.propTypes = {
  icon: PropTypes.string.isRequired,
  label: PropTypes.node.isRequired,
  children: PropTypes.node,
  className: PropTypes.string,
};

function Paragraphs({ text }) {
  return String(text)
    .split(/\n{2,}|\r\n\r\n/)
    .map(p => p.trim())
    .filter(Boolean)
    .map((p, i) => <p key={i}>{p}</p>);
}

Paragraphs.propTypes = { text: PropTypes.string.isRequired };

/** Zone of the event's times, plus the viewer's own clock when it differs. */
function ZoneLines({ zone }) {
  const { t } = useTranslation();
  if (!zone) return null;
  return (
    <>
      <span className="events-fact__sub events-fact__zone">
        {zone.label}
        {zone.offset && <span className="events-nowrap"> ({zone.offset})</span>}
      </span>
      {zone.local && (
        <span className="events-fact__sub">
          {t("events.your_local_time", "En tu zona horaria")}:{" "}
          {/* A bare time range wraps as one piece; one with dates may wrap inside. */}
          <span className={zone.local.short ? "events-nowrap" : undefined}>
            {zone.local.text}
            {zone.local.offset && <span className="events-nowrap"> ({zone.local.offset})</span>}
          </span>
        </span>
      )}
    </>
  );
}

ZoneLines.propTypes = {
  zone: PropTypes.shape({
    label: PropTypes.string.isRequired,
    offset: PropTypes.string,
    local: PropTypes.shape({ text: PropTypes.string.isRequired, offset: PropTypes.string, short: PropTypes.bool }),
  }),
};

/* Time zones --------------------------------------------------------------
 * start/end are wall-clock times in the event's own zone. The API names that
 * zone (`timezone`, e.g. "America/Santiago") and sends the same instants in
 * UTC (`*_utc`). Times are shown as entered, labelled with the zone, plus the
 * viewer's own clock when it differs. */

function viewerTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || null;
  } catch {
    return null;
  }
}

function zoneName(timeZone, locale, at, style) {
  try {
    const part = new Intl.DateTimeFormat(locale, { timeZone, timeZoneName: style })
      .formatToParts(at)
      .find(p => p.type === "timeZoneName");
    return part?.value || null;
  } catch {
    return null; // unknown zone, or a style the browser doesn't support
  }
}

function parseInstant(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function calendarDay(date, timeZone) {
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

function wallClock(date, timeZone) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);
}

/**
 * { label: "hora de Chile", offset: "GMT-3", local: { text: "15:42 – 17:42", offset: "GMT-6" } | null },
 * or null when the API doesn't say which zone the event is in.
 */
function getZoneInfo(event, lang, multiDay) {
  const timeZone = event.timezone;
  if (!timeZone) return null;
  const locale = getDateLocale(lang);
  const start = parseInstant(event.start_date_utc);
  const at = start || new Date();
  const label =
    zoneName(timeZone, locale, at, "longGeneric") ||
    zoneName(timeZone, locale, at, "long") ||
    timeZone.split("/").pop().replace(/_/g, " ");
  const offset = zoneName(timeZone, locale, at, "shortOffset");

  let local = null;
  const viewerZone = viewerTimeZone();
  if (start && viewerZone) {
    try {
      if (wallClock(start, timeZone) !== wallClock(start, viewerZone)) {
        const time = d => d.toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit" });
        const full = d =>
          d.toLocaleString(locale, { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
        const otherDay = multiDay || calendarDay(start, timeZone) !== calendarDay(start, viewerZone);
        let text = otherDay ? full(start) : time(start);
        const end = parseInstant(event.end_date_utc);
        if (!multiDay && end && end > start) {
          text += ` – ${calendarDay(end, viewerZone) === calendarDay(start, viewerZone) ? time(end) : full(end)}`;
        }
        local = { text, offset: zoneName(viewerZone, locale, start, "shortOffset"), short: !otherDay };
      }
    } catch {
      local = null;
    }
  }

  return { label, offset: offset && offset !== label ? offset : null, local };
}

/** Which row of the price table applies to the viewer (null = special rate). */
function currentPriceTier(pricing, event) {
  if (!pricing.isMemberPrice) return "general";
  if (pricing.tier === "joven") return event.price_joven > 0 ? "joven" : "normal";
  if (pricing.tier === "gratuito") return event.price_gratuito > 0 ? "gratuito" : null;
  return "normal";
}

export default function EventDetail() {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  const lang = i18n.language;

  const [state, setState] = useState({ id: null, status: "loading", event: null });
  const [reloadKey, setReloadKey] = useState(0);
  const [enrollOpen, setEnrollOpen] = useState(false);

  // Refetch when the signed-in identity changes (is_enrolled depends on it).
  const authKey = user === undefined ? undefined : user?.id ?? null;
  const lastAuthKey = useRef(authKey);
  useEffect(() => {
    if (lastAuthKey.current !== undefined && lastAuthKey.current !== authKey) {
      setReloadKey(k => k + 1);
    }
    lastAuthKey.current = authKey;
  }, [authKey]);

  useEffect(() => {
    let cancelled = false;
    setState(prev =>
      prev.id === id && prev.status === "ready" ? prev : { id, status: "loading", event: null },
    );
    apiGet(`/events/${id}`)
      .then(event => {
        if (!cancelled) setState({ id, status: "ready", event });
      })
      .catch(err => {
        if (cancelled) return;
        setState({ id, status: err?.status === 404 ? "not_found" : "error", event: null });
      });
    return () => {
      cancelled = true;
    };
  }, [id, reloadKey]);

  const event = state.id === id ? state.event : null;
  const status = state.id === id ? state.status : "loading";

  useDocumentTitle(
    event?.title ||
      (status === "not_found" ? t("events.detail_not_found") : undefined),
  );

  const listPath = location.pathname.startsWith("/cursos") ? "/cursos" : "/eventos";
  const backTo = typeof location.state?.from === "string" ? location.state.from : listPath;
  const backLabel =
    listPath === "/cursos"
      ? t("events.back_to_courses", "Volver a cursos y talleres")
      : t("events.back_to_events", "Volver a eventos");

  const backLink = (
    <Link to={backTo} className="back-link">
      <i className="fa-solid fa-arrow-left" aria-hidden="true"></i>
      {backLabel}
    </Link>
  );

  if (status === "loading") {
    return (
      <div className="page events-detail">
        <div className="page-loading">
          <Spinner size="lg" label={t("events.detail_loading")} />
        </div>
      </div>
    );
  }

  if (status !== "ready" || !event) {
    const notFound = status === "not_found";
    // Same look as the shared EmptyState, but this message is the whole page,
    // so its title is the page's h1 (EmptyState always renders an h3).
    return (
      <div className="page events-detail">
        <Section containerSize="sm">
          {backLink}
          <div className="empty-state events-state">
            <div className="empty-state-icon" aria-hidden="true">
              <i className={`fa-solid ${notFound ? "fa-calendar-xmark" : "fa-triangle-exclamation"}`}></i>
            </div>
            <h1 className="empty-state-title events-state__title">
              {notFound
                ? t("events.detail_not_found")
                : t("events.detail_load_error_title", "No pudimos cargar el evento")}
            </h1>
            <p className="empty-state-description">
              {notFound
                ? t(
                    "events.detail_not_found_text",
                    "Es posible que el evento haya sido retirado o que el enlace no sea correcto.",
                  )
                : t(
                    "events.load_error_text",
                    "Revisa tu conexión a internet e inténtalo nuevamente en unos segundos.",
                  )}
            </p>
            <div className="empty-state-action">
              {notFound ? (
                <Button to="/eventos">{t("events.see_all", "Ver todos los eventos")}</Button>
              ) : (
                <Button variant="outline" onClick={() => setReloadKey(k => k + 1)}>
                  <i className="fa-solid fa-rotate-right" aria-hidden="true"></i>
                  {t("events.retry", "Reintentar")}
                </Button>
              )}
            </div>
          </div>
        </Section>
      </div>
    );
  }

  const kind = getEventKind(event);
  const eventStatus = getEventStatus(event);
  const enrollable = isEnrollable(event, eventStatus);
  const schedule = getSchedule(event, lang);
  const zone = schedule ? getZoneInfo(event, lang, schedule.multiDay) : null;
  const pricing = getViewerPricing(event, user);
  const isWebinar = event.format === "webinar";
  const canSeeLink = isHttpUrl(event.location) && (event.is_enrolled || user?.role === "admin");
  const deadlineText = formatDate(event.registration_deadline, {}, lang);
  const duration = formatHours(event.duration_hours, t, lang);
  const seats = seatsText(event, t);
  const hasPrices = [event.price_member, event.price_non_member, event.price_joven].some(
    p => p !== null && p !== undefined,
  );

  let locationValue;
  if (isWebinar) {
    if (canSeeLink) {
      locationValue = (
        <a href={event.location.trim()} target="_blank" rel="noopener noreferrer" className="events-link">
          {t("events.join_link", "Abrir enlace de la sesión")}
          <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i>
          <span className="sr-only"> ({t("events.new_tab", "se abre en una pestaña nueva")})</span>
        </a>
      );
    } else {
      locationValue = (
        <span className="events-fact__muted">
          {t("events.link_for_enrolled", "El enlace se comparte con las personas inscritas.")}
        </span>
      );
    }
  } else {
    locationValue = event.location || t("common.tbd");
  }

  let cta;
  if (event.is_enrolled && eventStatus !== "ended") {
    cta = (
      <>
        <div className="events-detail-status events-detail-status--success" role="status">
          <i className="fa-solid fa-circle-check" aria-hidden="true"></i>
          <p>{t("events.already_enrolled")}</p>
        </div>
        {isWebinar && canSeeLink && (
          <Button
            variant="secondary"
            fullWidth
            href={event.location.trim()}
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="fa-solid fa-video" aria-hidden="true"></i>
            {t("events.join_link", "Abrir enlace de la sesión")}
            <span className="sr-only"> ({t("events.new_tab", "se abre en una pestaña nueva")})</span>
          </Button>
        )}
      </>
    );
  } else if (enrollable) {
    cta = (
      <>
        <Button size="lg" fullWidth className="events-enroll-btn" onClick={() => setEnrollOpen(true)}>
          <i className="fa-solid fa-pen-to-square" aria-hidden="true"></i>
          {t("events.enroll_event")}
        </Button>
        {deadlineText && (
          <p className="events-detail-hint">
            <i className="fa-regular fa-clock" aria-hidden="true"></i>
            {t("events.open_until", "Inscripciones abiertas hasta el {{date}}.", { date: deadlineText })}
          </p>
        )}
      </>
    );
  } else {
    let message = t("events.registration_ended");
    let icon = "fa-lock";
    if (eventStatus === "ended") {
      message = t("events.ended_text", "Este evento ya finalizó.");
      icon = "fa-flag-checkered";
    } else if (eventStatus === "in_progress") {
      message = t("events.in_progress_text", "Este evento está en curso; las inscripciones están cerradas.");
      icon = "fa-circle-play";
    } else if (eventStatus === "full") {
      message = t("events.err_full", "No quedan cupos disponibles para este evento.");
      icon = "fa-user-slash";
    } else if (eventStatus === "inactive") {
      message = t("events.err_inactive", "Este evento no está disponible para inscripciones.");
      icon = "fa-ban";
    }
    cta = (
      <>
        <div className="events-detail-status" role="status">
          <i className={`fa-solid ${icon}`} aria-hidden="true"></i>
          <p>{message}</p>
        </div>
        {eventStatus === "ended" ? (
          <Button variant="outline" fullWidth to="/eventos/proximos">
            {t("events.see_upcoming", "Ver próximos eventos")}
          </Button>
        ) : (
          <Button fullWidth disabled className="events-enroll-btn">
            {enrollButtonLabel(event, eventStatus, t)}
          </Button>
        )}
      </>
    );
  }

  const priceRows = [
    { key: "normal", label: t("events.price_members"), value: event.price_member },
    event.price_joven > 0 && { key: "joven", label: t("events.price_young"), value: event.price_joven },
    event.price_gratuito > 0 && {
      key: "gratuito",
      label: t("events.price_emeritus", "Socios eméritos"),
      value: event.price_gratuito,
    },
    { key: "general", label: t("events.price_non_members"), value: event.price_non_member },
  ].filter(Boolean);
  const currentTier = currentPriceTier(pricing, event);

  return (
    <div className={`page events-detail${eventStatus === "ended" ? " events-detail--ended" : ""}`}>
      <header className="page-hero events-detail-hero">
        <div className="page-hero__inner">
          {backLink}
          <div className="events-detail-hero__badges">
            <KindBadge kind={kind} />
            <StatusBadge badge={statusBadge(event, eventStatus, t)} />
          </div>
          <h1 className="page-hero-title events-detail-hero__title">{event.title}</h1>
          <ul className="events-detail-when">
            <li>
              <i className="fa-regular fa-calendar" aria-hidden="true"></i>
              <span>{schedule ? schedule.dateText : t("events.date_tbc", "Fecha por confirmar")}</span>
            </li>
            {schedule && (
              <li>
                <i className="fa-regular fa-clock" aria-hidden="true"></i>
                <span>
                  {schedule.timeText}
                  {zone && <span className="events-detail-when__zone"> ({zone.label})</span>}
                </span>
              </li>
            )}
            <li>
              <i className={`fa-solid ${isWebinar ? "fa-video" : "fa-location-dot"}`} aria-hidden="true"></i>
              <span>{isWebinar ? t("events.online", "En línea") : event.location || t("common.tbd")}</span>
            </li>
          </ul>
        </div>
      </header>

      <Section className="events-detail-body">
        <div className="events-detail-layout">
          <aside
            className="events-detail-aside"
            aria-label={t("events.enrollment_panel", "Inscripción y detalles")}
          >
            <div className="events-detail-card">
              {eventStatus !== "ended" && (
                <div className="events-detail-card__price">
                  <PriceSummary pricing={pricing} size="lg" />
                </div>
              )}
              <div className="events-detail-card__cta">{cta}</div>

              <div className="events-detail-card__section">
                <h2 className="events-detail-card__heading">{t("events.details_title", "Detalles")}</h2>
                <dl className="events-facts">
                  {schedule?.multiDay ? (
                    <>
                      <Fact icon="fa-regular fa-calendar" label={t("events.start")}>
                        {formatDateTime(event.start_date, lang)}
                        <ZoneLines zone={zone} />
                      </Fact>
                      <Fact icon="fa-regular fa-calendar-check" label={t("events.end")}>
                        {formatDateTime(event.end_date, lang)}
                      </Fact>
                    </>
                  ) : (
                    <>
                      <Fact icon="fa-regular fa-calendar" label={t("events.date_label", "Fecha")} className="is-capitalized">
                        {schedule ? schedule.dateText : t("common.tbc")}
                      </Fact>
                      {schedule && (
                        <Fact icon="fa-regular fa-clock" label={t("events.time_label", "Horario")}>
                          {schedule.timeText}
                          <ZoneLines zone={zone} />
                        </Fact>
                      )}
                    </>
                  )}
                  {duration && (
                    <Fact icon="fa-solid fa-hourglass-half" label={t("events.duration")}>
                      {duration}
                    </Fact>
                  )}
                  <Fact
                    icon={`fa-solid ${isWebinar ? "fa-video" : "fa-location-dot"}`}
                    label={t("events.format_label")}
                  >
                    {isWebinar ? t("events.format_webinar") : t("events.format_in_person")}
                    {(!isWebinar || eventStatus !== "ended" || canSeeLink) && (
                      <span className="events-fact__sub">{locationValue}</span>
                    )}
                  </Fact>
                  {event.instructor && (
                    <Fact icon="fa-solid fa-user-doctor" label={t("events.instructor")}>
                      {event.instructor}
                    </Fact>
                  )}
                  {seats && eventStatus !== "ended" && (
                    <Fact
                      icon="fa-solid fa-users"
                      label={t("events.capacity")}
                      className={isLowSeats(event) || event.seats_left === 0 ? "is-low" : undefined}
                    >
                      {seats}
                      {typeof event.seats_left === "number" && (
                        <span className="events-fact__sub">
                          {t("events.seats_of_total", "de {{total}} en total", { total: event.max_students })}
                        </span>
                      )}
                    </Fact>
                  )}
                  {deadlineText && eventStatus !== "ended" && (
                    <Fact
                      icon="fa-solid fa-lock-open"
                      label={t("events.registration_until")}
                      className={eventStatus === "closed" ? "is-closed" : undefined}
                    >
                      {deadlineText}
                      {eventStatus === "closed" && ` (${t("common.closed_paren")})`}
                    </Fact>
                  )}
                </dl>
              </div>
            </div>
          </aside>

          <div className="events-detail-main">
            <EventMedia event={event} kind={kind} variant="cover" alt={event.title} />

            <section className="events-detail-section" aria-labelledby="events-about-title">
              <h2 id="events-about-title" className="events-detail-section__title">
                {t("events.description_title")}
              </h2>
              {event.description || event.content ? (
                <div className="prose events-detail-prose">
                  {event.description && <Paragraphs text={event.description} />}
                  {event.content && (
                    <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(event.content) }} />
                  )}
                </div>
              ) : (
                <p className="events-detail-muted">
                  {t("events.no_description", "Pronto publicaremos el programa detallado de esta actividad.")}
                </p>
              )}
            </section>

            {hasPrices && eventStatus !== "ended" && (
              <section className="events-detail-section events-detail-rates" aria-labelledby="events-rates-title">
                <h2 id="events-rates-title" className="events-detail-section__title">
                  {t("events.pricing_title")}
                </h2>
                <ul className={`events-rates events-rates--${priceRows.length}`}>
                  {priceRows.map(row => (
                    <li
                      key={row.key}
                      className={`events-rate${row.key === currentTier ? " is-current" : ""}`}
                    >
                      <span className="events-rate__label">{row.label}</span>
                      <span className="events-rate__amount">{formatPrice(row.value, lang, t)}</span>
                      {row.key === currentTier && (
                        <span className="events-rate__you">
                          <i className="fa-solid fa-check" aria-hidden="true"></i>
                          {t("events.your_rate", "Tu valor")}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
                <p className="events-rates__note">
                  {t("events.rates_note", "El valor socio aplica a socios con la cuota al día.")}
                </p>
              </section>
            )}

            {event.instructor && (
              <section className="events-detail-section" aria-labelledby="events-instructor-title">
                <h2 id="events-instructor-title" className="events-detail-section__title">
                  {t("events.instructor_title")}
                </h2>
                <div className="events-instructor">
                  <span className="avatar events-instructor__avatar" aria-hidden="true">
                    {initials(event.instructor) || <i className="fa-solid fa-user-doctor"></i>}
                  </span>
                  <div className="events-instructor__text">
                    <p className="events-instructor__name">{event.instructor}</p>
                    <p className="events-instructor__role">{kindLabelFor(kind, t)}</p>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </Section>

      {enrollOpen && (
        <EnrollmentModal
          event={event}
          onClose={() => setEnrollOpen(false)}
          onEnrolled={() => setReloadKey(k => k + 1)}
        />
      )}
    </div>
  );
}

function kindLabelFor(kind, t) {
  return kind === "webinar"
    ? t("events.instructor_role_webinar", "Expositor del webinar")
    : t("events.instructor_role", "A cargo de la actividad");
}
