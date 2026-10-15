import { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { currentLanguage } from "../../i18n";
import { formatTimestamp } from "../../utils/i18nLocale";
import { Button, EmptyState, Modal, Table, useToast } from "../ui";
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
import NewsForm from "./NewsForm";
import { NEWS_STATUSES, useAdminLabels } from "./adminLabels";
import { errorMessage, matchesQuery } from "./adminUtils";
import useAdminList from "./useAdminList";

export default function NewsTab({ createOpen, onCreateOpenChange }) {
  const { t, i18n } = useTranslation();
  const lang = currentLanguage(i18n);
  const toast = useToast();
  const labels = useAdminLabels();
  const { items: news, status, error, refreshing, reload, retry } = useAdminList("/admin/news");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [editing, setEditing] = useState(null);

  const visible = useMemo(
    () =>
      news.filter(
        n =>
          (filter === "all" || n.status === filter) &&
          matchesQuery(query, n.title, n.excerpt, labels.category(n.category)),
      ),
    [news, filter, query, labels],
  );

  const formOpen = createOpen || Boolean(editing);
  const closeForm = () => {
    setEditing(null);
    onCreateOpenChange(false);
  };

  const handleSaved = result => {
    closeForm();
    reload();
    if (result.warning) {
      toast.warning(result.warning, 8000);
    } else if (result.type === "created") {
      toast.success(
        result.published
          ? t("admin.news_tab.created_published", "Noticia creada y publicada.")
          : t("admin.news_tab.created_pending", "Noticia creada. Quedó pendiente de aprobación."),
      );
    } else {
      toast.success(t("admin.news_tab.updated", "Noticia actualizada."));
    }
  };

  const filterOptions = [
    { id: "all", label: t("admin.news_tab.filter_all", "Todas"), count: news.length },
    ...NEWS_STATUSES.map(s => ({
      id: s,
      label: {
        published: t("admin.news_tab.filter_published", "Publicadas"),
        pending: t("admin.news_tab.filter_pending", "Pendientes"),
        rejected: t("admin.news_tab.filter_rejected", "Rechazadas"),
      }[s],
      count: news.filter(n => n.status === s).length,
    })),
  ];

  const columns = [
    {
      key: "title",
      label: t("admin.news_tab.col_title", "Noticia"),
      className: "admin-col-primary admin-col-wide",
      render: row => (
        <PrimaryCell
          title={row.title || t("admin.news_tab.untitled", "Sin título")}
          subtitle={
            row.excerpt ? (
              <span className="admin-clamp-2">{row.excerpt}</span>
            ) : (
              <span className="admin-muted">{t("admin.news_tab.no_excerpt", "Sin resumen")}</span>
            )
          }
          extra={
            <>
              <ExtraItem label={t("admin.news_tab.col_date", "Creada")}>
                {formatTimestamp(row.created_at, { month: "short" }, lang) || "—"}
              </ExtraItem>
              <ExtraItem label={t("admin.news_tab.col_order", "Orden")}>
                {row.order_index ?? "—"}
              </ExtraItem>
            </>
          }
        />
      ),
    },
    {
      key: "category",
      label: t("admin.news_tab.col_category", "Categoría"),
      render: row => <span className="admin-nowrap-md">{labels.category(row.category)}</span>,
    },
    {
      key: "status",
      label: t("admin.news_tab.col_status", "Estado"),
      render: row => <StatusBadge {...labels.news(row.status)} />,
    },
    {
      key: "order_index",
      label: t("admin.news_tab.col_order", "Orden"),
      className: "admin-col-hide-md admin-col-num",
      render: row => row.order_index ?? "—",
    },
    {
      key: "created_at",
      label: t("admin.news_tab.col_date", "Creada"),
      className: "admin-col-nowrap admin-col-hide-md",
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
        const title = row.title || t("admin.news_tab.untitled", "Sin título");
        return (
          <div className="admin-row-actions">
            <RowAction
              icon="fa-regular fa-eye"
              label={t("admin.common.view", "Ver")}
              ariaLabel={t("admin.news_tab.view_aria", { title, defaultValue: "Ver «{{title}}»" })}
              to={`/admin/news/${row.id}/view`}
            />
            <RowAction
              icon="fa-solid fa-pen"
              label={t("admin.common.edit", "Editar")}
              ariaLabel={t("admin.news_tab.edit_aria", { title, defaultValue: "Editar «{{title}}»" })}
              onClick={() => setEditing(row)}
            />
          </div>
        );
      },
    },
  ];

  let content;
  if (status === "loading") {
    content = <AdminLoading label={t("admin.news_tab.loading", "Cargando noticias…")} />;
  } else if (status === "error") {
    content = (
      <AdminError
        title={t("admin.news_tab.load_error", "No se pudieron cargar las noticias.")}
        message={errorMessage(error, t("admin.common.load_error_hint", "Revisa tu conexión e inténtalo de nuevo."))}
        onRetry={retry}
      />
    );
  } else if (news.length === 0) {
    content = (
      <EmptyState
        icon={<i className="fa-solid fa-newspaper"></i>}
        title={t("admin.news_tab.empty_title", "Aún no hay noticias")}
        description={t("admin.news_tab.empty_desc", "Publica la primera noticia de la sociedad.")}
        action={
          <Button onClick={() => onCreateOpenChange(true)}>
            <i className="fa-solid fa-plus" aria-hidden="true"></i>
            {t("admin.news_tab.create", "Nueva noticia")}
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
            label={t("admin.news_tab.search_label", "Buscar noticias")}
            placeholder={t("admin.news_tab.search_placeholder", "Buscar por título o resumen")}
          />
          <FilterPills
            options={filterOptions}
            value={filter}
            onChange={setFilter}
            label={t("admin.news_tab.filter_label", "Filtrar por estado")}
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
        title={t("admin.news_tab.title", "Noticias")}
        busy={refreshing}
        meta={
          status === "ready"
            ? t("admin.news_tab.count", {
                count: news.length,
                defaultValue_one: "{{count}} noticia",
                defaultValue: "{{count}} noticias",
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
            ? t("admin.news_form.edit_title", "Editar noticia")
            : t("admin.news_form.create_title", "Nueva noticia")
        }
        size="large"
      >
        <NewsForm
          key={editing ? `edit-${editing.id}` : "create"}
          news={editing}
          onSaved={handleSaved}
          onCancel={closeForm}
        />
      </Modal>
    </div>
  );
}

NewsTab.propTypes = {
  createOpen: PropTypes.bool.isRequired,
  onCreateOpenChange: PropTypes.func.isRequired,
};
