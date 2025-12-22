import PropTypes from "prop-types";

/**
 * Table component for displaying tabular data
 * Automatically switches to card view on mobile devices
 *
 * @example
 * <Table
 *   columns={[
 *     { key: 'name', label: 'Name' },
 *     { key: 'email', label: 'Email' },
 *     { key: 'status', label: 'Status', render: (row) => <Badge>{row.status}</Badge> }
 *   ]}
 *   data={users}
 *   onRowClick={(row) => navigate(`/users/${row.id}`)}
 *   responsive={true}
 * />
 */
export default function Table({
  columns,
  data,
  onRowClick,
  hoverable = false,
  striped = false,
  responsive = true,
  className = "",
}) {
  const tableClasses = [
    "table",
    hoverable && "table-hoverable",
    striped && "table-striped",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const containerClasses = ["table-container", responsive && "table-responsive"]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={containerClasses}>
      {/* Desktop table view */}
      <table className={tableClasses}>
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key} className={col.className || ""}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="table-empty">
                No hay datos para mostrar
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr
                key={row.id || idx}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={onRowClick ? "clickable" : ""}
              >
                {columns.map(col => (
                  <td key={col.key} className={col.className || ""}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Mobile card view */}
      {responsive && (
        <div className="table-mobile-cards">
          {data.length === 0 ? (
            <div className="table-empty-mobile">No hay datos para mostrar</div>
          ) : (
            data.map((row, idx) => (
              <div
                key={row.id || idx}
                className={`table-card ${
                  onRowClick ? "table-card-clickable" : ""
                }`}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                onKeyDown={
                  onRowClick
                    ? e => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onRowClick(row);
                        }
                      }
                    : undefined
                }
                role={onRowClick ? "button" : undefined}
                tabIndex={onRowClick ? 0 : undefined}
              >
                {columns.map(col => (
                  <div key={col.key} className="table-card-row">
                    <div className="table-card-label">{col.label}</div>
                    <div className="table-card-value">
                      {col.render ? col.render(row) : row[col.key]}
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

Table.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      render: PropTypes.func,
      className: PropTypes.string,
    })
  ).isRequired,
  data: PropTypes.array.isRequired,
  onRowClick: PropTypes.func,
  hoverable: PropTypes.bool,
  striped: PropTypes.bool,
  responsive: PropTypes.bool,
  className: PropTypes.string,
};
