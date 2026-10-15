import { Component } from "react";
import PropTypes from "prop-types";
import { withTranslation } from "react-i18next";

// Catches render errors and failed lazy-chunk loads so one broken page
// doesn't blank the whole site. Reset by changing `resetKey` (the pathname).
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("Unhandled UI error:", error, info?.componentStack);
  }

  componentDidUpdate(prevProps) {
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  render() {
    const { error } = this.state;
    const { t, children } = this.props;
    if (!error) return children;

    const chunkFailed = /Failed to fetch dynamically imported module|Loading chunk|Importing a module script failed/i.test(
      String(error?.message || error),
    );

    return (
      <div className="page">
        <div className="container-sm error-boundary">
          <div className="empty-state">
            <div className="empty-state-icon" aria-hidden="true">
              <i className="fa-solid fa-triangle-exclamation"></i>
            </div>
            <h1 className="empty-state-title">
              {t("errors.page_title", "Algo salió mal")}
            </h1>
            <p className="empty-state-description">
              {chunkFailed
                ? t("errors.chunk_description", "Hay una nueva versión del sitio o se perdió la conexión. Recarga la página para continuar.")
                : t("errors.page_description", "No pudimos mostrar esta página. Intenta recargarla o vuelve al inicio.")}
            </p>
            <div className="btn-group justify-center">
              <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
                {t("errors.reload", "Recargar")}
              </button>
              <a className="btn btn-outline" href="/">
                {t("notFound.btn_home", "Volver al inicio")}
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node,
  resetKey: PropTypes.string,
  t: PropTypes.func.isRequired,
};

export default withTranslation()(ErrorBoundary);
