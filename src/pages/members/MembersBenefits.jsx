import { Link, Navigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../auth/AuthContext.jsx";
import { PageHero, Section } from "../../components/ui";
import MembershipCtaBand from "../../components/members/MembershipCtaBand.jsx";

/**
 * /miembros: overview hub of the membership section. It links to the one
 * canonical benefits page (/por-que-ser-socio, "Beneficios" in the header and
 * footer), the directory, and the next step for the visitor (apply or log in
 * for guests; portal and profile for signed-in members).
 *
 * /miembros/beneficios used to render a second, different benefits list; its
 * content now lives on /por-que-ser-socio, so old links are redirected there.
 */
export default function MembersBenefits() {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const location = useLocation();

  if (location.pathname.replace(/\/+$/, "") === "/miembros/beneficios") {
    return <Navigate to="/por-que-ser-socio" replace />;
  }

  const authResolved = !loading && user !== undefined;
  const isGuest = authResolved && user === null;

  const sections = [
    {
      to: "/por-que-ser-socio",
      icon: "fa-solid fa-award",
      title: t("header.benefits"),
      text: t(
        "members.hub_benefits_text",
        "Por qué ser socio, qué incluye la membresía y qué categoría te corresponde.",
      ),
    },
    {
      to: "/miembros/socios-activos",
      icon: "fa-solid fa-address-book",
      title: t("header.active_members"),
      text: t("members.active_subtitle"),
    },
  ];

  // Visitor-specific next steps, only once the session is known so members
  // never see the guest "apply" card flash.
  const nextSteps = !authResolved
    ? []
    : isGuest
      ? [
          {
            to: "/solicitar-membresia",
            icon: "fa-solid fa-file-signature",
            title: t("header.request_membership"),
            text: t(
              "members.hub_apply_text",
              "Completa la solicitud en línea. El comité de membresía revisará tus antecedentes y te contactará por email.",
            ),
          },
          {
            to: "/login",
            icon: "fa-solid fa-right-to-bracket",
            title: t("header.login"),
            text: t(
              "members.hub_login_text",
              "¿Ya eres socio? Ingresa para ver tu perfil y el Portal de Socios.",
            ),
          },
        ]
      : [
          {
            to: "/portal-socios",
            icon: "fa-solid fa-door-open",
            title: t("header.private_portal"),
            text: t("portal.subtitle"),
          },
          {
            to: "/perfil",
            icon: "fa-solid fa-user",
            title: t("header.profile"),
            text: t("portal.link_profile"),
          },
        ];

  const placeholders = authResolved ? 0 : 2;

  return (
    <div className="page members-page">
      <PageHero
        kicker={t("members.kicker", "Membresía")}
        title={t("header.members")}
        subtitle={t(
          "members.hub_subtitle",
          "La red de especialistas en cirugía de cadera de Latinoamérica: conoce los beneficios de ser socio, el directorio de socios activos y cómo postular.",
        )}
      />

      <Section>
        <div className="section-head">
          <div className="section-head__text">
            <p className="eyebrow">{t("members.explore_eyebrow", "Explora")}</p>
            <h2 className="section-title">
              {t("members.explore_title", "Conoce más sobre la membresía")}
            </h2>
          </div>
        </div>
        <ul className="members-links members-links--hub">
          {[...sections, ...nextSteps].map(item => (
            <li key={item.to}>
              <Link to={item.to} className="members-link-card">
                <span className="icon-tile" aria-hidden="true">
                  <i className={item.icon}></i>
                </span>
                <span className="members-link-card__body">
                  <span className="members-link-card__title">{item.title}</span>
                  <span className="members-link-card__text">{item.text}</span>
                </span>
                <i
                  className="fa-solid fa-arrow-right members-link-card__arrow"
                  aria-hidden="true"
                ></i>
              </Link>
            </li>
          ))}
          {Array.from({ length: placeholders }, (_, index) => (
            <li key={`placeholder-${index}`} aria-hidden="true">
              <span className="members-link-card members-link-card--placeholder"></span>
            </li>
          ))}
        </ul>
      </Section>

      <MembershipCtaBand
        secondaryTo="/por-que-ser-socio"
        secondaryLabel={t("members.btn_benefits")}
      />
    </div>
  );
}
