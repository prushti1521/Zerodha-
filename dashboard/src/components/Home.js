import React, { useEffect, useState } from "react";

import api from "../api";
import Dashboard from "./Dashboard";
import TopBar from "./TopBar";

const Home = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    let isMounted = true;
    api.get("/auth/me")
      .then(({ data }) => {
        if (isMounted) {
          setUser(data.user);
          setIsAuthenticated(true);
        }
      })
      .catch(() => {
        const frontendUrl = process.env.REACT_APP_FRONTEND_URL || "http://localhost:3001";
        window.location.assign(`${frontendUrl}/signin`);
      })
      .finally(() => {
        if (isMounted) setIsChecking(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (isChecking || !isAuthenticated) return <p role="status">Checking sign-in…</p>;

  return (
    <>
      <TopBar user={user} />
      <Dashboard user={user} />
    </>
  );
};

export default Home;
