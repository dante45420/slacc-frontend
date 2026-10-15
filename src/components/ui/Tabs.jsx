import { useRef } from "react";
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
  ariaLabel,
  panelIdPrefix,
}) {
  const listRef = useRef(null);
  const variantClasses = {
    default: "tabs-default",
    segmented: "tabs-segmented",
  };

  // Arrow keys move between tabs (WAI-ARIA tabs pattern, automatic activation)
  const onKeyDown = e => {
    const idx = tabs.findIndex(tab => tab.id === activeTab);
    let next = null;
    if (e.key === "ArrowRight") next = (idx + 1) % tabs.length;
    else if (e.key === "ArrowLeft") next = (idx - 1 + tabs.length) % tabs.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = tabs.length - 1;
    if (next === null) return;
    e.preventDefault();
    onChange(tabs[next].id);
    listRef.current?.querySelectorAll('[role="tab"]')[next]?.focus();
  };

  return (
    <div
      ref={listRef}
      className={`tabs ${variantClasses[variant]} ${className}`.trim()}
      role="tablist"
      aria-label={ariaLabel}
      onKeyDown={onKeyDown}
    >
      {tabs.map(tab => {
        const selected = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            className={`tab-button ${selected ? "active" : ""}`.trim()}
            onClick={() => onChange(tab.id)}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls={panelIdPrefix ? `${panelIdPrefix}${tab.id}` : undefined}
            tabIndex={selected ? 0 : -1}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

Tabs.propTypes = {
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.node.isRequired,
    })
  ).isRequired,
  activeTab: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  variant: PropTypes.oneOf(["default", "segmented"]),
  className: PropTypes.string,
  ariaLabel: PropTypes.string,
  /** When set, each tab gets aria-controls="<prefix><tab.id>" */
  panelIdPrefix: PropTypes.string,
};
