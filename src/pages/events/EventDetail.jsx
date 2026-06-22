import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../auth/AuthContext.jsx";
import { apiGet, apiPost } from "../../api/client.js";
import Section from "../../components/ui/Section.jsx";
import Button from "../../components/ui/Button.jsx";
import Card from "../../components/ui/Card.jsx";
import Badge from "../../components/ui/Badge.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import Alert from "../../components/ui/Alert.jsx";
import { useToast } from "../../components/ui/Toast.jsx";
import { sanitizeHtml } from "../../utils/sanitize.js";
import {
  formatDate as formatLocaleDate,
  formatDateTime as formatLocaleDateTime,
} from "../../utils/i18nLocale.js";

const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || "http://localhost:5000";

function formatPrice(price, t) {
  if (price === 0) return t("common.free");
  if (!price) return null;
  return `$${price.toLocaleString("es-CL")}`;
}

export default function EventDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await apiGet(`/events/${id}`);
        setEvent(data);
      } catch (e) {
        setError(e.message || t("events.detail_load_error"));
      } finally {
        setLoading(false);
      }
    }
    if (id) load();
  }, [id, t]);

  const handleEnroll = async () => {
    if (!user) {
      toast.error(t("events.login_required"));
      navigate("/login");
      return;
    }

    setEnrolling(true);
    try {
      const data = await apiPost(`/events/${id}/enroll`, {
        name: user.name || user.email,
        email: user.email,
        phone: user.phone || "",
      });

      toast.success(
        `${t("events.enroll_success")} ${data.message || t("events.enroll_success_detail")}`,
      );

      const eventData = await apiGet(`/events/${id}`);
      setEvent(eventData);
    } catch (err) {
      toast.error(err.message || t("events.enroll_error"));
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <Section variant="default">
        <div className="event-detail-loading">
          <Spinner size="lg" />
          <p className="event-detail-loading-text">
            {t("events.detail_loading")}
          </p>
        </div>
      </Section>
    );
  }

  if (error || !event) {
    return (
      <Section variant="default">
        <Alert variant="error">{error || t("events.detail_not_found")}</Alert>
      </Section>
    );
  }

  const formatType =
    event.format === "webinar"
      ? t("events.format_webinar")
      : t("events.format_in_person");
  const isRegistrationClosed = event.registration_deadline
    ? new Date(event.registration_deadline) < new Date()
    : false;

  const hasPricing = event.price_member > 0 || event.price_non_member > 0;
  const hasCapacity = event.max_students && event.max_students > 0;

  return (
    <Section variant="default" padding="lg">
      <Button variant="outline" onClick={() => navigate(-1)} className="mb-4">
        <i className="fa-solid fa-arrow-left"></i> {t("common.back")}
      </Button>

      <div className="event-detail-layout">
        <Card className="event-detail-main">
          {event.image_url && (
            <img
              src={
                event.image_url.startsWith("http")
                  ? event.image_url
                  : `${API_ORIGIN}${event.image_url}`
              }
              alt={event.title}
              className="event-detail-image"
            />
          )}

          <div className="event-detail-header">
            <div className="event-detail-header-top">
              <div className="event-detail-badges">
                <Badge
                  variant={event.format === "webinar" ? "info" : "secondary"}
                  size="md"
                >
                  <i
                    className={`fa-solid ${event.format === "webinar" ? "fa-video" : "fa-location-dot"}`}
                  ></i>
                  {formatType}
                </Badge>
                {isRegistrationClosed && (
                  <Badge variant="error" size="md">
                    <i className="fa-solid fa-lock"></i>{" "}
                    {t("events.registration_closed")}
                  </Badge>
                )}
                {event.is_enrolled && (
                  <Badge variant="success" size="md">
                    <i className="fa-solid fa-check"></i>{" "}
                    {t("events.registered")}
                  </Badge>
                )}
              </div>
              {hasCapacity && (
                <div className="event-detail-spots font-medium text-sm">
                  <i className="fa-solid fa-users"></i>
                  <span>
                    {event.enrollment_count === undefined
                      ? event.max_students
                      : `${event.enrollment_count} / ${event.max_students}`}{" "}
                    {t("common.spots")}
                  </span>
                </div>
              )}
            </div>

            <h1 className="event-detail-title">{event.title}</h1>

            {event.description && (
              <p className="event-detail-description">{event.description}</p>
            )}
          </div>

          {event.content && (
            <div className="event-detail-content-section">
              <h2 className="event-detail-section-title">
                <i className="fa-solid fa-info-circle"></i>{" "}
                {t("events.description_title")}
              </h2>
              <div
                dangerouslySetInnerHTML={{
                  __html: sanitizeHtml(event.content),
                }}
                className="event-detail-content"
              />
            </div>
          )}

          {event.instructor && (
            <div className="event-detail-instructor-section">
              <h2 className="event-detail-section-title">
                <i className="fa-solid fa-chalkboard-user"></i>{" "}
                {t("events.instructor_title")}
              </h2>
              <div className="event-detail-instructor">
                <div className="event-detail-instructor-avatar">
                  <i className="fa-solid fa-user"></i>
                </div>
                <div className="event-detail-instructor-info">
                  <span className="font-semibold text-lg">
                    {event.instructor}
                  </span>
                </div>
              </div>
            </div>
          )}
        </Card>

        <div className="event-detail-sidebar">
          <Card className="event-detail-sidebar-card">
            <h3 className="event-detail-sidebar-title">
              <i className="fa-solid fa-calendar"></i> {t("events.datetime_title")}
            </h3>
            <div className="event-detail-info-list">
              <div className="event-detail-info-item">
                <span className="event-detail-info-label">
                  {t("events.start")}
                </span>
                <span className="event-detail-info-value font-medium">
                  {formatLocaleDateTime(event.start_date) || t("common.tbc")}
                </span>
              </div>
              {event.end_date && (
                <div className="event-detail-info-item">
                  <span className="event-detail-info-label">
                    {t("events.end")}
                  </span>
                  <span className="event-detail-info-value font-medium">
                    {formatLocaleDateTime(event.end_date)}
                  </span>
                </div>
              )}
              {event.duration_hours && (
                <div className="event-detail-info-item">
                  <span className="event-detail-info-label">
                    {t("events.duration")}
                  </span>
                  <span className="event-detail-info-value font-medium">
                    {event.duration_hours}{" "}
                    {event.duration_hours === 1
                      ? t("common.hour_one")
                      : t("common.hour_other")}
                  </span>
                </div>
              )}
              {event.registration_deadline && (
                <div className="event-detail-info-item">
                  <span className="event-detail-info-label">
                    {t("events.registration_until")}
                  </span>
                  <span
                    className={`event-detail-info-value font-medium ${
                      isRegistrationClosed ? "text-error" : ""
                    }`}
                  >
                    {formatLocaleDate(event.registration_deadline)}
                    {isRegistrationClosed &&
                      ` (${t("common.closed_paren")})`}
                  </span>
                </div>
              )}
            </div>
          </Card>

          <Card className="event-detail-sidebar-card">
            <h3 className="event-detail-sidebar-title">
              <i className="fa-solid fa-location-dot"></i>{" "}
              {t("events.location_title")}
            </h3>
            <div className="event-detail-info-list">
              <div className="event-detail-info-item">
                <span className="event-detail-info-label">
                  {t("events.format_label")}
                </span>
                <span className="event-detail-info-value font-medium">
                  {formatType}
                </span>
              </div>
              {event.location && (
                <div className="event-detail-info-item">
                  <span className="event-detail-info-label">
                    {event.format === "webinar"
                      ? t("events.platform")
                      : t("events.address")}
                  </span>
                  <span className="event-detail-info-value font-medium">
                    {event.location}
                  </span>
                </div>
              )}
            </div>
          </Card>

          {hasPricing && (
            <Card className="event-detail-sidebar-card">
              <h3 className="event-detail-sidebar-title">
                <i className="fa-solid fa-ticket"></i> {t("events.pricing_title")}
              </h3>
              <div className="event-detail-pricing">
                <div className="event-detail-price-item">
                  <span className="event-detail-price-label">
                    {t("events.price_members")}
                  </span>
                  <span className="event-detail-price-value event-detail-price-member font-semibold text-lg">
                    {formatPrice(event.price_member, t)}
                  </span>
                </div>
                <div className="event-detail-price-item">
                  <span className="event-detail-price-label">
                    {t("events.price_non_members")}
                  </span>
                  <span className="event-detail-price-value font-semibold text-lg">
                    {formatPrice(event.price_non_member, t)}
                  </span>
                </div>
                {event.price_joven > 0 && (
                  <div className="event-detail-price-item">
                    <span className="event-detail-price-label">
                      {t("events.price_young")}
                    </span>
                    <span className="event-detail-price-value event-detail-price-member font-semibold text-lg">
                      {formatPrice(event.price_joven, t)}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>

        <div className="event-detail-enroll-container">
          <Button
            variant="primary"
            onClick={handleEnroll}
            disabled={enrolling || event.is_enrolled || isRegistrationClosed}
            className="event-detail-enroll-btn"
          >
            {isRegistrationClosed && (
              <>
                <i className="fa-solid fa-lock"></i>{" "}
                {t("events.registration_ended")}
              </>
            )}
            {!isRegistrationClosed && event.is_enrolled && (
              <>
                <i className="fa-solid fa-check"></i>{" "}
                {t("events.already_enrolled")}
              </>
            )}
            {!isRegistrationClosed && !event.is_enrolled && enrolling && (
              <>
                <Spinner size="sm" /> {t("common.processing")}
              </>
            )}
            {!isRegistrationClosed && !event.is_enrolled && !enrolling && (
              <>
                <i className="fa-solid fa-pen-to-square"></i>{" "}
                {t("events.enroll_event")}
              </>
            )}
          </Button>
        </div>
      </div>
    </Section>
  );
}
