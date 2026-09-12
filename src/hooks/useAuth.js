import { useEffect, useState } from "react";

function authHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
  };
}

function useAuth(API_BASE) {
  const [token, setToken] = useState(
    () => localStorage.getItem("bookBugsToken") || ""
  );

  const [currentChild, setCurrentChild] = useState(null);

  const [restoringSession, setRestoringSession] = useState(
    () => Boolean(localStorage.getItem("bookBugsToken"))
  );

  useEffect(() => {
    if (!token || currentChild) {
      return undefined;
    }

    let ignore = false;

    async function restoreLogin() {
      try {
        const response = await fetch(`${API_BASE}/api/auth/me`, {
          headers: authHeaders(token),
        });

        if (!response.ok) {
          throw new Error("Login expired");
        }

        const data = await response.json();

        if (!ignore) {
          setCurrentChild(data.child);
        }
      } catch {
        if (!ignore) {
          localStorage.removeItem("bookBugsToken");
          setToken("");
          setCurrentChild(null);
        }
      } finally {
        if (!ignore) {
          setRestoringSession(false);
        }
      }
    }

    restoreLogin();

    return () => {
      ignore = true;
    };
  }, [API_BASE, token, currentChild]);

  async function login(childId, pin) {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        childId,
        pin,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    localStorage.setItem("bookBugsToken", data.token);

    setToken(data.token);
    setCurrentChild(data.child);

    return data.child;
  }

  function logout() {
    localStorage.removeItem("bookBugsToken");

    setToken("");
    setCurrentChild(null);
    setRestoringSession(false);
  }

  return {
    token,
    currentChild,
    restoringSession,
    login,
    logout,
  };
}

export { authHeaders };
export default useAuth;