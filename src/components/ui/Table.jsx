import PropTypes from "prop-types";

/**
 * Table component for displaying tabular data
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
 * />
 */
export default function Table({
  columns,
  data,
  onRowClick,
  hoverable = false,
  striped = false,
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

  return (
    <div className="table-container">
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
  className: PropTypes.string,
};
