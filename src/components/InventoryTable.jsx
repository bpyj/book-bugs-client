import { useEffect, useState } from "react";

function InventoryTable({ records }) {
  const [selectedCard, setSelectedCard] = useState(null);

  useEffect(() => {
    if (!selectedCard) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setSelectedCard(null);
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.classList.add("modal-open");

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.classList.remove("modal-open");
    };
  }, [selectedCard]);

  return (
    <>
      <div className="inventory-table-wrapper">
        <table className="inventory-table">
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
              const thumbnailUrl =
                attachment?.thumbnails?.large?.url ||
                attachment?.url ||
                attachment?.thumbnails?.small?.url;
              const fullImageUrl = attachment?.url || thumbnailUrl;
              const description = record.fields.Desc ?? "-";

              return (
                <tr key={record.id}>
                  <td data-label="Image" className="image-cell">
                    {thumbnailUrl ? (
                      <button
                        className="card-image-button"
                        type="button"
                        onClick={() =>
                          setSelectedCard({ src: fullImageUrl, alt: description })
                        }
                        aria-label={`View larger image of ${description}`}
                      >
                        <img
                          className="card-thumbnail"
                          src={thumbnailUrl}
                          alt={description}
                        />
                      </button>
                    ) : (
                      <span className="no-image">No image</span>
                    )}
                  </td>
                  <td data-label="Card" className="short-field">
                    #{record.fields["Card Number"] ?? "-"}
                  </td>
                  <td data-label="Description" className="description-cell">
                    {description}
                  </td>
                  <td data-label="Land" className="short-field">
                    {record.fields.Land ?? "-"}
                  </td>
                  <td data-label="Status" className="short-field">
                    {record.fields.Status ?? "-"}
                  </td>
                  <td data-label="Quantity" className="short-field">
                    {record.fields.Qty ?? 0}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedCard && (
        <div
          className="image-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Enlarged Book Bug card"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedCard(null);
          }}
        >
          <button
            className="modal-close"
            type="button"
            onClick={() => setSelectedCard(null)}
            aria-label="Close enlarged image"
          >
            ×
          </button>
          <img
            className="modal-card-image"
            src={selectedCard.src}
            alt={selectedCard.alt}
          />
        </div>
      )}
    </>
  );
}

export default InventoryTable;
