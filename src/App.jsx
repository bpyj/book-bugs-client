import { useEffect, useState } from "react";
import InventoryTable from "./components/InventoryTable";
import "./App.css";

const API_BASE = "https://book-bugs-server.onrender.com";

function App() {
  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState("");
  const [records, setRecords] = useState([]);

  const [loadingChildren, setLoadingChildren] = useState(true);
  const [loadingCollection, setLoadingCollection] = useState(false);
  const [error, setError] = useState("");

const CURRENT_CHILD_ID = "JY001";

useEffect(() => {
  async function loadChildren() {
    try {
      const [childrenResponse, friendsResponse] = await Promise.all([
        fetch(`${API_BASE}/api/children`),
        fetch(`${API_BASE}/api/friends/${CURRENT_CHILD_ID}`),
      ]);

      if (!childrenResponse.ok) {
        throw new Error("Could not retrieve children");
      }

      if (!friendsResponse.ok) {
        throw new Error("Could not retrieve friends");
      }

      const allChildren = await childrenResponse.json();
      const friends = await friendsResponse.json();

      const currentChild = allChildren.find(
        (child) => child.childId === CURRENT_CHILD_ID
      );

      if (!currentChild) {
        throw new Error("Current child not found");
      }

      const visibleChildren = [
        currentChild,
        ...friends,
      ];

      setChildren(visibleChildren);
      setSelectedChildId(CURRENT_CHILD_ID);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoadingChildren(false);
    }
  }

  loadChildren();
}, []);

  useEffect(() => {
    if (!selectedChildId) return;

    const controller = new AbortController();

    async function loadCollection() {
      try {
        setLoadingCollection(true);
        setError("");

        const response = await fetch(
          `${API_BASE}/api/children/${selectedChildId}/collection`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Could not retrieve collection");
        }

        const data = await response.json();

        setRecords(data.collection);
      } catch (error) {
        if (error.name !== "AbortError") {
          setError(error.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingCollection(false);
        }
      }
    }

    loadCollection();

    return () => controller.abort();
  }, [selectedChildId]);

  if (loadingChildren) {
    return <h2>Loading Book Bugs...</h2>;
  }

  if (error && children.length === 0) {
    return <h2>Error: {error}</h2>;
  }

  const selectedChild = children.find(
    (child) => child.childId === selectedChildId
  );

  return (
    <main>
      <h1>Book Bugs</h1>

      <p className="app-intro">
        Choose a child to view their Book Bugs collection.
      </p>

      <div className="child-switcher">
        {children.map((child) => (
          <button
            key={child.childId}
            type="button"
            className={
              selectedChildId === child.childId
                ? "child-button active"
                : "child-button"
            }
            onClick={() => setSelectedChildId(child.childId)}
          >
            {child.avatar?.url ? (
              <img
                className="child-avatar"
                src={child.avatar.url}
                alt=""
              />
            ) : (
              <span className="child-initial">
                {child.name.charAt(0)}
              </span>
            )}

            {child.name}
          </button>
        ))}

        <button
          type="button"
          className="child-button"
          onClick={() => alert("Add Friend screen coming next")}
        >
          <span className="child-initial">+</span>
          Add Friend
        </button>
      </div>

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
        <p className="collection-message error-message">
          {error}
        </p>
      ) : records.length > 0 ? (
        <InventoryTable records={records} />
      ) : (
        <p className="collection-message">
          No Book Bugs collected yet.
        </p>
      )}
    </main>
  );
}

export default App;