function Login({
  childId,
  setChildId,
  pin,
  setPin,
  loading,
  error,
  onLogin,
}) {
  function handleSubmit(event) {
    event.preventDefault();
    onLogin();
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-brand">
          <div className="login-bug-mark" aria-hidden="true">
            🐞
          </div>

          <div>
            <h1>Book Bugs</h1>
            <p className="login-subtitle">
              Sign in to view your collection and friends.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="login-panel">
          <div className="login-field">
            <label htmlFor="book-bugs-id">Book Bugs ID</label>

            <input
              id="book-bugs-id"
              type="text"
              value={childId}
              onChange={(event) => setChildId(event.target.value)}
              placeholder="e.g. JY001"
              autoComplete="username"
              autoCapitalize="characters"
              spellCheck="false"
              disabled={loading}
            />
          </div>

          <div className="login-field">
            <label htmlFor="book-bugs-pin">PIN</label>

            <input
              id="book-bugs-pin"
              type="password"
              value={pin}
              onChange={(event) => setPin(event.target.value)}
              placeholder="Enter your PIN"
              inputMode="numeric"
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {error && (
            <p className="login-error" role="alert">
              {error}
            </p>
          )}
        </form>
      </section>
    </main>
  );
}

export default Login;