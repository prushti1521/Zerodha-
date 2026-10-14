import React from "react";
import api from "../api";

import Menu from "./Menu";

const TopBar = () => {
  const handleSignOut = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      const frontendUrl = process.env.REACT_APP_FRONTEND_URL || "http://localhost:3000";
      window.location.assign(`${frontendUrl}/signin`);
    }
  };

  return (
    <div className="topbar-container">
      <div className="indices-container">
        <div className="nifty">
          <p className="index">NIFTY 50</p>
          <p className="index-points">{100.2} </p>
          <p className="percent"> </p>
        </div>
        <div className="sensex">
          <p className="index">SENSEX</p>
          <p className="index-points">{100.2}</p>
          <p className="percent"></p>
        </div>
      </div>

      <Menu />
      <button type="button" className="btn" onClick={handleSignOut}>
        Sign out
      </button>
    </div>
  );
};

export default TopBar;
