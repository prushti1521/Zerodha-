import React, { useEffect, useState } from "react";

import api from "../api";
import Dashboard from "./Dashboard";
import TopBar from "./TopBar";

const Home = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let isMounted = true;
    api.get("/auth/me")
      .then(() => {
        if (isMounted) setIsAuthenticated(true);
      })
      .catch(() => {
        const frontendUrl = process.env.REACT_APP_FRONTEND_URL || "http://localhost:3000";
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
      <TopBar />
      <Dashboard />
    </>
  );
};

export default Home;
