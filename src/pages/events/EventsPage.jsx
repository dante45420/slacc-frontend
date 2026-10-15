import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { apiGet } from "../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { Button, PageHero, Section, Spinner } from "../../components/ui";
import EventCard from "../../components/events/EventCard.jsx";
import EnrollmentModal from "../../components/events/EnrollmentModal.jsx";
import { isCourseLike } from "../../components/events/eventUtils";
import useDocumentTitle from "../../hooks/useDocumentTitle";

/**
 * One page, five views. "upcoming" and "past" are separate API scopes, so the
 * views that show both ("all", webinars, courses) request each scope.
 */
const VIEWS = [
  { key: "all", path: "/eventos", scopes: ["upcoming", "past"] },
  { key: "upcoming", path: "/eventos/proximos", scopes: ["upcoming"] },
  { key: "webinars", path: "/eventos/webinars", scopes: ["upcoming", "past"], type: "webinar" },
  {
    key: "courses",
    path: "/cursos",
    scopes: ["upcoming", "past"],
    type: "presencial",
    match: isCourseLike,
  },
  { key: "past", path: "/eventos/pasados", scopes: ["past"] },
];

function resolveView(pathname) {
  const path = pathname.replace(/\/+$/, "") || "/";
  return VIEWS.find(v => v.path === path) || VIEWS[0];
}

function viewCopy(key, t) {
  switch (key) {
    case "upcoming":
      return {
        label: t("header.upcoming_events"),
        title: t("events.view_upcoming_title", "Próximos eventos"),
        subtitle: t(
          "events.view_upcoming_subtitle",
          "Webinars, cursos y congresos con inscripciones abiertas para socios y profesionales de la región.",
        ),
      };
    case "webinars":
      return {
        label: t("header.webinars"),
        title: t("header.webinars"),
        subtitle: t(
          "events.view_webinars_subtitle",
          "Sesiones en línea con especialistas latinoamericanos en cirugía de cadera.",
        ),
      };
    case "courses":
      return {
        label: t("events.filter_courses", "Cursos y talleres"),
        title: t("events.filter_courses", "Cursos y talleres"),
        subtitle: t(
          "events.view_courses_subtitle",
          "Formación presencial y práctica quirúrgica guiada por expertos de la región.",
        ),
      };
    case "past":
      return {
        label: t("header.past_events"),
        title: t("events.view_past_title", "Eventos realizados"),
        subtitle: t(
          "events.view_past_subtitle",
          "Archivo de las actividades académicas que SLACC ha organizado.",
        ),
      };
    default:
      return {
        label: t("header.all_events"),
        title: t("events.title"),
        subtitle: t("events.subtitle"),
      };
  }
}

/**
 * Same look as the shared EmptyState, but with an h2 title: these messages sit
 * right under the page's h1 (EmptyState always renders an h3).
 */
function StateMessage({ icon, title, description, action }) {
  return (
    <div className="empty-state events-state">
      <div className="empty-state-icon" aria-hidden="true">
        <i className={icon}></i>
      </div>
      <h2 className="empty-state-title events-state__title">{title}</h2>
      {description && <p className="empty-state-description">{description}</p>}
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  );
}

StateMessage.propTypes = {
  icon: PropTypes.string.isRequired,
  title: PropTypes.node.isRequired,
  description: PropTypes.node,
  action: PropTypes.node,
};

function fetchScope(scope, type) {
  const params = new URLSearchParams();
  if (scope === "past") params.set("past", "true");
  if (type) params.set("type", type);
  const query = params.toString();
  return apiGet(`/events${query ? `?${query}` : ""}`);
}

