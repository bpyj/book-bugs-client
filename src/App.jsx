import { useEffect, useState } from "react";
import AddFriendPanel from "./components/AddFriendPanel";
import AppHeader from "./components/AppHeader";
import ChildSwitcher from "./components/ChildSwitcher";
import CollectionView from "./components/CollectionView";
import FriendRequestsPanel from "./components/FriendRequestsPanel";
import Login from "./components/Login";
import useAuth, { authHeaders } from "./hooks/useAuth";
import AppLoading from "./components/AppLoading";
import "./App.css";

const API_BASE =
  import.meta.env.VITE_API_BASE ||
  "https://book-bugs-server.onrender.com";

function App() {
  const {
    token,
    currentChild,
    restoringSession,
    login,
    logout,
  } = useAuth(API_BASE);

  const [loginChildId, setLoginChildId] = useState("");
  const [loginPin, setLoginPin] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState("");

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
    if (!token || !currentChild) return;

    try {
      setLoadingChildren(true);

      const friendsResponse = await fetch(
        `${API_BASE}/api/friends/${currentChild.childId}`,
        {
          headers: authHeaders(token),
        }
      );

      if (!friendsResponse.ok) {
        throw new Error("Could not retrieve friends");
      }

      const friends = await friendsResponse.json();

      setChildren([currentChild, ...friends]);

      setSelectedChildId(
        (current) => current || currentChild.childId
      );
    } catch (error) {
      setError(error.message);
    } finally {
      setLoadingChildren(false);
    }
  }

  useEffect(() => {
    if (!token || !currentChild) return undefined;

    let ignore = false;

    async function loadInitialChildren() {
      try {
        const friendsResponse = await fetch(
          `${API_BASE}/api/friends/${currentChild.childId}`,
          {
            headers: authHeaders(token),
          }
        );

        if (!friendsResponse.ok) {
          throw new Error("Could not retrieve friends");
        }

        const friends = await friendsResponse.json();

        if (!ignore) {
          setChildren([currentChild, ...friends]);
          setSelectedChildId(currentChild.childId);
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
  }, [token, currentChild]);

  useEffect(() => {
    if (!selectedChildId || !token) return undefined;

    const controller = new AbortController();

    async function loadCollection() {
      try {
        setLoadingCollection(true);
        setError("");

        const response = await fetch(
          `${API_BASE}/api/children/${selectedChildId}/collection`,
          {
            signal: controller.signal,
            headers: authHeaders(token),
          }
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
  }, [selectedChildId, token]);

  if (restoringSession) {
    return <AppLoading />;
  }

  if (!token || !currentChild) {
    return (
      <Login
        childId={loginChildId}
        setChildId={setLoginChildId}
        pin={loginPin}
        setPin={setLoginPin}
        loading={loggingIn}
        error={loginError}
        onLogin={handleLogin}
      />
    );
  }

  if (loadingChildren) {
    return <h2>Loading Book Bugs...</h2>;
  }

  if (error && children.length === 0) {
    return (
      <main className="app-loading">
        <div className="app-loading-card">
          <p className="error-message">
            Error: {error}
          </p>
        </div>
      </main>
    );
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
        `${API_BASE}/api/children/search/${encodeURIComponent(searchId)}`,
        {
          headers: authHeaders(token),
        }
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
            ...authHeaders(token),
          },
          body: JSON.stringify({
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
        `${API_BASE}/api/friend-requests/${encodeURIComponent(childId)}`,
        {
          headers: authHeaders(token),
        }
      );

      if (!response.ok) {
        throw new Error("Could not retrieve friend requests");
      }

      const data = await response.json();

      setFriendRequests(data);

      if (data.length === 0) {
        setFriendRequestsMessage(
          "No pending friend requests."
        );
      }
    } catch (error) {
      setFriendRequestsMessage(error.message);
    } finally {
      setLoadingFriendRequests(false);
    }
  }

  async function respondToFriendRequest(
    fromChildId,
    action
  ) {
    try {
      setRespondingRequestId(fromChildId);
      setFriendResponseMessage("");

      const response = await fetch(
        `${API_BASE}/api/friend-requests/respond`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders(token),
          },
          body: JSON.stringify({
            fromChildId,
            action,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Could not respond to friend request"
        );
      }

      setFriendResponseMessage(
        action === "accept"
          ? "Friend request accepted."
          : "Friend request declined."
      );

      await loadFriendRequests(
        currentChild.childId
      );

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

    loadFriendRequests(currentChild.childId);
  }

  function handleLogout() {
    logout();

    setChildren([]);
    setSelectedChildId("");
    setRecords([]);
    setLoadingChildren(true);
    setShowAddFriend(false);
    setShowFriendRequests(false);
    setError("");
    setLoginChildId("");
    setLoginPin("");
    setLoginError("");
  }

  async function handleLogin() {
    const childId = loginChildId.trim();
    const pin = loginPin.trim();

    if (!childId || !pin) {
      setLoginError(
        "Book Bugs ID and PIN are required."
      );
      return;
    }

    try {
      setLoggingIn(true);
      setLoginError("");
      setLoadingChildren(true);

      await login(childId, pin);

      setLoginPin("");
    } catch (error) {
      setLoginError(error.message);
    } finally {
      setLoggingIn(false);
    }
  }

  return (
    <main>
      <AppHeader
        currentChild={currentChild}
        onLogout={handleLogout}
      />

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
          onClose={() =>
            setShowAddFriend(false)
          }
        />
      )}

      {showFriendRequests && (
        <FriendRequestsPanel
          friendRequests={friendRequests}
          loadingFriendRequests={
            loadingFriendRequests
          }
          friendRequestsMessage={
            friendRequestsMessage
          }
          respondingRequestId={
            respondingRequestId
          }
          friendResponseMessage={
            friendResponseMessage
          }
          respondToFriendRequest={
            respondToFriendRequest
          }
          onClose={() =>
            setShowFriendRequests(false)
          }
        />
      )}

      {!showAddFriend &&
        !showFriendRequests && (
          <CollectionView
            selectedChild={selectedChild}
            records={records}
            loadingCollection={
              loadingCollection
            }
            error={error}
          />
        )}
    </main>
  );
}

export default App;
