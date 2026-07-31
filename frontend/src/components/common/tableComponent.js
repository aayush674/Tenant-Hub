function TableComponent({columns, data, emptyMessage}){
    return (
      <div className="table-component-container">
        <table>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.header}>{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
            <tr>
                <td colSpan={columns.length}>
                    {emptyMessage}
                </td>
            </tr>
            ):
            (data.map((row) => (
              <tr key={row.id}>
                {columns.map((col) => (
                  <td key={col.header}>
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            )))}
          </tbody>
        </table>
      </div>
    );
}

export default TableComponent;
