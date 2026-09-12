function AppHeader({ currentChild, onLogout }) {
  return (
    <header className="app-header">
      <div className="app-header-brand">
        <h1>Book Bugs</h1>

        <p className="app-intro">
          Choose a child to view their Book Bugs collection.
        </p>
      </div>

      <div className="account-panel">
        <div className="account-child">
          {currentChild.avatar?.url ? (
            <img
              className="account-avatar"
              src={currentChild.avatar.url}
              alt=""
            />
          ) : (
            <span className="account-initial">
              {currentChild.name.charAt(0)}
            </span>
          )}

          <div className="account-details">
            <span className="account-label">Signed in as</span>

            <strong>{currentChild.name}</strong>

            <span className="account-id">
              {currentChild.childId}
            </span>
          </div>
        </div>

        <button
          type="button"
          className="logout-button"
          onClick={onLogout}
        >
          Logout
        </button>
      </div>
    </header>
  );
}

export default AppHeader;