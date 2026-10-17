import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import "@fortawesome/fontawesome-free/css/all.min.css";

function Navbar() {
  const dashboardUrl =
    process.env.REACT_APP_DASHBOARD_URL || "http://localhost:3000";
  const [user, setUser] = useState(null);

  useEffect(() => {
    api.get("/auth/me")
      .then(({ data }) => setUser(data.user))
      .catch(() => setUser(null));
  }, []);

  const getInitials = () => {
    const displayName = user?.name || user?.email || "";
    return displayName
      .split(/[\s@.]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  const closeMenu = (event) => {
    event.currentTarget.closest("details").open = false;
  };

  const handleSignOut = async () => {
    await api.post("/auth/logout");
    setUser(null);
  };

  return (
    <nav
      className="navbar navbar-expand-lg border-bottom"
      style={{ backgroundColor: "#FFF" }}
    >
      <div className="container p-2">
        <Link className="navbar-brand" to="/">
          <img
            src={process.env.PUBLIC_URL + "/media/images/logo.svg"}
            className="brand-logo"
            alt="Logo"
          />
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav mb-0 ms-lg-auto">
              <li className="nav-item">
                <a className="nav-link active" href={dashboardUrl}>
                  Dashboard
                </a>
              </li>
              <li className="nav-item">
                <Link className="nav-link active" to="/about">
                  About
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link active" to="/product">
                  Product
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link active" to="/pricing">
                  Pricing
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link active" to="/support">
                  Support
                </Link>
              </li>
          </ul>
          <div className="navbar-account">
            <details className="account-menu">
              <summary
                className="account-trigger"
                aria-label={user ? "Open account menu" : "Sign in or create an account"}
                title="Account"
              >
                <span className="account-avatar" aria-hidden="true">
                  {user ? getInitials() : <i className="fa-regular fa-user" />}
                </span>
                <i className="fa-solid fa-chevron-down account-chevron" aria-hidden="true" />
              </summary>
              <div className="account-menu-content">
                {user ? (
                  <>
                    <div className="account-identity">
                      <strong>{user.name}</strong>
                      <span>{user.email}</span>
                    </div>
                    <button
                      className="account-menu-button"
                      type="button"
                      onClick={async (event) => {
                        closeMenu(event);
                        await handleSignOut();
                      }}
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <Link className="account-menu-link" to="/signin" onClick={closeMenu}>
                      Sign in
                    </Link>
                    <Link className="account-menu-link" to="/signup" onClick={closeMenu}>
                      Create an account
                    </Link>
                  </>
                )}
              </div>
            </details>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;


