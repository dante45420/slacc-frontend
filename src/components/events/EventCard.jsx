import PropTypes from "prop-types";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../auth/AuthContext";
import Button from "../ui/Button.jsx";
import { EventMedia, KindBadge, PriceSummary, StatusBadge } from "./EventParts.jsx";
import {
  enrollButtonLabel,
  formatHours,
  getDateParts,
  getEventKind,
  getEventStatus,
  getSchedule,
  getViewerPricing,
  isEnrollable,
  isLowSeats,
  seatsText,
  statusBadge,
} from "./eventUtils";

export default function EventCard({ event, detailPath, onEnroll }) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const location = useLocation();
  const lang = i18n.language;

  const kind = getEventKind(event);
  const status = getEventStatus(event);
  const ended = status === "ended";
  const enrollable = isEnrollable(event, status);
  const date = getDateParts(event.start_date, lang);
  const schedule = getSchedule(event, lang);
  const titleId = `event-card-${event.id}-title`;
  const linkState = { from: location.pathname };

  const when = schedule
    ? [schedule.multiDay ? schedule.shortDate : schedule.timeText, formatHours(event.duration_hours, t, lang)]
        .filter(Boolean)
        .join(" · ")
    : t("events.date_tbc", "Fecha por confirmar");
  // Full events already say so in the badge and the button.
  const seats = !ended && status !== "full" ? seatsText(event, t) : null;

  return (
    <article
      className={`events-card${ended ? " events-card--ended" : ""}`}
      aria-labelledby={titleId}
    >
      <EventMedia event={event} kind={kind}>
        {date && (
          <time className="events-date" dateTime={String(event.start_date).slice(0, 19)}>
            <span className="events-date__day">{date.day}</span>
            <span className="events-date__month">{date.month}</span>
            <span className="events-date__year">{date.year}</span>
          </time>
        )}
      </EventMedia>

      <div className="events-card__body">
        <div className="events-card__tags">
          <KindBadge kind={kind} />
          <StatusBadge badge={statusBadge(event, status, t)} />
        </div>

        <h3 className="events-card__title" id={titleId}>
          <Link to={detailPath} state={linkState}>
            {event.title}
          </Link>
        </h3>

        {event.description && <p className="events-card__desc">{event.description}</p>}

        <ul className="events-card__facts">
          <li>
            <i className="fa-regular fa-clock" aria-hidden="true"></i>
            <span>{when}</span>
          </li>
          <li>
            <i
              className={`fa-solid ${event.format === "webinar" ? "fa-video" : "fa-location-dot"}`}
              aria-hidden="true"
            ></i>
            <span>
              {event.format === "webinar"
                ? t("events.online", "En línea")
                : event.location || t("common.tbd")}
            </span>
          </li>
          {event.instructor && (
            <li>
              <i className="fa-solid fa-user-doctor" aria-hidden="true"></i>
              <span>{event.instructor}</span>
            </li>
          )}
          {seats && (
            <li className={isLowSeats(event) ? "is-low" : undefined}>
              <i className="fa-solid fa-users" aria-hidden="true"></i>
              <span>{seats}</span>
            </li>
          )}
        </ul>
      </div>

      <div className="events-card__footer">
        {!ended && <PriceSummary pricing={getViewerPricing(event, user)} />}
        <div className="events-card__actions">
          <Button
            variant="outline"
            to={detailPath}
            state={linkState}
            aria-describedby={titleId}
          >
            {t("events.view_detail", "Ver detalle")}
          </Button>
          {!ended && (
            <Button
              className={`events-enroll-btn${event.is_enrolled ? " is-enrolled" : ""}`}
              onClick={() => onEnroll(event)}
              disabled={!enrollable}
              aria-describedby={titleId}
            >
              {event.is_enrolled && <i className="fa-solid fa-check" aria-hidden="true"></i>}
              {enrollable ? t("events.enroll") : enrollButtonLabel(event, status, t)}
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}

EventCard.propTypes = {
  event: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    instructor: PropTypes.string,
    duration_hours: PropTypes.number,
    format: PropTypes.string,
    location: PropTypes.string,
    image_url: PropTypes.string,
    start_date: PropTypes.string,
    end_date: PropTypes.string,
    max_students: PropTypes.number,
    seats_left: PropTypes.number,
    is_enrolled: PropTypes.bool,
  }).isRequired,
  detailPath: PropTypes.string.isRequired,
  onEnroll: PropTypes.func.isRequired,
};
