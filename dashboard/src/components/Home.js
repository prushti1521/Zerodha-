import React, { useEffect, useState } from "react";

import api, { getApiErrorMessage } from "../api";
import Dashboard from "./Dashboard";
import TopBar from "./TopBar";

const Home = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [user, setUser] = useState(null);
  const [connectionError, setConnectionError] = useState("");

  useEffect(() => {
    let isMounted = true;
    api.get("/auth/me")
      .then(({ data }) => {
        if (isMounted) {
          setUser(data.user);
          setIsAuthenticated(true);
        }
      })
      .catch((error) => {
        if (error.response?.status === 401) {
          const frontendUrl = process.env.REACT_APP_FRONTEND_URL || "http://localhost:3001";
          window.location.assign(`${frontendUrl}/signin`);
        } else if (isMounted) {
          setConnectionError(getApiErrorMessage(error, "Dashboard session"));
        }
      })
      .finally(() => {
        if (isMounted) setIsChecking(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (isChecking) return <p role="status">Checking sign-in…</p>;
  if (connectionError) {
    return (
      <main className="dashboard-connection-error" role="alert">
        <h1>Dashboard unavailable</h1>
        <p>{connectionError}</p>
        <button type="button" onClick={() => window.location.reload()}>Retry</button>
      </main>
    );
  }
  if (!isAuthenticated) return null;

  return (
    <>
      <TopBar user={user} />
      <Dashboard user={user} />
    </>
  );
};

export default Home;
