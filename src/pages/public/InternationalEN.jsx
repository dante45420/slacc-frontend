import { Link } from "react-router-dom";
import { Section, Card, Grid } from "../../components/ui";

export default function InternationalEN() {
  return (
    <>
      <Section variant="primary" padding="lg" containerSize="lg">
        <div className="intl-header">
          <p className="intl-kicker">SLACC International</p>
          <h1 className="intl-title">Latin American Hip Surgery Society</h1>
          <p className="intl-subtitle">
            Main sections and congress information in English.
          </p>
        </div>
      </Section>

      <Section padding="lg" containerSize="lg">
        <Grid columns={2} gap={4} className="intl-grid">
          <Card className="intl-card">
            <h2 className="intl-card-title">Main Sections</h2>
            <ul className="intl-list">
              <li>About the Society</li>
              <li>National Alliances</li>
              <li>Education and Fellowships</li>
              <li>Scientific Events</li>
              <li>Membership and Directory</li>
            </ul>
            <Link to="/" className="btn btn-outline btn-sm">
              Go to Spanish site
            </Link>
          </Card>

          <Card className="intl-card">
            <h2 className="intl-card-title">Main Congress</h2>
            <p className="intl-congress-name">SLARD 2026 - Save the Date</p>
            <p className="intl-card-text">
              Follow congress updates, abstract submissions, and registration
              timeline in our Events section.
            </p>
            <Link to="/eventos/proximos" className="btn btn-primary btn-sm">
              View Congress Info
            </Link>
          </Card>
        </Grid>
      </Section>
    </>
  );
}
