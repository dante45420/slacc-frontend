import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { apiGet } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { getDateLocale } from "../utils/i18nLocale";
import { Button, EmptyState } from "./ui";
import { EventMedia, KindBadge, StatusBadge } from "./events/EventParts.jsx";
import {
  formatPrice,
  getDateParts,
  getEventKind,
  getEventStatus,
  getSchedule,
  getViewerPricing,
  statusBadge,
} from "./events/eventUtils";
import Rail from "./home/Rail.jsx";

/**
 * Compact event card for the home page. Kind badge, status badge, branded
 * placeholder, date tile, schedule and price all come from the events area
 * helpers, so an event looks the same here and on /eventos.
 */
function EventCard({ event }) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const lang = i18n.language;
  const kind = getEventKind(event);
  const status = getEventStatus(event);
  const date = getDateParts(event.start_date, lang); // wall-clock time
  const schedule = getSchedule(event, lang);
  const isOnline = event.format === "webinar";

  let when = t("events.date_tbc", "Fecha por confirmar");
  if (schedule?.multiDay) {
    when = schedule.shortDate;
  } else if (date) {
    const locale = getDateLocale(lang);
    const weekday = date.date.toLocaleDateString(locale, { weekday: "long" });
    // A start at exactly 00:00 is a date-only value: don't show "0:00".
    const allDay = date.date.getHours() === 0 && date.date.getMinutes() === 0;
    when = `${weekday.charAt(0).toLocaleUpperCase(locale)}${weekday.slice(1)}${
      allDay ? "" : ` · ${schedule.timeText}`
    }`;
  }
  // Webinar "locations" are meeting URLs: never show them publicly.
  const place = isOnline ? t("events.online", "En línea") : event.location;
  const pricing = getViewerPricing(event, user);
  const price = formatPrice(pricing.price, lang, t);

  return (
    <article className="home-event-card">
      <Link to={`/eventos/${event.id}`} className="home-event-card__link">
        <EventMedia event={event} kind={kind}>
          {date && (
            <time className="events-date" dateTime={String(event.start_date).slice(0, 19)}>
              <span className="events-date__day">{date.day}</span>
              <span className="events-date__month">{date.month}</span>
              <span className="events-date__year">{date.year}</span>
            </time>
          )}
        </EventMedia>

        <div className="home-event-card__body">
          <div className="home-event-card__tags">
            <KindBadge kind={kind} />
            <StatusBadge badge={statusBadge(event, status, t)} />
          </div>
          <h3 className="home-event-card__title">{event.title}</h3>
          {event.description && (
            <p className="home-event-card__excerpt">{event.description}</p>
          )}
          <ul className="home-event-card__facts">
            <li>
              <i className="fa-regular fa-clock" aria-hidden="true"></i>
              <span>{when}</span>
            </li>
            {place && (
              <li>
                <i
                  className={`fa-solid ${isOnline ? "fa-video" : "fa-location-dot"}`}
                  aria-hidden="true"
                ></i>
                <span>{place}</span>
              </li>
            )}
          </ul>
        </div>

        <div className="home-event-card__footer">
          {price && (
            <p className="home-event-card__price">
              <span className="home-event-card__price-label">
                {pricing.isMemberPrice
                  ? t("events.your_member_price", "Tu valor socio")
                  : t("events.general_price", "Valor general")}
              </span>
              <span className="home-event-card__price-amount">{price}</span>
            </p>
          )}
          <span className="home-event-card__cta">
            {t("home.event_cta", "Ver evento")}
            <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
          </span>
        </div>
      </Link>
    </article>
  );
}

EventCard.propTypes = {
  event: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    title: PropTypes.string,
    description: PropTypes.string,
    format: PropTypes.string,
    location: PropTypes.string,
    image_url: PropTypes.string,
    start_date: PropTypes.string,
    end_date: PropTypes.string,
    price_member: PropTypes.number,
    price_non_member: PropTypes.number,
  }).isRequired,
};

function EventCardSkeleton() {
  return (
    <div className="home-skeleton" aria-hidden="true">
      <div className="home-skeleton__media" />
      <div className="home-skeleton__body">
        <span className="home-skeleton__line home-skeleton__line--short" />
        <span className="home-skeleton__line home-skeleton__line--title" />
        <span className="home-skeleton__line" />
        <span className="home-skeleton__line home-skeleton__line--mid" />
      </div>
    </div>
  );
}

/**
 * Upcoming events for the home page: up to `limit` cards (3-up on wide
 * screens, a swipeable rail on phones) with loading, empty and error states.
 */
export default function EventsCarousel({ limit = 3 }) {
  const { t } = useTranslation();
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState("loading");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    apiGet("/events")
      .then(data => {
        if (cancelled) return;
        setEvents(Array.isArray(data) ? data : []);
        setStatus("ready");
      })
      .catch(() => {
        if (cancelled) return;
        setEvents([]);
        setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  if (status === "loading") {
    return (
      <div aria-busy="true">
        <span className="sr-only" role="status">
          {t("events.loading", "Cargando eventos...")}
        </span>
        <Rail variant="cards" bleed>
          <EventCardSkeleton />
          <EventCardSkeleton />
          <EventCardSkeleton />
        </Rail>
      </div>
    );
  }

  if (status === "error") {
    return (
      <EmptyState
        className="home-state"
        icon={<i className="fa-solid fa-triangle-exclamation"></i>}
        title={t("home.events_error_title", "No pudimos cargar los eventos")}
        description={t("home.load_error_desc", "Revisa tu conexión e inténtalo nuevamente.")}
        action={
          <Button variant="outline" onClick={() => setReloadKey(k => k + 1)}>
            <i className="fa-solid fa-rotate-right" aria-hidden="true"></i>
            {t("home.retry", "Reintentar")}
          </Button>
        }
      />
    );
  }

  const upcoming = events.slice(0, limit);

  if (upcoming.length === 0) {
    return (
      <EmptyState
        className="home-state"
        icon={<i className="fa-regular fa-calendar"></i>}
        title={t("home.events_empty_title", "No hay eventos próximos por ahora")}
        description={t(
          "home.events_empty_desc",
          "Pronto publicaremos nuevas actividades. Mientras tanto, puedes revisar los eventos anteriores.",
        )}
        action={
          <Button variant="outline" to="/eventos/pasados">
            {t("home.events_past_btn", "Ver eventos anteriores")}
          </Button>
        }
      />
    );
  }

  return (
    <Rail variant="cards" bleed label={t("home.sponsored_events", "Próximos eventos")}>
      {upcoming.map(event => (
        <EventCard key={event.id} event={event} />
      ))}
    </Rail>
  );
}

EventsCarousel.propTypes = {
  limit: PropTypes.number,
};
