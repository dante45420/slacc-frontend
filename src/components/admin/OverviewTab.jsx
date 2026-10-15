import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { apiGet } from "../../api/client";
import { currentLanguage } from "../../i18n";
import { formatTimestamp } from "../../utils/i18nLocale";
import { AdminError, AdminLoading } from "./AdminCommon";
import { useAdminLabels } from "./adminLabels";
import { byDateDesc, errorMessage, isUpcomingEvent } from "./adminUtils";
import useAdminSession from "./useAdminSession";

const SOURCES = [
  ["applications", "/admin/applications"],
  ["users", "/admin/users"],
  ["news", "/admin/news"],
  ["events", "/admin/events"],
];

const ATTENTION_LIMIT = 6;

function count(list, predicate) {
  return list.filter(predicate).length;
}

/** Overview: KPI cards, application pipeline and a "needs attention" list.
 *  It mounts only while the tab is visible, so the numbers are refetched
 *  every time the admin comes back to it. */
export default function OverviewTab({ onNavigate }) {
  const { t, i18n } = useTranslation();
  const lang = currentLanguage(i18n);
  const labels = useAdminLabels();
  const { handleAuthError } = useAdminSession();
  const [state, setState] = useState({ status: "loading", data: {}, failed: [] });
  const alive = useRef(true);

  const load = useCallback(async () => {
    setState(prev => ({ ...prev, status: "loading" }));
    const results = await Promise.allSettled(SOURCES.map(([, path]) => apiGet(path)));
    if (!alive.current) return;
    const data = {};
    const failed = [];
    let lastError = null;
    results.forEach((res, idx) => {
      const [key] = SOURCES[idx];
      if (res.status === "fulfilled" && Array.isArray(res.value)) {
        data[key] = res.value;
      } else {
        failed.push(key);
        lastError = res.reason || lastError;
      }
    });
    if (lastError && handleAuthError(lastError)) return;
    setState({ status: "ready", data, failed, error: lastError });
  }, [handleAuthError]);

  useEffect(() => {
    alive.current = true;
    load();
    return () => {
      alive.current = false;
    };
  }, [load]);

  if (state.status === "loading" && !state.data.applications && !state.data.users) {
    return <AdminLoading label={t("admin.overview.loading", "Cargando resumen…")} />;
  }

  const { data, failed } = state;
  const apps = data.applications;
  const users = data.users;
  const news = data.news;
  const events = data.events;
  const now = Date.now();

  const appCounts = apps && {
    total: apps.length,
    pending: count(apps, a => a.status === "pending"),
    payment_pending: count(apps, a => a.status === "payment_pending" || a.status === "approved"),
    paid: count(apps, a => a.status === "paid"),
    rejected: count(apps, a => a.status === "rejected"),
  };
  const userCounts = users && {
    total: users.length,
    members: count(users, u => u.role === "member"),
    admins: count(users, u => u.role === "admin"),
    due: count(users, u => u.role === "member" && u.payment_status !== "paid"),
  };
  const newsCounts = news && {
    total: news.length,
    published: count(news, n => n.status === "published"),
    pending: count(news, n => n.status === "pending"),
  };
  const eventCounts = events && {
    total: events.length,
    upcoming: count(events, e => isUpcomingEvent(e, now)),
  };
  if (eventCounts) eventCounts.past = eventCounts.total - eventCounts.upcoming;

  const kpis = [
    {
      key: "applications",
      icon: "fa-file-signature",
      label: t("admin.overview.kpi_applications", "Postulaciones"),
      value: appCounts?.total,
      breakdown: appCounts && [
        t("admin.overview.n_to_review", {
          count: appCounts.pending,
          defaultValue_one: "{{count}} por revisar",
          defaultValue: "{{count}} por revisar",
        }),
        t("admin.overview.n_awaiting_payment", {
          count: appCounts.payment_pending,
          defaultValue_one: "{{count}} esperando pago",
          defaultValue: "{{count}} esperando pago",
        }),
      ],
      link: t("admin.overview.go_applications", "Ver postulaciones"),
    },
    {
      key: "users",
      icon: "fa-user-doctor",
      label: t("admin.overview.kpi_members", "Socios"),
      value: userCounts?.members,
      breakdown: userCounts && [
        t("admin.overview.n_dues_pending", {
          count: userCounts.due,
          defaultValue_one: "{{count}} con pago pendiente",
          defaultValue: "{{count}} con pago pendiente",
        }),
        t("admin.overview.n_admins", {
          count: userCounts.admins,
          defaultValue_one: "{{count}} administrador",
          defaultValue: "{{count}} administradores",
        }),
      ],
      link: t("admin.overview.go_users", "Ver socios"),
    },
    {
      key: "news",
      icon: "fa-newspaper",
      label: t("admin.overview.kpi_news", "Noticias"),
      value: newsCounts?.total,
      breakdown: newsCounts && [
        t("admin.overview.n_published", {
          count: newsCounts.published,
          defaultValue_one: "{{count}} publicada",
          defaultValue: "{{count}} publicadas",
        }),
        t("admin.overview.n_pending_news", {
          count: newsCounts.pending,
          defaultValue_one: "{{count}} pendiente",
          defaultValue: "{{count}} pendientes",
        }),
      ],
      link: t("admin.overview.go_news", "Ver noticias"),
    },
    {
      key: "events",
      icon: "fa-calendar-days",
      label: t("admin.overview.kpi_events", "Eventos"),
      value: eventCounts?.total,
      breakdown: eventCounts && [
        t("admin.overview.n_upcoming", {
          count: eventCounts.upcoming,
          defaultValue_one: "{{count}} próximo",
          defaultValue: "{{count}} próximos",
        }),
        t("admin.overview.n_past", {
          count: eventCounts.past,
          defaultValue_one: "{{count}} realizado",
          defaultValue: "{{count}} realizados",
        }),
      ],
      link: t("admin.overview.go_events", "Ver eventos"),
    },
  ];

  const pipelineLabels = {
    pending: t("admin.applications_tab.filter_pending", "Por revisar"),
    payment_pending: t("admin.applications_tab.filter_payment", "Esperando pago"),
    paid: t("admin.applications_tab.filter_paid", "Pagadas"),
    rejected: t("admin.applications_tab.filter_rejected", "Rechazadas"),
  };
  const pipeline = appCounts
    ? ["pending", "payment_pending", "paid", "rejected"].map(status => ({
        status,
        value: appCounts[status],
        variant: labels.application(status).variant,
        label: pipelineLabels[status],
      }))
    : [];

  const attention = [];
  if (apps) {
    [...apps]
      .filter(a => a.status === "pending" || a.status === "payment_pending" || a.status === "approved")
      .sort(byDateDesc("created_at"))
      .forEach(a =>
        attention.push({
          key: `app-${a.id}`,
          to: `/admin/applications/${a.id}`,
          icon: a.status === "pending" ? "fa-file-signature" : "fa-credit-card",
          kind:
            a.status === "pending"
              ? t("admin.overview.attention_application", "Postulación por revisar")
              : t("admin.overview.attention_payment", "Pago por confirmar"),
          title: a.name || a.email,
          date: a.created_at,
        }),
      );
  }
  if (news) {
    [...news]
      .filter(n => n.status === "pending")
      .sort(byDateDesc("created_at"))
      .forEach(n =>
        attention.push({
          key: `news-${n.id}`,
          to: `/admin/news/${n.id}/view`,
          icon: "fa-newspaper",
          kind: t("admin.overview.attention_news", "Noticia por aprobar"),
          title: n.title || t("admin.news_tab.untitled", "Sin título"),
          date: n.created_at,
        }),
      );
  }

  const failedNames = failed.map(key => kpis.find(k => k.key === key)?.label).filter(Boolean);

  return (
    <div className="admin-overview">
      {failed.length > 0 && (
        <AdminError
          title={t("admin.overview.partial_error", "No se pudieron cargar algunos datos")}
          message={`${failedNames.join(", ")} — ${errorMessage(
            state.error,
            t("admin.common.load_error_hint", "Revisa tu conexión e inténtalo de nuevo."),
          )}`}
          onRetry={load}
        />
      )}

      <ul className="admin-kpis" aria-label={t("admin.overview.kpis_label", "Indicadores")}>
        {kpis.map(kpi => {
          const unavailable = kpi.value === undefined;
          return (
            <li key={kpi.key}>
              <button type="button" className="admin-kpi" onClick={() => onNavigate(kpi.key)}>
                <span className="admin-kpi__head">
                  <span className="icon-tile admin-kpi__icon" aria-hidden="true">
                    <i className={`fa-solid ${kpi.icon}`}></i>
                  </span>
                  <span className="admin-kpi__label">{kpi.label}</span>
                  <i className="fa-solid fa-arrow-right admin-kpi__arrow" aria-hidden="true"></i>
                </span>
                <span className="admin-kpi__value">
                  {unavailable ? (
                    <>
                      <span aria-hidden="true">—</span>
                      <span className="sr-only">{t("admin.overview.unavailable", "Sin datos")}</span>
                    </>
                  ) : (
                    kpi.value
                  )}
                </span>
                <span className="admin-kpi__breakdown">
                  {unavailable
                    ? t("admin.overview.unavailable", "Sin datos")
                    : kpi.breakdown.map((part, idx) => <span key={idx}>{part}</span>)}
                </span>
                <span className="sr-only">{kpi.link}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="admin-overview__grid">
        <section className="admin-card" aria-labelledby="admin-pipeline-title">
          <header className="admin-card__head">
            <h2 id="admin-pipeline-title" className="admin-card__title">
              {t("admin.overview.pipeline_title", "Estado de las postulaciones")}
            </h2>
            {appCounts && (
              <span className="admin-card__meta">
                {t("admin.overview.total_n", {
                  count: appCounts.total,
                  defaultValue_one: "{{count}} en total",
                  defaultValue: "{{count}} en total",
                })}
              </span>
            )}
          </header>
          {appCounts ? (
            <>
              {appCounts.total > 0 && (
                <div className="admin-pipeline-bar" aria-hidden="true">
                  {pipeline
                    .filter(p => p.value > 0)
                    .map(p => (
                      <span
                        key={p.status}
                        className={`admin-pipeline-bar__seg is-${p.variant}`}
                        style={{ flexGrow: p.value }}
                      />
                    ))}
                </div>
              )}
              <ul className="admin-pipeline-list">
                {pipeline.map(p => (
                  <li key={p.status} className="admin-pipeline-list__item">
                    <span className={`admin-dot is-${p.variant}`} aria-hidden="true" />
                    <span className="admin-pipeline-list__label">{p.label}</span>
                    <span className="admin-pipeline-list__value">{p.value}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="admin-card__empty">{t("admin.overview.unavailable", "Sin datos")}</p>
          )}
        </section>

        <section className="admin-card" aria-labelledby="admin-attention-title">
          <header className="admin-card__head">
            <h2 id="admin-attention-title" className="admin-card__title">
              {t("admin.overview.attention_title", "Requiere tu atención")}
            </h2>
            {attention.length > 0 && <span className="admin-card__count">{attention.length}</span>}
          </header>
          {attention.length === 0 ? (
            <div className="admin-card__empty admin-card__empty--ok">
              <i className="fa-solid fa-circle-check" aria-hidden="true"></i>
              <span>
                {apps && news
                  ? t("admin.overview.attention_empty", "Todo al día: no hay postulaciones ni noticias pendientes.")
                  : t("admin.overview.unavailable", "Sin datos")}
              </span>
            </div>
          ) : (
            <ul className="admin-attention">
              {attention.slice(0, ATTENTION_LIMIT).map(item => (
                <li key={item.key}>
                  <Link to={item.to} className="admin-attention__item">
                    <span className="admin-attention__icon" aria-hidden="true">
                      <i className={`fa-solid ${item.icon}`}></i>
                    </span>
                    <span className="admin-attention__text">
                      <span className="admin-attention__kind">{item.kind}</span>
                      <span className="admin-attention__title">{item.title}</span>
                    </span>
                    {item.date && (
                      <span className="admin-attention__date">
                        {formatTimestamp(item.date, { month: "short" }, lang)}
                      </span>
                    )}
                    <i className="fa-solid fa-chevron-right admin-attention__chevron" aria-hidden="true"></i>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {attention.length > ATTENTION_LIMIT && (
            <p className="admin-card__more">
              {t("admin.overview.attention_more", {
                count: attention.length - ATTENTION_LIMIT,
                defaultValue_one: "Y {{count}} más en las pestañas correspondientes.",
                defaultValue: "Y {{count}} más en las pestañas correspondientes.",
              })}
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

OverviewTab.propTypes = {
  onNavigate: PropTypes.func.isRequired,
};
