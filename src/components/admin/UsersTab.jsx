import { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
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
import { CredentialsCard, CredentialsModal } from "./MemberCredentials";
import UserForm from "./UserForm";
import { useAdminLabels } from "./adminLabels";
import { errorMessage, matchesQuery, nameInitials } from "./adminUtils";
import useAdminList from "./useAdminList";
import useAdminSession from "./useAdminSession";

const FILTERS = {
  all: () => true,
  members: u => u.role === "member",
  admins: u => u.role === "admin",
  due: u => u.role === "member" && u.payment_status !== "paid",
  inactive: u => u.is_active === false,
};

export default function UsersTab({ createOpen, onCreateOpenChange }) {
  const { t } = useTranslation();
  const toast = useToast();
  const labels = useAdminLabels();
  const { user: me } = useAdminSession();
  const { items: users, status, error, refreshing, reload, retry } = useAdminList("/admin/users");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [editing, setEditing] = useState(null);
  const [credentials, setCredentials] = useState(null);
  const [lastCredentials, setLastCredentials] = useState(null);

  const visible = useMemo(
    () => users.filter(u => FILTERS[filter](u) && matchesQuery(query, u.name, u.email)),
    [users, filter, query],
  );

  const formOpen = createOpen || Boolean(editing);
  const closeForm = () => {
    setEditing(null);
    onCreateOpenChange(false);
  };

  const handleSaved = ({ type, user }) => {
    closeForm();
    reload();
    if (type === "created") {
      if (user?.initial_password) {
        // The credentials dialog is the confirmation; a toast would cover its
        // buttons on phones.
        setLastCredentials(null);
        setCredentials({ name: user.name, email: user.email, password: user.initial_password });
      } else {
        toast.success(t("admin.users_tab.created", "Socio creado correctamente."));
      }
    } else {
      toast.success(t("admin.users_tab.updated", "Cambios guardados."));
    }
  };

  const closeCredentials = () => {
    setLastCredentials(credentials);
    setCredentials(null);
  };

  const filterOptions = [
    { id: "all", label: t("admin.users_tab.filter_all", "Todos"), count: users.length },
    {
      id: "members",
      label: t("admin.users_tab.filter_members", "Socios"),
      count: users.filter(FILTERS.members).length,
    },
    {
      id: "admins",
      label: t("admin.users_tab.filter_admins", "Administradores"),
      count: users.filter(FILTERS.admins).length,
    },
    {
      id: "due",
      label: t("admin.users_tab.filter_due", "Pago pendiente"),
      count: users.filter(FILTERS.due).length,
    },
    {
      id: "inactive",
      label: t("admin.users_tab.filter_inactive", "Inactivos"),
      count: users.filter(FILTERS.inactive).length,
    },
  ];

  const columns = [
    {
      key: "name",
      label: t("admin.users_tab.col_user", "Socio"),
      className: "admin-col-primary",
      render: row => (
        <PrimaryCell
          leading={
            <span className="avatar admin-avatar" aria-hidden="true">
              {nameInitials(row.name || row.email)}
            </span>
          }
          title={
            <>
              {row.name || t("admin.users_tab.no_name", "Sin nombre")}
              {me?.id === row.id && (
                <span className="admin-you">{t("admin.users_tab.you", "Tú")}</span>
              )}
            </>
          }
          subtitle={row.email}
          extra={
            row.role === "member" ? (
              <ExtraItem label={t("admin.users_tab.col_membership", "Membresía")}>
                {labels.membership(row.membership_type)}
              </ExtraItem>
            ) : null
          }
        />
      ),
    },
    {
      key: "role",
      label: t("admin.users_tab.col_role", "Rol"),
      render: row => <StatusBadge {...labels.role(row.role)} />,
    },
    {
      key: "membership_type",
      label: t("admin.users_tab.col_membership", "Membresía"),
      className: "admin-col-hide-md",
      render: row =>
        row.role === "member" ? (
          labels.membership(row.membership_type)
        ) : (
          <span className="admin-muted">—</span>
        ),
    },
    {
      key: "payment_status",
      label: t("admin.users_tab.col_payment", "Pago"),
      render: row =>
        row.role === "member" ? (
          <StatusBadge {...labels.payment(row.payment_status)} />
        ) : (
          <span className="admin-muted">—</span>
        ),
    },
    {
      key: "is_active",
      label: t("admin.users_tab.col_status", "Cuenta"),
      render: row => <StatusBadge {...labels.active(row.is_active !== false)} />,
    },
    {
      key: "actions",
      label: t("admin.common.actions", "Acciones"),
      className: "admin-col-actions",
      render: row => {
        const name = row.name || row.email;
        return (
          <div className="admin-row-actions">
            <RowAction
              icon="fa-regular fa-eye"
              label={t("admin.common.view", "Ver")}
              ariaLabel={t("admin.users_tab.view_aria", { name, defaultValue: "Ver ficha de {{name}}" })}
              to={`/admin/users/${row.id}`}
            />
            <RowAction
              icon="fa-solid fa-pen"
              label={t("admin.common.edit", "Editar")}
              ariaLabel={t("admin.users_tab.edit_aria", { name, defaultValue: "Editar a {{name}}" })}
              onClick={() => setEditing(row)}
            />
          </div>
        );
      },
    },
  ];

  let content;
  if (status === "loading") {
    content = <AdminLoading label={t("admin.users_tab.loading", "Cargando socios…")} />;
  } else if (status === "error") {
    content = (
      <AdminError
        title={t("admin.users_tab.load_error", "No se pudo cargar la lista de socios.")}
        message={errorMessage(error, t("admin.common.load_error_hint", "Revisa tu conexión e inténtalo de nuevo."))}
        onRetry={retry}
      />
    );
  } else if (users.length === 0) {
    content = (
      <EmptyState
        icon={<i className="fa-solid fa-user-doctor"></i>}
        title={t("admin.users_tab.empty_title", "Aún no hay socios")}
        description={t("admin.users_tab.empty_desc", "Crea el primer socio o aprueba una postulación.")}
        action={
          <Button onClick={() => onCreateOpenChange(true)}>
            <i className="fa-solid fa-user-plus" aria-hidden="true"></i>
            {t("admin.users_tab.create", "Nuevo socio")}
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
            label={t("admin.users_tab.search_label", "Buscar socios")}
            placeholder={t("admin.users_tab.search_placeholder", "Buscar por nombre o email")}
          />
          <FilterPills
            options={filterOptions}
            value={filter}
            onChange={setFilter}
            label={t("admin.users_tab.filter_label", "Filtrar socios")}
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
        title={t("admin.users_tab.title", "Socios")}
        busy={refreshing}
        meta={
          status === "ready"
            ? t("admin.users_tab.count", {
                count: users.length,
                defaultValue_one: "{{count}} cuenta registrada",
                defaultValue: "{{count}} cuentas registradas",
              })
            : null
        }
      />

      {lastCredentials && (
        <CredentialsCard credentials={lastCredentials} onDismiss={() => setLastCredentials(null)} />
      )}

      {content}

      <Modal
        isOpen={formOpen}
        onClose={closeForm}
        title={
          editing
            ? t("admin.user_form.edit_title", "Editar socio")
            : t("admin.user_form.create_title", "Nuevo socio")
        }
        size="medium"
      >
        <UserForm
          key={editing ? `edit-${editing.id}` : "create"}
          user={editing}
          isSelf={Boolean(editing && me?.id === editing.id)}
          onSaved={handleSaved}
          onCancel={closeForm}
        />
      </Modal>

      {credentials && <CredentialsModal credentials={credentials} onClose={closeCredentials} />}
    </div>
  );
}

UsersTab.propTypes = {
  createOpen: PropTypes.bool.isRequired,
  onCreateOpenChange: PropTypes.func.isRequired,
};
