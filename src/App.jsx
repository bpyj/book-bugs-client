import { useEffect, useState } from "react";
import AddFriendPanel from "./components/AddFriendPanel";
import ChildSwitcher from "./components/ChildSwitcher";
import CollectionView from "./components/CollectionView";
import FriendRequestsPanel from "./components/FriendRequestsPanel";
import "./App.css";

const API_BASE = "https://book-bugs-server.onrender.com";
const CURRENT_CHILD_ID = "JY001";

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

      setChildren([currentChild, ...friends]);
      setSelectedChildId((current) => current || CURRENT_CHILD_ID);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoadingChildren(false);
    }
  }

  useEffect(() => {
    let ignore = false;

    async function loadInitialChildren() {
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

        if (!ignore) {
          setChildren([currentChild, ...friends]);
          setSelectedChildId(CURRENT_CHILD_ID);
          setLoadingChildren(false);
        }
      } catch (error) {
        if (!ignore) {
          setError(error.message);
          setLoadingChildren(false);
        }
      }
    }

    loadInitialChildren();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedChildId) return undefined;

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

      const response = await fetch(`${API_BASE}/api/friend-requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fromChildId: CURRENT_CHILD_ID,
          toChildId: friendSearchResult.childId,
        }),
      });

      const data = await response.json();

      if (response.status === 409) {
        setFriendRequestMessage(
          `${friendSearchResult.name} is already your friend or has a pending request.`
        );
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Could not send friend request");
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

      const response = await fetch(`${API_BASE}/api/friend-requests/respond`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fromChildId,
          toChildId: CURRENT_CHILD_ID,
          action,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not respond to friend request");
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

  function handleSelectChild(childId) {
    setSelectedChildId(childId);
    setShowAddFriend(false);
    setShowFriendRequests(false);
  }

  function handleShowAddFriend() {
    setShowFriendRequests(false);
    setShowAddFriend(true);
    setFriendSearchId("");
    setFriendSearchResult(null);
    setFriendSearchMessage("");
    setFriendRequestMessage("");
  }

  function handleShowFriendRequests() {
    setShowAddFriend(false);
    setShowFriendRequests(true);
    setFriendResponseMessage("");
    loadFriendRequests(CURRENT_CHILD_ID);
  }

  return (
    <main>
      <h1>Book Bugs</h1>

      <p className="app-intro">
        Choose a child to view their Book Bugs collection.
      </p>

      <ChildSwitcher
        children={children}
        selectedChildId={selectedChildId}
        onSelectChild={handleSelectChild}
        onShowAddFriend={handleShowAddFriend}
        onShowFriendRequests={handleShowFriendRequests}
      />

      {showAddFriend && (
        <AddFriendPanel
          friendSearchId={friendSearchId}
          setFriendSearchId={setFriendSearchId}
          friendSearchResult={friendSearchResult}
          friendSearchMessage={friendSearchMessage}
          searchingFriend={searchingFriend}
          searchFriend={searchFriend}
          sendingFriendRequest={sendingFriendRequest}
          sendFriendRequest={sendFriendRequest}
          friendRequestMessage={friendRequestMessage}
          onClose={() => setShowAddFriend(false)}
        />
      )}

      {showFriendRequests && (
        <FriendRequestsPanel
          friendRequests={friendRequests}
          loadingFriendRequests={loadingFriendRequests}
          friendRequestsMessage={friendRequestsMessage}
          respondingRequestId={respondingRequestId}
          friendResponseMessage={friendResponseMessage}
          respondToFriendRequest={respondToFriendRequest}
          onClose={() => setShowFriendRequests(false)}
        />
      )}

      {!showAddFriend && !showFriendRequests && (
        <CollectionView
          selectedChild={selectedChild}
          records={records}
          loadingCollection={loadingCollection}
          error={error}
        />
      )}
    </main>
  );
}

export default App;
