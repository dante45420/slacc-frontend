import { useTranslation } from "react-i18next";
import { Section, PageHero, Button, EmptyState } from "../../components/ui";
import { initials } from "../../data/board.js";

// Icons by position in `comites.list`.
const COMMITTEE_ICONS = [
  "fa-solid fa-sitemap",
  "fa-solid fa-scale-balanced",
  "fa-solid fa-flask",
  "fa-solid fa-chess-knight",
  "fa-solid fa-graduation-cap",
  "fa-solid fa-diagram-project",
];

// Locale entries such as "Comité A" / "Committee B" are placeholders, not real
// committees: they stay hidden until the society provides the real name.
const isPlaceholderName = name =>
  /^\S+\s+[A-Z]$/.test(String(name || "").trim());

export default function Comites() {
  const { t } = useTranslation();
  const list = t("comites.list", { returnObjects: true });
  const committees = (Array.isArray(list) ? list : [])
    .map((committee, index) => ({ ...committee, index }))
    .filter(committee => committee.name && !isPlaceholderName(committee.name));

  return (
    <div className="page society-page society-page--flush">
      <PageHero
        kicker={t("header.society")}
        title={t("comites.title")}
        subtitle={t("comites.subtitle")}
      />

      <Section aria-label={t("comites.title")}>
        {committees.length === 0 ? (
          <EmptyState
            icon={<i className="fa-solid fa-users" />}
            title={t("comites.empty_title", "Comités en conformación")}
            description={t(
              "comites.empty_text",
              "Pronto publicaremos los comités de trabajo de la sociedad y sus integrantes.",
            )}
          />
        ) : (
          <ul className="society-committees">
            {committees.map(committee => {
              const members = Array.isArray(committee.members)
                ? committee.members.filter(member => member?.name)
                : [];
              return (
                <li
                  key={committee.index}
                  id={`comite-${committee.index}`}
                  className="society-committee"
                >
                  <span className="icon-tile" aria-hidden="true">
                    <i
                      className={
                        COMMITTEE_ICONS[committee.index] || "fa-solid fa-users"
                      }
                    />
                  </span>
                  <div className="society-committee-body">
                    <h2 className="society-committee-name">{committee.name}</h2>
                    {committee.description && (
                      <p className="society-committee-text">
                        {committee.description}
                      </p>
                    )}

                    {members.length > 0 && (
                      <div className="society-committee-members">
                        <h3 className="society-committee-members-title">
                          {t("comites.members_title")}
                        </h3>
                        <ul className="society-committee-member-list">
                          {members.map(member => (
                            <li
                              key={member.name}
                              className="society-committee-member"
                            >
                              <span
                                className="society-committee-avatar"
                                aria-hidden="true"
                              >
                                {initials(member.name)}
                              </span>
                              <span className="society-committee-member-text">
                                <span className="society-committee-member-name">
                                  {member.name}
                                </span>
                                {member.role && (
                                  <span className="society-committee-member-role">
                                    {committee.roles?.[member.role] ||
                                      member.role}
                                  </span>
                                )}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      <Section variant="surface" aria-labelledby="society-committees-functions">
        <div className="society-functions">
          <div className="society-functions-head">
            <p className="eyebrow">{t("header.committees")}</p>
            <h2 id="society-committees-functions" className="section-title">
              {t("comites.functions_title")}
            </h2>
          </div>
          <div className="society-functions-body">
            <p>{t("comites.functions_p1")}</p>
            <p>{t("comites.functions_p2")}</p>
            <p>{t("comites.functions_p3")}</p>
            <div className="society-functions-actions">
              <Button variant="primary" to="/contacto">
                <i className="fa-regular fa-envelope" aria-hidden="true" />
                {t("comites.contact_btn", "Contactar a la secretaría")}
              </Button>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
