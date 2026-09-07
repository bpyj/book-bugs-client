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

  const [showAddFriend, setShowAddFriend] = useState(false);
  const [friendSearchId, setFriendSearchId] = useState("");
  const [friendSearchResult, setFriendSearchResult] = useState(null);
  const [friendSearchMessage, setFriendSearchMessage] = useState("");
  const [searchingFriend, setSearchingFriend] = useState(false);

  const [sendingFriendRequest, setSendingFriendRequest] = useState(false);
  const [friendRequestMessage, setFriendRequestMessage] = useState("");

  const [showFriendRequests, setShowFriendRequests] = useState(false);
  const [friendRequests, setFriendRequests] = useState([]);
  const [loadingFriendRequests, setLoadingFriendRequests] = useState(false);
  const [friendRequestsMessage, setFriendRequestsMessage] = useState("");

  const [respondingRequestId, setRespondingRequestId] = useState("");
  const [friendResponseMessage, setFriendResponseMessage] = useState("");

const CURRENT_CHILD_ID = "JY001";

async function loadVisibleChildren() {
  try {
    setLoadingChildren(true);

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

    setChildren([
      currentChild,
      ...friends,
    ]);

    setSelectedChildId((current) =>
      current || CURRENT_CHILD_ID
    );
  } catch (error) {
    setError(error.message);
  } finally {
    setLoadingChildren(false);
  }
}

