InventoryTable.jsx

function InventoryTable({ records }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Image</th>
          <th>Card</th>
          <th>Description</th>
          <th>Land</th>
          <th>Status</th>
          <th>Quantity</th>
        </tr>
      </thead>

      <tbody>
        {records.map((record) => {
          const attachment = record.fields.Attachment?.[0];

          const imageUrl =
            attachment?.thumbnails?.large?.url ||
            attachment?.url ||
            attachment?.thumbnails?.small?.url;

          return (
            <tr key={record.id}>
              <td>
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={record.fields.Desc || "Book Bug card"}
                    style={{
                      width: "80px",
                      height: "110px",
                      objectFit: "cover",
                      borderRadius: "6px",
                    }}
                  />
                ) : (
                  "No image"
                )}
              </td>

              <td>#{record.fields["Card Number"] ?? "-"}</td>
              <td>{record.fields.Desc ?? "-"}</td>
              <td>{record.fields.Land ?? "-"}</td>
              <td>{record.fields.Status ?? "-"}</td>
              <td>{record.fields.Qty ?? 0}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default InventoryTable;