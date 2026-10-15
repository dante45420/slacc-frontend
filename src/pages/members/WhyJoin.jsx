import { useTranslation } from "react-i18next";
import { useAuth } from "../../auth/AuthContext.jsx";
import { Button, PageHero, Section } from "../../components/ui";
import FeatureTiles from "../../components/members/FeatureTiles.jsx";
import MembershipCtaBand from "../../components/members/MembershipCtaBand.jsx";

const WHY_ICONS = [
  "fa-solid fa-user-graduate",
  "fa-solid fa-users",
  "fa-solid fa-shield-halved",
  "fa-solid fa-trophy",
  "fa-solid fa-address-book",
  "fa-solid fa-chart-line",
];

// The categories in the locale files are ordered: Next Gen, then regular member.
const CATEGORY_ICONS = ["fa-solid fa-seedling", "fa-solid fa-user-doctor"];

/**
 * /por-que-ser-socio: the single benefits page of the site ("Beneficios" in the
 * header and footer; /miembros/beneficios redirects here). It merges the "why
 * join" pitch, the list of what membership includes and the categories.
 */
export default function WhyJoin() {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const tiles = t("members.why_tiles", { returnObjects: true });
  const included = t("members.benefits_tiles", { returnObjects: true });
  const categories = t("members.categories", { returnObjects: true });
  const isGuest = !loading && user === null;

  return (
    <div className="page members-page">
      <PageHero
        kicker={t("members.kicker", "Membresía")}
        title={t("members.why_title")}
        subtitle={t("members.why_subtitle")}
      >
        <div className="page-hero__actions">
          {isGuest && (
            <Button variant="accent" size="lg" to="/solicitar-membresia">
              {t("members.btn_apply")}
            </Button>
          )}
          <Button variant="outline" size="lg" to="/miembros/socios-activos">
            {t("members.active_title")}
          </Button>
        </div>
      </PageHero>

      <Section>
        <div className="section-head">
          <div className="section-head__text">
            <p className="eyebrow">{t("header.benefits")}</p>
            <h2 className="section-title">
              {t("members.why_section_title", "Lo que te ofrece SLACC")}
            </h2>
          </div>
        </div>
        <FeatureTiles
          items={Array.isArray(tiles) ? tiles : []}
          icons={WHY_ICONS}
          headingLevel={3}
        />

        {Array.isArray(included) && included.length > 0 && (
          <div className="members-included">
            <h3 className="members-included__title">
              {t("members.included_title", "Además, como socio cuentas con")}
            </h3>
            <ul className="members-included__list">
              {included.map(item => (
                <li key={item.title} className="members-included__item">
                  <span className="members-included__check" aria-hidden="true">
                    <i className="fa-solid fa-check"></i>
                  </span>
                  <span className="members-included__body">
                    <span className="members-included__name">{item.title}</span>
                    <span className="members-included__text">{item.desc}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Section>

      {Array.isArray(categories) && categories.length > 0 && (
        <Section variant="surface">
          <div className="section-head">
            <div className="section-head__text">
              <p className="eyebrow">
                {t("members.categories_eyebrow", "Categorías")}
              </p>
              <h2 className="section-title">{t("members.categories_title")}</h2>
              <p className="section-lead">
                {t(
                  "members.categories_lead",
                  "Elige la categoría que corresponde a tu etapa profesional.",
                )}
              </p>
            </div>
          </div>

          <ul className="members-categories">
            {categories.map((category, index) => {
              return (
                <li key={category.title} className="members-category">
                  <div className="members-category__head">
                    <span className="icon-tile" aria-hidden="true">
                      <i className={CATEGORY_ICONS[index] || CATEGORY_ICONS[1]}></i>
                    </span>
                  </div>
                  <h3 className="members-category__title">{category.title}</h3>
                  <p className="members-category__text">{category.desc}</p>
                  {isGuest && (
                    <div className="members-category__footer">
                      <Button
                        variant="outline"
                        to="/solicitar-membresia"
                        fullWidth
                      >
                        {t("members.btn_apply")}
                      </Button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </Section>
      )}

      <MembershipCtaBand
        secondaryTo="/miembros/socios-activos"
        secondaryLabel={t("members.active_title")}
      />
    </div>
  );
}
