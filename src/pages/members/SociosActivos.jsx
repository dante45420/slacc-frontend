import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { apiGet } from "../../api/client";
import {
  Grid,
  Card,
  Badge,
  Spinner,
  Alert,
  Section,
  Container,
} from "../../components/ui";

export default function SociosActivos() {
  const { t } = useTranslation();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadMembers();
  }, []);

  async function loadMembers() {
    try {
      const data = await apiGet("/members");
      setMembers(data);
    } catch (err) {
      console.error("Error loading active members:", err);
      setError(t("members.active_error"));
    } finally {
      setLoading(false);
    }
  }

  const getMembershipBadge = type => {
    const variants = {
      joven: "info",
      normal: "primary",
      gratuito: "success",
    };
    const labels = {
      joven: t("members.badge_joven"),
      normal: t("members.badge_normal"),
      gratuito: t("members.badge_gratuito"),
    };
    return {
      variant: variants[type] || "neutral",
      label: labels[type] || type,
    };
  };

  const getInitials = name => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex-center min-h-300px">
          <Spinner size="lg" />
        </div>
      );
    }

    if (error) {
      return <Alert variant="error">{error}</Alert>;
    }

    if (members.length === 0) {
      return <Alert variant="info">{t("members.active_empty")}</Alert>;
    }

    return (
      <>
        <p className="text-muted mb-5">
          {members.length}{" "}
          {members.length === 1
            ? t("common.member_singular")
            : t("common.member_plural")}
        </p>
        <Grid columns={3} gap={4}>
          {members.map(member => {
            const badge = getMembershipBadge(member.membership_type);
            return (
              <Card key={member.id} hoverable>
                <div className="flex flex-col align-center text-center gap-3">
                  <div className="flex-center socios-avatar">
                    {getInitials(member.name)}
                  </div>
                  <div>
                    <h4 className="mb-2">{member.name}</h4>
                    <Badge variant={badge.variant}>{badge.label}</Badge>
                  </div>
                  <a
                    href={`mailto:${member.email}`}
                    className="btn btn-outline btn-sm"
                  >
                    {t("common.contact")}
                  </a>
                </div>
              </Card>
            );
          })}
        </Grid>
      </>
    );
  };

  return (
    <Section>
      <Container>
        <h1 className="mb-2">{t("members.active_title")}</h1>
        <p className="text-muted mb-6 socios-intro">
          {t("members.active_subtitle")}
        </p>

        {renderContent()}
      </Container>
    </Section>
  );
}