export default function EventsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const location = useLocation();
  const view = resolveView(location.pathname);
  const copy = viewCopy(view.key, t);
  useDocumentTitle(copy.title);

  const [data, setData] = useState({ viewKey: null, status: "loading", upcoming: [], past: [] });
  const [reloadKey, setReloadKey] = useState(0);
  const [enrollEvent, setEnrollEvent] = useState(null);

  // Refetch when the signed-in identity changes (enrollment flags depend on it),
  // but not when auth merely finishes loading on first render.
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
    // Keep the current cards on screen while refreshing the same view.
    setData(prev =>
      prev.viewKey === view.key && prev.status === "ready"
        ? prev
        : { viewKey: view.key, status: "loading", upcoming: [], past: [] },
    );

    Promise.all(view.scopes.map(scope => fetchScope(scope, view.type)))
      .then(results => {
        if (cancelled) return;
        const byScope = {};
        view.scopes.forEach((scope, i) => {
          byScope[scope] = Array.isArray(results[i]) ? results[i] : [];
        });
        const keep = event => (view.match ? view.match(event) : true);
        setData({
          viewKey: view.key,
          status: "ready",
          upcoming: (byScope.upcoming || []).filter(keep),
          // Deactivated events are hidden from the public archive too.
          past: (byScope.past || []).filter(e => e.is_active !== false).filter(keep),
        });
      })
      .catch(() => {
        if (!cancelled) setData({ viewKey: view.key, status: "error", upcoming: [], past: [] });
      });

    return () => {
      cancelled = true;
    };
  }, [view.key, reloadKey]);

  const detailBase = view.key === "courses" ? "/cursos" : "/eventos";
  const status = data.viewKey === view.key ? data.status : "loading";
  const showBoth = view.scopes.length > 1;
  const isEmpty = status === "ready" && data.upcoming.length === 0 && data.past.length === 0;

  const renderGrid = events => (
    <div className="events-grid">
      {events.map(event => (
        <EventCard
          key={event.id}
          event={event}
          detailPath={`${detailBase}/${event.id}`}
          onEnroll={setEnrollEvent}
        />
      ))}
    </div>
  );

  // Views with a single group still get an h2 (for screen readers only: the
  // page title already names the group), so the h3 card titles never follow
  // the h1 directly.
  const groupHead = (eyebrow, title) =>
    showBoth ? (
      <div className="section-head">
        <div className="section-head__text">
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="section-title">{title}</h2>
        </div>
      </div>
    ) : (
      <h2 className="sr-only">{title}</h2>
    );

  let body;
  if (status === "loading") {
    body = (
      <Section>
        <div className="events-loading">
          <Spinner size="lg" label={t("events.loading")} />
          <p>{t("events.loading")}</p>
        </div>
      </Section>
    );
  } else if (status === "error") {
    body = (
      <Section>
        <StateMessage
          icon="fa-solid fa-triangle-exclamation"
          title={t("events.load_error_title", "No pudimos cargar los eventos")}
          description={t(
            "events.load_error_text",
            "Revisa tu conexión a internet e inténtalo nuevamente en unos segundos.",
          )}
          action={
            <Button variant="outline" onClick={() => setReloadKey(k => k + 1)}>
              <i className="fa-solid fa-rotate-right" aria-hidden="true"></i>
              {t("events.retry", "Reintentar")}
            </Button>
          }
        />
      </Section>
    );
  } else if (isEmpty) {
    const pastOnly = view.key === "past";
    body = (
      <Section>
        <StateMessage
          icon="fa-regular fa-calendar"
          title={
            pastOnly
              ? t("events.empty_past_title", "Aún no hay eventos realizados")
              : t("events.empty_title")
          }
          description={
            pastOnly
              ? t("events.empty_past_text", "Cuando finalice una actividad aparecerá en este archivo.")
              : t("events.empty_description")
          }
          action={
            view.key !== "all" ? (
              <Button variant="outline" to="/eventos">
                {t("events.see_all", "Ver todos los eventos")}
              </Button>
            ) : undefined
          }
        />
      </Section>
    );
  } else {
    body = (
      <>
        {view.scopes.includes("upcoming") && (
          <Section className="events-group">
            {groupHead(
              t("events.group_upcoming_kicker", "Agenda"),
              t("events.group_upcoming_title", "Próximas actividades"),
            )}
            {data.upcoming.length > 0 ? (
              renderGrid(data.upcoming)
            ) : (
              <div className="events-inline-empty">
                <i className="fa-regular fa-calendar" aria-hidden="true"></i>
                <p>
                  {t(
                    "events.empty_upcoming_text",
                    "No hay actividades programadas por ahora. Publicaremos nuevas fechas pronto.",
                  )}
                </p>
              </div>
            )}
          </Section>
        )}
        {view.scopes.includes("past") && data.past.length > 0 && (
          <Section variant={showBoth ? "muted" : "default"} className="events-group events-group--past">
            {groupHead(
              t("events.group_past_kicker", "Archivo"),
              t("events.group_past_title", "Actividades realizadas"),
            )}
            {renderGrid(data.past)}
          </Section>
        )}
      </>
    );
  }

  return (
    <div className="page events-page">
      <PageHero
        kicker={t("events.kicker", "Formación continua")}
        title={copy.title}
        subtitle={copy.subtitle}
      >
        <nav className="events-filters" aria-label={t("events.filters_label", "Filtrar eventos")}>
          <ul className="filter-bar">
            {VIEWS.map(v => (
              <li key={v.key}>
                <NavLink to={v.path} end className="filter-pill">
                  {viewCopy(v.key, t).label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </PageHero>

      {body}

      {enrollEvent && (
        <EnrollmentModal
          key={enrollEvent.id}
          event={enrollEvent}
          onClose={() => setEnrollEvent(null)}
          onEnrolled={() => setReloadKey(k => k + 1)}
        />
      )}
    </div>
  );
}
