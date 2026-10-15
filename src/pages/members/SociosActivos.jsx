import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { apiGet } from "../../api/client";
import {
  Badge,
  Button,
  EmptyState,
  PageHero,
  Section,
  Spinner,
} from "../../components/ui";
import MembershipCtaBand from "../../components/members/MembershipCtaBand.jsx";
import {
  MEMBERSHIP_BADGE_VARIANTS,
  compareBySurname,
  memberInitials,
  membershipLabel,
  normalizeText,
  stripHonorific,
} from "../../components/members/memberUtils.js";

export default function SociosActivos() {
  const { t } = useTranslation();
  const [members, setMembers] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [query, setQuery] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    setStatus("loading");
    apiGet("/members")
      .then(data => {
        if (ignore) return;
        setMembers(Array.isArray(data) ? data : []);
        setStatus("ready");
      })
      .catch(err => {
        if (ignore) return;
        console.error("Error loading active members:", err);
        setStatus("error");
      });
    return () => {
      ignore = true;
    };
  }, [reloadKey]);

  const sorted = useMemo(() => [...members].sort(compareBySurname), [members]);

  const filtered = useMemo(() => {
    const q = normalizeText(query);
    if (!q) return sorted;
    return sorted.filter(member =>
      normalizeText(
        [member.name, stripHonorific(member.name), member.country, member.city]
          .filter(Boolean)
          .join(" "),
      ).includes(q),
    );
  }, [sorted, query]);

  const total = sorted.length;
  // GET /members currently returns no location: only promise what search can match.
  const hasPlaces = useMemo(
    () => members.some(member => member.country || member.city),
    [members],
  );
  const countLabel = query.trim()
    ? t("members.search_results", {
        count: filtered.length,
        total,
        defaultValue: "Mostrando {{count}} de {{total}} socios",
      })
    : `${total} ${
        total === 1 ? t("common.member_singular") : t("common.member_plural")
      }`;

  const renderBody = () => {
    if (status === "loading") {
      return (
        <div className="members-directory-status">
          <Spinner size="lg" />
        </div>
      );
    }

    if (status === "error") {
      return (
        <EmptyState
          role="alert"
          icon={<i className="fa-solid fa-triangle-exclamation"></i>}
          title={t(
            "members.active_error_title",
            "No pudimos cargar los socios activos",
          )}
          description={t(
            "members.active_error_text",
            "Revisa tu conexión a internet e inténtalo nuevamente en unos segundos.",
          )}
          action={
            <Button
              variant="outline"
              onClick={() => setReloadKey(key => key + 1)}
            >
              <i className="fa-solid fa-rotate-right" aria-hidden="true"></i>
              {t("members.retry", "Reintentar")}
            </Button>
          }
        />
      );
    }

    if (total === 0) {
      return (
        <EmptyState
          icon={<i className="fa-solid fa-users"></i>}
          description={t("members.active_empty")}
        />
      );
    }

    return (
      <>
        <div className="members-directory-toolbar">
          <div className="members-search">
            <label htmlFor="members-search-input" className="sr-only">
              {t("members.search_label", "Buscar socio")}
            </label>
            <i
              className="fa-solid fa-magnifying-glass members-search__icon"
              aria-hidden="true"
            ></i>
            <input
              id="members-search-input"
              type="search"
              className="form-input members-search__input"
              placeholder={
                hasPlaces
                  ? t("members.search_placeholder", "Buscar por nombre o país")
                  : t("members.search_placeholder_name", "Buscar por nombre")
              }
              value={query}
              onChange={e => setQuery(e.target.value)}
              autoComplete="off"
            />
          </div>
          <p className="members-directory-count" aria-live="polite">
            {countLabel}
          </p>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<i className="fa-solid fa-magnifying-glass"></i>}
            title={t("members.search_empty_title", "Sin resultados")}
            description={t("members.search_empty_text", {
              query: query.trim(),
              defaultValue: "No encontramos socios que coincidan con «{{query}}».",
            })}
            action={
              <Button variant="outline" onClick={() => setQuery("")}>
                {t("members.search_clear", "Limpiar búsqueda")}
              </Button>
            }
          />
        ) : (
          <ul className="members-directory-grid">
            {filtered.map(member => {
              const type = String(member.membership_type || "").toLowerCase();
              const label = membershipLabel(t, type);
              return (
                <li key={member.id} className="members-directory-card">
                  <div className="members-directory-card__top">
                    <span
                      className="avatar members-directory-card__avatar"
                      aria-hidden="true"
                    >
                      {memberInitials(member.name)}
                    </span>
                    <div className="members-directory-card__info">
                      <h2 className="members-directory-card__name">
                        {member.name}
                      </h2>
                      {(member.country || member.city) && (
                        <p className="members-directory-card__place">
                          <i
                            className="fa-solid fa-location-dot"
                            aria-hidden="true"
                          ></i>
                          {[member.city, member.country]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      )}
                      {label && (
                        <Badge
                          variant={MEMBERSHIP_BADGE_VARIANTS[type] || "neutral"}
                          size="sm"
                        >
                          {label}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {member.email && (
                    <Button
                      variant="outline"
                      size="sm"
                      href={`mailto:${member.email}`}
                      className="members-directory-card__contact"
                      aria-label={t("members.contact_member", {
                        name: member.name,
                        defaultValue: "Contactar a {{name}}",
                      })}
                    >
                      <i className="fa-regular fa-envelope" aria-hidden="true"></i>
                      {t("common.contact")}
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </>
    );
  };

  return (
    <div className="page members-page">
      <PageHero
        kicker={t("header.directory")}
        title={t("members.active_title")}
        subtitle={t("members.active_subtitle")}
      />

      <Section>{renderBody()}</Section>

      <MembershipCtaBand
        secondaryTo="/por-que-ser-socio"
        secondaryLabel={t("members.btn_why", "¿Por qué ser socio?")}
      />
    </div>
  );
}
