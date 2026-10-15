import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { currentLanguage } from "../../i18n";
import { formatTimestamp } from "../../utils/i18nLocale";
import { EmptyState, Table } from "../ui";
import {
  AdminError,
  AdminLoading,
  AdminToolbar,
  ExtraItem,
  FilterPills,
  PrimaryCell,
  RowAction,
  SearchField,
  StatusBadge,
} from "./AdminCommon";
import { APPLICATION_STATUSES, useAdminLabels } from "./adminLabels";
import { byDateDesc, errorMessage, matchesQuery } from "./adminUtils";
import useAdminList from "./useAdminList";

// Work queue order: to review, then awaiting payment, then the rest; newest first.
const STATUS_RANK = { pending: 0, payment_pending: 1, approved: 1 };
const newestFirst = byDateDesc("created_at");
const sortApplications = (a, b) =>
  (STATUS_RANK[a.status] ?? 2) - (STATUS_RANK[b.status] ?? 2) || newestFirst(a, b);

const normalizeStatus = status => (status === "approved" ? "payment_pending" : status);

export default function ApplicationsTab() {
  const { t, i18n } = useTranslation();
  const lang = currentLanguage(i18n);
  const labels = useAdminLabels();
  const {
    items: applications,
    status,
    error,
    refreshing,
    retry,
  } = useAdminList("/admin/applications", { sort: sortApplications });
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const visible = useMemo(
    () =>
      applications.filter(
        a =>
          (filter === "all" || normalizeStatus(a.status) === filter) &&
          matchesQuery(query, a.name, a.email, a.specialization),
      ),
    [applications, filter, query],
  );

  const filterOptions = [
    {
      id: "all",
      label: t("admin.applications_tab.filter_all", "Todas"),
      count: applications.length,
    },
    ...APPLICATION_STATUSES.map(s => ({
      id: s,
      label: {
        pending: t("admin.applications_tab.filter_pending", "Por revisar"),
        payment_pending: t("admin.applications_tab.filter_payment", "Esperando pago"),
        paid: t("admin.applications_tab.filter_paid", "Pagadas"),
        rejected: t("admin.applications_tab.filter_rejected", "Rechazadas"),
      }[s],
      count: applications.filter(a => normalizeStatus(a.status) === s).length,
    })),
  ];

  const columns = [
    {
      key: "name",
      label: t("admin.applications_tab.col_applicant", "Postulante"),
      className: "admin-col-primary",
      render: row => (
        <PrimaryCell
          title={row.name || t("admin.users_tab.no_name", "Sin nombre")}
          subtitle={row.email}
          extra={
            <ExtraItem label={t("admin.applications_tab.col_specialization", "Especialidad")}>
              {row.specialization || t("admin.applications_tab.no_specialization", "No indicada")}
            </ExtraItem>
          }
        />
      ),
    },
    {
      key: "specialization",
      label: t("admin.applications_tab.col_specialization", "Especialidad"),
      className: "admin-col-hide-md",
      render: row =>
        row.specialization || (
          <span className="admin-muted">
            {t("admin.applications_tab.no_specialization", "No indicada")}
          </span>
        ),
    },
    {
      key: "membership_type",
      label: t("admin.applications_tab.col_membership", "Membresía"),
      render: row => labels.membership(row.membership_type),
    },
    {
      key: "status",
      label: t("admin.applications_tab.col_status", "Estado"),
      render: row => <StatusBadge {...labels.application(row.status)} />,
    },
    {
      key: "created_at",
      label: t("admin.applications_tab.col_date", "Recibida"),
      className: "admin-col-nowrap",
      render: row =>
        formatTimestamp(row.created_at, { month: "short" }, lang) || (
          <span className="admin-muted">—</span>
        ),
    },
    {
      key: "actions",
      label: t("admin.common.actions", "Acciones"),
      className: "admin-col-actions",
      render: row => {
        const name = row.name || row.email;
        const toReview = row.status === "pending";
        return (
          <div className="admin-row-actions">
            <RowAction
              icon={toReview ? "fa-solid fa-clipboard-check" : "fa-regular fa-eye"}
              label={
                toReview
                  ? t("admin.applications_tab.review", "Revisar")
                  : t("admin.common.view", "Ver")
              }
              ariaLabel={t("admin.applications_tab.view_aria", {
                name,
                defaultValue: "Abrir la postulación de {{name}}",
              })}
              to={`/admin/applications/${row.id}`}
            />
          </div>
        );
      },
    },
  ];

  let content;
  if (status === "loading") {
    content = (
      <AdminLoading label={t("admin.applications_tab.loading", "Cargando postulaciones…")} />
    );
  } else if (status === "error") {
    content = (
      <AdminError
        title={t("admin.applications_tab.load_error", "No se pudieron cargar las postulaciones.")}
        message={errorMessage(error, t("admin.common.load_error_hint", "Revisa tu conexión e inténtalo de nuevo."))}
        onRetry={retry}
      />
    );
  } else if (applications.length === 0) {
    content = (
      <EmptyState
        icon={<i className="fa-solid fa-file-signature"></i>}
        title={t("admin.applications_tab.empty_title", "Aún no hay postulaciones")}
        description={t(
          "admin.applications_tab.empty_desc",
          "Las solicitudes enviadas desde el formulario de membresía aparecerán aquí.",
        )}
      />
    );
  } else {
    content = (
      <>
        <div className="admin-list-controls">
          <SearchField
            value={query}
            onChange={setQuery}
            label={t("admin.applications_tab.search_label", "Buscar postulaciones")}
            placeholder={t("admin.applications_tab.search_placeholder", "Buscar por nombre o email")}
          />
          <FilterPills
            options={filterOptions}
            value={filter}
            onChange={setFilter}
            label={t("admin.applications_tab.filter_label", "Filtrar por estado")}
          />
        </div>
        <Table
          columns={columns}
          data={visible}
          hoverable
          className="admin-table"
          emptyText={t("admin.common.no_matches", "No hay resultados para esta búsqueda.")}
        />
      </>
    );
  }

  return (
    <div className="admin-tab">
      <AdminToolbar
        title={t("admin.applications_tab.title", "Postulaciones")}
        busy={refreshing}
        meta={
          status === "ready"
            ? t("admin.applications_tab.count", {
                count: applications.length,
                defaultValue_one: "{{count}} solicitud de membresía",
                defaultValue: "{{count}} solicitudes de membresía",
              })
            : null
        }
      />
      {content}
    </div>
  );
}
