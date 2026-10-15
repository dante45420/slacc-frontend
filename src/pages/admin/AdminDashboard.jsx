import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button, PageHero, Section, Tabs } from "../../components/ui";
import ApplicationsTab from "../../components/admin/ApplicationsTab";
import EventsTab from "../../components/admin/EventsTab";
import NewsTab from "../../components/admin/NewsTab";
import OverviewTab from "../../components/admin/OverviewTab";
import UsersTab from "../../components/admin/UsersTab";
import useDocumentTitle from "../../hooks/useDocumentTitle";

// Other pages link to /admin?tab=<id>; keep these ids stable.
const TAB_IDS = ["overview", "users", "applications", "news", "events"];

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const requested = searchParams.get("tab");
  const activeTab = TAB_IDS.includes(requested) ? requested : "overview";
  const [createFor, setCreateFor] = useState(null);
  const pageRef = useRef(null);

  useDocumentTitle(t("admin.dashboard.doc_title", "Panel de administración"));

  // A pending "create" request belongs to the tab that asked for it.
  useEffect(() => {
    setCreateFor(prev => (prev && prev !== activeTab ? null : prev));
  }, [activeTab]);

  // On phones the tab bar scrolls: keep the active tab visible.
  useEffect(() => {
    const list = pageRef.current?.querySelector(".admin-tabs");
    const tab = list?.querySelector(`#tab-${activeTab}`);
    if (!list || !tab) return;
    const listBox = list.getBoundingClientRect();
    const tabBox = tab.getBoundingClientRect();
    if (tabBox.left < listBox.left || tabBox.right > listBox.right) {
      list.scrollLeft += tabBox.left - listBox.left - (listBox.width - tabBox.width) / 2;
    }
  }, [activeTab]);

  // The tab lives in the URL (replace, not push) so reload and Back keep it.
  const changeTab = id => {
    setCreateFor(null);
    setSearchParams(
      prev => {
        const next = new URLSearchParams(prev);
        if (id === "overview") next.delete("tab");
        else next.set("tab", id);
        return next;
      },
      { replace: true },
    );
  };

  const tabs = [
    { id: "overview", label: t("admin.tabs.overview", "Resumen") },
    { id: "users", label: t("admin.tabs.users", "Socios") },
    { id: "applications", label: t("admin.tabs.applications", "Postulaciones") },
    { id: "news", label: t("admin.tabs.news", "Noticias") },
    { id: "events", label: t("admin.tabs.events", "Eventos") },
  ];

  const primaryActions = {
    overview: {
      label: t("admin.dashboard.action_review", "Revisar postulaciones"),
      icon: "fa-solid fa-file-signature",
      variant: "outline",
      onClick: () => changeTab("applications"),
    },
    users: {
      label: t("admin.users_tab.create", "Nuevo socio"),
      icon: "fa-solid fa-user-plus",
      onClick: () => setCreateFor("users"),
    },
    news: {
      label: t("admin.news_tab.create", "Nueva noticia"),
      icon: "fa-solid fa-plus",
      onClick: () => setCreateFor("news"),
    },
    events: {
      label: t("admin.events_tab.create", "Nuevo evento"),
      icon: "fa-solid fa-plus",
      onClick: () => setCreateFor("events"),
    },
  };
  const action = primaryActions[activeTab];

  const createProps = id => ({
    createOpen: createFor === id,
    onCreateOpenChange: open => setCreateFor(open ? id : null),
  });

  return (
    <div className="page admin-page" ref={pageRef}>
      <PageHero
        className="admin-hero"
        kicker={t("admin.dashboard.kicker", "Administración")}
        title={t("admin.dashboard.title", "Panel de administración")}
        subtitle={t(
          "admin.dashboard.subtitle",
          "Gestiona socios, postulaciones, noticias y eventos de la sociedad.",
        )}
      >
        <div className="admin-hero__actions">
          {action && (
            <Button
              variant={action.variant || "primary"}
              onClick={action.onClick}
              className="admin-hero__action"
              data-admin-action={activeTab}
            >
              <i className={action.icon} aria-hidden="true"></i>
              {action.label}
            </Button>
          )}
        </div>
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={changeTab}
          className="admin-tabs"
          ariaLabel={t("admin.tabs.label", "Secciones del panel")}
          panelIdPrefix="admin-panel-"
        />
      </PageHero>

      <Section padding="sm" className="admin-body">
        <div
          role="tabpanel"
          id={`admin-panel-${activeTab}`}
          aria-labelledby={`tab-${activeTab}`}
          className="admin-panel"
        >
          {activeTab === "overview" && <OverviewTab onNavigate={changeTab} />}
          {activeTab === "users" && <UsersTab {...createProps("users")} />}
          {activeTab === "applications" && <ApplicationsTab />}
          {activeTab === "news" && <NewsTab {...createProps("news")} />}
          {activeTab === "events" && <EventsTab {...createProps("events")} />}
        </div>
      </Section>
    </div>
  );
}
