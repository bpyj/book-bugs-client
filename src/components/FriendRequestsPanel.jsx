function FriendRequestsPanel({
  friendRequests,
  loadingFriendRequests,
  friendRequestsMessage,
  respondingRequestId,
  friendResponseMessage,
  respondToFriendRequest,
  onClose,
}) {
  return (
    <section className="add-friend-panel">
      <h2>Friend Requests</h2>

      {loadingFriendRequests ? (
        <p>Loading friend requests...</p>
      ) : friendRequests.length > 0 ? (
        <div>
          {friendRequests.map((request) => (
            <div key={request.childId} className="friend-search-result">
              <span className="child-initial">{request.name.charAt(0)}</span>

              <div className="friend-result-details">
                <strong>{request.name}</strong>
                <p>{request.childId}</p>

                <div className="friend-request-actions">
                  <button
                    type="button"
                    className="friend-request-accept"
                    onClick={() =>
                      respondToFriendRequest(request.childId, "accept")
                    }
                    disabled={respondingRequestId === request.childId}
                  >
                    {respondingRequestId === request.childId
                      ? "Processing..."
                      : "Accept"}
                  </button>

                  <button
                    type="button"
                    className="friend-request-decline"
                    onClick={() =>
                      respondToFriendRequest(request.childId, "decline")
                    }
                    disabled={respondingRequestId === request.childId}
                  >
                    Decline
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="friend-search-message">{friendRequestsMessage}</p>
      )}

      {friendResponseMessage && (
        <p className="friend-request-message">{friendResponseMessage}</p>
      )}

      <button type="button" className="close-add-friend" onClick={onClose}>
        Back to Collection
      </button>
    </section>
  );
}

export default FriendRequestsPanel;
