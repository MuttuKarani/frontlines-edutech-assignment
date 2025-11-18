import { FaArrowUp, FaArrowDown } from "react-icons/fa";

const ReusableTable = ({ data, columns, sortKey, sortDir, onSort }) => {
  return (
    <table className="table table-striped table-bordered reusable-table">
      <thead className="table-primary">
        <tr>
          {columns.map((col) => (
            <th
              key={col.key}
              onClick={() => col.sortable && onSort(col.key)}
              className={col.sortable ? "sortable-column" : ""}
            >
              <span>
                {col.label}
                {/* Sorting Icon */}
                {sortKey === col.key && (
                  <>
                    {sortDir === "asc" ? (
                      <FaArrowUp className="ms-1 text-primary" />
                    ) : (
                      <FaArrowDown className="ms-1 text-primary" />
                    )}
                  </>
                )}
              </span>
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {data.map((row) => (
          <tr key={row.id}>
            {columns.map((col) => (
              <td key={col.key}>
                {/* If custom render exists, use it */}
                {col.render ? col.render(row) : row[col.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ReusableTable;
