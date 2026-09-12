// src/components/AppLoading.jsx
function AppLoading({ message = "Loading Book Bugs..." }) {
  return (
    <main className="app-loading">
      <div className="app-loading-card">
        <div className="app-loading-mark" aria-hidden="true">
          🐞
        </div>

        <p>{message}</p>
      </div>
    </main>
  );
}

export default AppLoading;