useEffect(() => {
  loadVisibleChildren();
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

  async function searchFriend() {
    const searchId = friendSearchId.trim();

    if (!searchId) {
      setFriendSearchResult(null);
      setFriendSearchMessage("Enter a Friend ID.");
      return;
    }

    try {
      setSearchingFriend(true);
      setFriendSearchResult(null);
      setFriendSearchMessage("");
      setFriendRequestMessage("");


      const response = await fetch(
        `${API_BASE}/api/children/search/${encodeURIComponent(searchId)}`
      );

      if (response.status === 404) {
        setFriendSearchMessage("Friend not found.");
        return;
      }

      if (!response.ok) {
        throw new Error("Could not search for friend");
      }

      const data = await response.json();

      setFriendSearchResult(data);
    } catch (error) {
      setFriendSearchMessage(error.message);
    } finally {
      setSearchingFriend(false);
    }
  }

  async function sendFriendRequest() {
    if (!friendSearchResult) return;

    try {
      setSendingFriendRequest(true);
      setFriendRequestMessage("");

      const response = await fetch(
        `${API_BASE}/api/friend-requests`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fromChildId: CURRENT_CHILD_ID,
            toChildId: friendSearchResult.childId,
          }),
        }
      );

      const data = await response.json();

      if (response.status === 409) {
        setFriendRequestMessage(
          `${friendSearchResult.name} is already your friend or has a pending request.`
        );
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message || "Could not send friend request"
        );
      }

      setFriendRequestMessage("Friend request sent!");
    } catch (error) {
      setFriendRequestMessage(error.message);
    } finally {
      setSendingFriendRequest(false);
    }
  }

  async function loadFriendRequests(childId) {
    try {
      setLoadingFriendRequests(true);
      setFriendRequests([]);
      setFriendRequestsMessage("");

      const response = await fetch(
        `${API_BASE}/api/friend-requests/${encodeURIComponent(childId)}`
      );

      if (!response.ok) {
        throw new Error("Could not retrieve friend requests");
      }

      const data = await response.json();

      setFriendRequests(data);

      if (data.length === 0) {
        setFriendRequestsMessage("No pending friend requests.");
      }
    } catch (error) {
      setFriendRequestsMessage(error.message);
    } finally {
      setLoadingFriendRequests(false);
    }
  }

  async function respondToFriendRequest(fromChildId, action) {
    try {
      setRespondingRequestId(fromChildId);
      setFriendResponseMessage("");

      const response = await fetch(
        `${API_BASE}/api/friend-requests/respond`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fromChildId,
            toChildId: CURRENT_CHILD_ID,
            action,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Could not respond to friend request"
        );
      }

      setFriendResponseMessage(
        action === "accept"
          ? "Friend request accepted."
          : "Friend request declined."
      );

      await loadFriendRequests(CURRENT_CHILD_ID);

      if (action === "accept") {
        await loadVisibleChildren();
      }
    } catch (error) {
      setFriendResponseMessage(error.message);
    } finally {
      setRespondingRequestId("");
    }
  }

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
            onClick={() => {
              setSelectedChildId(child.childId);
              setShowAddFriend(false);
              setShowFriendRequests(false);
            }}
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
          onClick={() => {
            setShowFriendRequests(false);
            setShowAddFriend(true);
            setFriendSearchId("");
            setFriendSearchResult(null);
            setFriendSearchMessage("");
            setFriendRequestMessage("");
          }}
        >
          <span className="child-initial">+</span>
          Add Friend
        </button>
        <button
          type="button"
          className="child-button"
          onClick={() => {
            setShowAddFriend(false);
            setShowFriendRequests(true);
            setFriendResponseMessage("");
            loadFriendRequests(CURRENT_CHILD_ID);
          }}
        >
          Friend Requests
        </button>
      </div>

      {showAddFriend && (
        <section className="add-friend-panel">
          <h2>Add a Friend</h2>

          <p>Enter your friend's Book Bugs ID.</p>

          <div className="friend-search">
            <input
              type="text"
              value={friendSearchId}
              placeholder="Example: TOM001"
              onChange={(event) =>
                setFriendSearchId(event.target.value)
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  searchFriend();
                }
              }}
            />

            <button
              type="button"
              onClick={searchFriend}
              disabled={searchingFriend}
            >
              {searchingFriend ? "Searching..." : "Search"}
            </button>
          </div>

          {friendSearchMessage && (
            <p className="friend-search-message">
              {friendSearchMessage}
            </p>
          )}

          {friendSearchResult && (
            <div className="friend-search-result">
              <span className="child-initial">
                {friendSearchResult.name.charAt(0)}
              </span>

              <div className="friend-result-details">
                <strong>{friendSearchResult.name}</strong>
                <p>{friendSearchResult.childId}</p>

                <button
                  type="button"
                  className="send-friend-request"
                  onClick={sendFriendRequest}
                  disabled={sendingFriendRequest}
                >
                  {sendingFriendRequest
                    ? "Sending..."
                    : "Send Friend Request"}
                </button>

                {friendRequestMessage && (
                  <p className="friend-request-message">
                    {friendRequestMessage}
                  </p>
                )}
              </div>
            </div>
          )}
          <button
            type="button"
            className="close-add-friend"
            onClick={() => setShowAddFriend(false)}
          >
            Back to Collection
          </button>
        </section>        
      )}
      {showFriendRequests && (
        <section className="add-friend-panel">
          <h2>Friend Requests</h2>

          {loadingFriendRequests ? (
            <p>Loading friend requests...</p>
          ) : friendRequests.length > 0 ? (
            <div>
              {friendRequests.map((request) => (
                <div
                  key={request.childId}
                  className="friend-search-result"
                >
                  <span className="child-initial">
                    {request.name.charAt(0)}
                  </span>

                  <div className="friend-result-details">
                    <strong>{request.name}</strong>
                    <p>{request.childId}</p>

                    <div className="friend-request-actions">
                      <button
                        type="button"
                        className="friend-request-accept"
                        onClick={() =>
                          respondToFriendRequest(
                            request.childId,
                            "accept"
                          )
                        }
                        disabled={
                          respondingRequestId === request.childId
                        }
                      >
                        {respondingRequestId === request.childId
                          ? "Processing..."
                          : "Accept"}
                      </button>

                      <button
                        type="button"
                        className="friend-request-decline"
                        onClick={() =>
                          respondToFriendRequest(
                            request.childId,
                            "decline"
                          )
                        }
                        disabled={
                          respondingRequestId === request.childId
                        }
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="friend-search-message">
              {friendRequestsMessage}
            </p>
          )}

          {friendResponseMessage && (
            <p className="friend-request-message">
              {friendResponseMessage}
            </p>
          )}

          <button
            type="button"
            className="close-add-friend"
            onClick={() => setShowFriendRequests(false)}
          >
            Back to Collection
          </button>
        </section>
      )}

      {!showAddFriend && !showFriendRequests && (
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
            <p className="collection-message">
              Loading collection...
            </p>
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
        </>
      )}

 
    </main>
  );
}

export default App;