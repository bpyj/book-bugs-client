import InventoryTable from "./InventoryTable";

function CollectionView({ selectedChild, records, loadingCollection, error }) {
  return (
    <>
      {selectedChild && (
        <section className="collection-header">
          <h2>{selectedChild.name}'s Collection</h2>

          {!loadingCollection && (
            <p>
              <strong>{records.length}</strong> Book Bugs collected
            </p>
          )}
        </section>
      )}

      {loadingCollection ? (
        <p className="collection-message">Loading collection...</p>
      ) : error ? (
        <p className="collection-message error-message">{error}</p>
      ) : records.length > 0 ? (
        <InventoryTable records={records} />
      ) : (
        <p className="collection-message">No Book Bugs collected yet.</p>
      )}
    </>
  );
}

export default CollectionView;
