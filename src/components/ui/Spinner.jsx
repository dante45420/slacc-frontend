import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";

export default function Spinner({ size = "md", className, label }) {
  const { t } = useTranslation();
  return (
    <div
      className={`spinner spinner-${size} ${className || ""}`.trim()}
      role="status"
      aria-label={label || t("common.loading", "Cargando...")}
    />
  );
}

Spinner.propTypes = {
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  className: PropTypes.string,
  label: PropTypes.string,
};
