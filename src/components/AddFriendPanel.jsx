function AddFriendPanel({
  friendSearchId,
  setFriendSearchId,
  friendSearchResult,
  friendSearchMessage,
  searchingFriend,
  searchFriend,
  sendingFriendRequest,
  sendFriendRequest,
  friendRequestMessage,
  onClose,
}) {
  return (
    <section className="add-friend-panel">
      <h2>Add a Friend</h2>
      <p>Enter your friend's Book Bugs ID.</p>

      <div className="friend-search">
        <input
          type="text"
          value={friendSearchId}
          placeholder="Example: TOM001"
          onChange={(event) => setFriendSearchId(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") searchFriend();
          }}
        />

        <button type="button" onClick={searchFriend} disabled={searchingFriend}>
          {searchingFriend ? "Searching..." : "Search"}
        </button>
      </div>

      {friendSearchMessage && (
        <p className="friend-search-message">{friendSearchMessage}</p>
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
              {sendingFriendRequest ? "Sending..." : "Send Friend Request"}
            </button>

            {friendRequestMessage && (
              <p className="friend-request-message">{friendRequestMessage}</p>
            )}
          </div>
        </div>
      )}

      <button type="button" className="close-add-friend" onClick={onClose}>
        Back to Collection
      </button>
    </section>
  );
}

export default AddFriendPanel;
