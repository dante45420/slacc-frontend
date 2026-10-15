import { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { apiDelete } from "../../api/client";
import { currentLanguage } from "../../i18n";
import { formatDate } from "../../utils/i18nLocale";
import { Button, EmptyState, Modal, Table, useToast } from "../ui";
import {
  AdminError,
  AdminLoading,
  AdminToolbar,
  ConfirmDialog,
  ExtraItem,
  FilterPills,
  PrimaryCell,
  RowAction,
  SearchField,
  StatusBadge,
} from "./AdminCommon";
import EnrollmentsModal from "./EnrollmentsModal";
import EventForm from "./EventForm";
import { useAdminLabels } from "./adminLabels";
import { byDateDesc, errorMessage, isUpcomingEvent, matchesQuery } from "./adminUtils";
import useAdminList from "./useAdminList";
import useAdminSession from "./useAdminSession";

const sortEvents = byDateDesc("start_date");

const isUpcoming = isUpcomingEvent;

export default function EventsTab({ createOpen, onCreateOpenChange }) {
  const { t, i18n } = useTranslation();
  const lang = currentLanguage(i18n);
  const toast = useToast();
  const labels = useAdminLabels();
  const { handleAuthError } = useAdminSession();
  const { items: events, status, error, refreshing, reload, retry } = useAdminList(
    "/admin/events",
    { sort: sortEvents },
  );
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [editing, setEditing] = useState(null);
  const [enrollmentsFor, setEnrollmentsFor] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const now = Date.now();

  const visible = useMemo(
    () =>
      events.filter(e => {
        if (filter === "upcoming" && !isUpcoming(e, now)) return false;
        if (filter === "past" && isUpcoming(e, now)) return false;
        if (filter === "hidden" && e.is_active !== false) return false;
        return matchesQuery(query, e.title, e.instructor, e.location);
      }),
    // `now` changes every render; the list only needs to react to data/filters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [events, filter, query],
  );

  const formOpen = createOpen || Boolean(editing);
  const closeForm = () => {
    setEditing(null);
    onCreateOpenChange(false);
  };

  const handleSaved = ({ type, warning }) => {
    closeForm();
    reload();
    if (warning) toast.warning(warning, 8000);
    else
      toast.success(
        type === "created"
          ? t("admin.events_tab.created", "Evento creado.")
          : t("admin.events_tab.updated", "Evento actualizado."),
      );
  };

  const askDelete = event => {
    setDeleteError("");
    setDeleting(event);
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteBusy(true);
    setDeleteError("");
    try {
      await apiDelete(`/admin/events/${deleting.id}`);
      toast.success(t("admin.events_tab.deleted", "Evento eliminado."));
      setDeleting(null);
      reload();
    } catch (err) {
      if (handleAuthError(err)) return;
      setDeleteError(errorMessage(err, t("admin.events_tab.delete_error", "No se pudo eliminar el evento.")));
    } finally {
      setDeleteBusy(false);
    }
  };

  const filterOptions = [
    { id: "all", label: t("admin.events_tab.filter_all", "Todos"), count: events.length },
    {
      id: "upcoming",
      label: t("admin.events_tab.filter_upcoming", "Próximos"),
      count: events.filter(e => isUpcoming(e, now)).length,
    },
    {
      id: "past",
      label: t("admin.events_tab.filter_past", "Realizados"),
      count: events.filter(e => !isUpcoming(e, now)).length,
    },
    {
      id: "hidden",
      label: t("admin.events_tab.filter_hidden", "Ocultos"),
      count: events.filter(e => e.is_active === false).length,
    },
  ];

  const columns = [
    {
      key: "title",
      label: t("admin.events_tab.col_event", "Evento"),
      className: "admin-col-primary admin-col-wide",
      render: row => (
        <PrimaryCell
          title={
            <>
              {row.title || t("admin.news_tab.untitled", "Sin título")}
              {row.is_active === false && (
                <StatusBadge label={t("admin.events_tab.hidden", "Oculto")} variant="neutral" />
              )}
            </>
          }
          subtitle={
            row.instructor ? (
              <span className="admin-clamp-1">{row.instructor}</span>
            ) : row.description ? (
              <span className="admin-clamp-1">{row.description}</span>
            ) : null
          }
          extraWhen="lg"
          extra={
            row.location ? (
              <ExtraItem label={t("admin.events_tab.col_location", "Lugar")}>
                {row.location}
              </ExtraItem>
            ) : null
          }
        />
      ),
    },
    {
      key: "format",
      label: t("admin.events_tab.col_format", "Formato"),
      render: row => <StatusBadge {...labels.format(row.format)} />,
    },
    {
      key: "start_date",
      label: t("admin.events_tab.col_date", "Fecha"),
      className: "admin-col-nowrap",
      render: row => {
        const upcoming = isUpcoming(row, now);
        return (
          <div className="admin-date-cell">
            <span>
              {formatDate(row.start_date, { month: "short" }, lang) ||
                t("common.tbc", "Por confirmar")}
            </span>
            <StatusBadge
              label={
                upcoming
                  ? t("admin.events_tab.upcoming", "Próximo")
                  : t("admin.events_tab.past", "Realizado")
              }
              variant={upcoming ? "info" : "neutral"}
            />
          </div>
        );
      },
    },
    {
      key: "location",
      label: t("admin.events_tab.col_location", "Lugar"),
      className: "admin-col-hide-md admin-col-location",
      render: row =>
        row.location ? (
          <span className="admin-clamp-2 admin-break">{row.location}</span>
        ) : (
          <span className="admin-muted">—</span>
        ),
    },
    {
      key: "actions",
      label: t("admin.common.actions", "Acciones"),
      className: "admin-col-actions",
      render: row => {
        const title = row.title || t("admin.news_tab.untitled", "Sin título");
        return (
          <div className="admin-row-actions">
            <RowAction
              icon="fa-solid fa-users"
              label={t("admin.events_tab.enrollments", "Inscritos")}
              ariaLabel={t("admin.events_tab.enrollments_aria", {
                title,
                defaultValue: "Ver inscritos de «{{title}}»",
              })}
              onClick={() => setEnrollmentsFor(row)}
            />
            <RowAction
              icon="fa-solid fa-pen"
              label={t("admin.common.edit", "Editar")}
              ariaLabel={t("admin.events_tab.edit_aria", { title, defaultValue: "Editar «{{title}}»" })}
              onClick={() => setEditing(row)}
            />
            <RowAction
              icon="fa-regular fa-eye"
              label={t("admin.common.view", "Ver")}
              ariaLabel={t("admin.events_tab.view_aria", {
                title,
                defaultValue: "Ver «{{title}}» en el sitio",
              })}
              to={`/eventos/${row.id}`}
              iconOnly
            />
            <RowAction
              icon="fa-regular fa-trash-can"
              label={t("admin.common.delete", "Eliminar")}
              ariaLabel={t("admin.events_tab.delete_aria", { title, defaultValue: "Eliminar «{{title}}»" })}
              onClick={() => askDelete(row)}
              danger
              iconOnly
            />
          </div>
        );
      },
    },
  ];

  let content;
  if (status === "loading") {
    content = <AdminLoading label={t("admin.events_tab.loading", "Cargando eventos…")} />;
  } else if (status === "error") {
    content = (
      <AdminError
        title={t("admin.events_tab.load_error", "No se pudieron cargar los eventos.")}
        message={errorMessage(error, t("admin.common.load_error_hint", "Revisa tu conexión e inténtalo de nuevo."))}
        onRetry={retry}
      />
    );
  } else if (events.length === 0) {
    content = (
      <EmptyState
        icon={<i className="fa-solid fa-calendar-days"></i>}
        title={t("admin.events_tab.empty_title", "Aún no hay eventos")}
        description={t("admin.events_tab.empty_desc", "Crea un webinar o un curso presencial.")}
        action={
          <Button onClick={() => onCreateOpenChange(true)}>
            <i className="fa-solid fa-plus" aria-hidden="true"></i>
            {t("admin.events_tab.create", "Nuevo evento")}
          </Button>
        }
      />
    );
  } else {
    content = (
      <>
        <div className="admin-list-controls">
          <SearchField
            value={query}
            onChange={setQuery}
            label={t("admin.events_tab.search_label", "Buscar eventos")}
            placeholder={t("admin.events_tab.search_placeholder", "Buscar por título, docente o lugar")}
          />
          <FilterPills
            options={filterOptions}
            value={filter}
            onChange={setFilter}
            label={t("admin.events_tab.filter_label", "Filtrar eventos")}
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
        title={t("admin.events_tab.title", "Eventos")}
        busy={refreshing}
        meta={
          status === "ready"
            ? t("admin.events_tab.count", {
                count: events.length,
                defaultValue_one: "{{count}} evento",
                defaultValue: "{{count}} eventos",
              })
            : null
        }
      />
      {content}

      <Modal
        isOpen={formOpen}
        onClose={closeForm}
        title={
          editing
            ? t("admin.event_form.edit_title", "Editar evento")
            : t("admin.event_form.create_title", "Nuevo evento")
        }
        size="large"
      >
        <EventForm
          key={editing ? `edit-${editing.id}` : "create"}
          event={editing}
          onSaved={handleSaved}
          onCancel={closeForm}
        />
      </Modal>

      {enrollmentsFor && (
        <EnrollmentsModal event={enrollmentsFor} onClose={() => setEnrollmentsFor(null)} />
      )}

      <ConfirmDialog
        isOpen={Boolean(deleting)}
        title={t("admin.events_tab.delete_title", "¿Eliminar este evento?")}
        confirmLabel={t("admin.events_tab.delete_confirm", "Eliminar evento")}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
        busy={deleteBusy}
        error={deleteError}
      >
        <p>
          {t("admin.events_tab.delete_body", {
            title: deleting?.title || "",
            defaultValue:
              "Se eliminará «{{title}}» junto con todas sus inscripciones. Esta acción no se puede deshacer.",
          })}
        </p>
        <p className="admin-confirm__hint">
          {t(
            "admin.events_tab.delete_hint",
            "Si solo quieres ocultarlo del sitio, edítalo y desmarca «Evento visible en el sitio».",
          )}
        </p>
      </ConfirmDialog>
    </div>
  );
}

EventsTab.propTypes = {
  createOpen: PropTypes.bool.isRequired,
  onCreateOpenChange: PropTypes.func.isRequired,
};
