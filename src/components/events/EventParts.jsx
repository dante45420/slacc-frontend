import { useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { assetUrl } from "../../api/client";
import Badge from "../ui/Badge.jsx";
import { formatPrice, kindLabel, kindMeta } from "./eventUtils";

/** 16:9 event image, or a branded navy placeholder when there is none. */
export function EventMedia({ event, kind, variant = "card", alt = "", children }) {
  const { t } = useTranslation();
  const [failed, setFailed] = useState(false);
  const src = assetUrl(event.image_url);
  const hasImage = Boolean(src) && !failed;

  return (
    <div
      className={`events-media events-media--${variant}${hasImage ? "" : " events-media--placeholder"}`}
    >
      {hasImage ? (
        <img
          className="events-media__img"
          src={src}
          alt={alt}
          loading={variant === "card" ? "lazy" : undefined}
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="events-media__placeholder" aria-hidden="true">
          <span className="events-media__icon">
            <i className={`fa-solid ${kindMeta(kind).icon}`}></i>
          </span>
          {variant === "cover" && (
            <span className="events-media__caption">
              {kindLabel(kind, t)} · SLACC
            </span>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

EventMedia.propTypes = {
  event: PropTypes.shape({ image_url: PropTypes.string }).isRequired,
  kind: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(["card", "cover"]),
  alt: PropTypes.string,
  children: PropTypes.node,
};

export function KindBadge({ kind }) {
  const { t } = useTranslation();
  const meta = kindMeta(kind);
  return (
    <Badge variant={meta.badge}>
      <i className={`fa-solid ${meta.icon}`} aria-hidden="true"></i>
      {kindLabel(kind, t)}
    </Badge>
  );
}

KindBadge.propTypes = { kind: PropTypes.string.isRequired };

export function StatusBadge({ badge }) {
  if (!badge) return null;
  return (
    <Badge variant={badge.variant}>
      <i className={`fa-solid ${badge.icon}`} aria-hidden="true"></i>
      {badge.label}
    </Badge>
  );
}

StatusBadge.propTypes = {
  badge: PropTypes.shape({
    variant: PropTypes.string,
    icon: PropTypes.string,
    label: PropTypes.string,
  }),
};

/** Price the viewer pays, with the reference price as secondary info. */
export function PriceSummary({ pricing, size = "md" }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const amount = formatPrice(pricing.price, lang, t);

  let note = null;
  if (pricing.isMemberPrice && pricing.general > pricing.price) {
    note = (
      <>
        <span className="sr-only">{t("events.general_price")}: </span>
        <s>{formatPrice(pricing.general, lang, t)}</s>
        {pricing.discount > 0 && (
          <span className="events-price__save">−{pricing.discount}%</span>
        )}
      </>
    );
  } else if (!pricing.isMemberPrice && pricing.member < pricing.general) {
    note = t("events.member_price_note", "Socios: {{price}}", {
      price: formatPrice(pricing.member, lang, t),
    });
  }

  return (
    <div className={`events-price events-price--${size}`}>
      <span className="events-price__label">
        {pricing.isMemberPrice
          ? t("events.your_member_price", "Tu valor socio")
          : t("events.general_price")}
      </span>
      <span className="events-price__amount">{amount}</span>
      {note && <span className="events-price__note">{note}</span>}
    </div>
  );
}

PriceSummary.propTypes = {
  pricing: PropTypes.shape({
    price: PropTypes.number,
    general: PropTypes.number,
    member: PropTypes.number,
    isMemberPrice: PropTypes.bool,
    discount: PropTypes.number,
  }).isRequired,
  size: PropTypes.oneOf(["md", "lg"]),
};
