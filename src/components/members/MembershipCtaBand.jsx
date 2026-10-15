import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../auth/AuthContext.jsx";
import { Button, Section } from "../ui";

/**
 * Navy call-to-action band closing the membership pages. Guests are invited to
 * apply; signed-in members get their portal/profile instead. Nothing renders
 * while the session is still being resolved, so members never see the apply CTA.
 */
export default function MembershipCtaBand({ secondaryTo, secondaryLabel }) {
  const { t } = useTranslation();
  const { user, loading } = useAuth();

  if (loading || user === undefined) return null;

  const isGuest = user === null;

  return (
    <Section variant="brand" padding="default" className="members-cta-band">
      <div className="members-cta-band__inner">
        <div className="members-cta-band__text">
          <p className="eyebrow">
            {isGuest ? t("header.join") : t("portal.kicker")}
          </p>
          <h2 className="members-cta-band__title">
            {isGuest
              ? t(
                  "members.cta_title",
                  "Súmate a la red latinoamericana de cirugía de cadera",
                )
              : t("members.cta_member_title", "Ya eres parte de SLACC")}
          </h2>
          <p className="members-cta-band__lead">
            {isGuest
              ? t(
                  "members.cta_text",
                  "Completa la solicitud en línea. El comité de membresía revisará tus antecedentes y te contactará por email.",
                )
              : t(
                  "members.cta_member_text",
                  "Accede al portal de socios y mantén tus datos al día desde tu perfil.",
                )}
          </p>
        </div>
        <div className="members-cta-band__actions">
          {isGuest ? (
            <>
              <Button variant="inverse" size="lg" to="/solicitar-membresia">
                {t("members.btn_apply")}
              </Button>
              {secondaryTo && (
                <Button variant="outline-inverse" size="lg" to={secondaryTo}>
                  {secondaryLabel}
                </Button>
              )}
            </>
          ) : (
            <>
              <Button variant="inverse" size="lg" to="/portal-socios">
                {t("header.private_portal")}
              </Button>
              <Button variant="outline-inverse" size="lg" to="/perfil">
                {t("header.profile")}
              </Button>
            </>
          )}
        </div>
      </div>
    </Section>
  );
}

MembershipCtaBand.propTypes = {
  secondaryTo: PropTypes.string,
  secondaryLabel: PropTypes.node,
};
