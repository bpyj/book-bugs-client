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
    <main>
      <h1>Book Bugs</h1>

      <form onSubmit={handleSubmit} className="login-panel">
        <h2>Login</h2>

        <label>
          Book Bugs ID
          <input
            type="text"
            value={childId}
            onChange={(event) => setChildId(event.target.value)}
            placeholder="e.g. JY001"
            autoComplete="username"
          />
        </label>

        <label>
          PIN
          <input
            type="password"
            value={pin}
            onChange={(event) => setPin(event.target.value)}
            placeholder="4–6 digit PIN"
            inputMode="numeric"
            autoComplete="current-password"
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        {error && <p className="login-error">{error}</p>}
      </form>
    </main>
  );
}

export default Login;