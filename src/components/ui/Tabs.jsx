import PropTypes from "prop-types";

/**
 * Tabs component for tabbed navigation
 *
 * @example
 * <Tabs
 *   tabs={[
 *     { id: 'tab1', label: 'Tab 1' },
 *     { id: 'tab2', label: 'Tab 2' }
 *   ]}
 *   activeTab="tab1"
 *   onChange={(id) => setActiveTab(id)}
 * />
 */
export default function Tabs({
  tabs,
  activeTab,
  onChange,
  variant = "default",
  className = "",
}) {
  const variantClasses = {
    default: "tabs-default",
    segmented: "tabs-segmented",
  };

  return (
    <div className={`tabs ${variantClasses[variant]} ${className}`}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
          onClick={() => onChange(tab.id)}
          type="button"
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

Tabs.propTypes = {
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  activeTab: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  variant: PropTypes.oneOf(["default", "segmented"]),
  className: PropTypes.string,
};
