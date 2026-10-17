import React from "react";
import { Link } from "react-router-dom";

const applications = [
  { name: "Dashboard", path: "/", detail: "Account overview", mark: "D" },
  { name: "Orders", path: "/orders", detail: "Order history", mark: "O" },
  { name: "Holdings", path: "/holdings", detail: "Long-term positions", mark: "H" },
  { name: "Positions", path: "/positions", detail: "Open positions", mark: "P" },
  { name: "Funds", path: "/funds", detail: "Demo cash ledger", mark: "F" },
];

const Apps = () => {
  return (
    <section className="apps-page" aria-labelledby="apps-heading">
      <h2 id="apps-heading">Applications</h2>
      <ul className="apps-list">
        {applications.map((application) => (
          <li key={application.path}>
            <Link to={application.path}>
              <span className="apps-list-mark" aria-hidden="true">
                {application.mark}
              </span>
              <span className="apps-list-copy">
                <strong>{application.name}</strong>
                <small>{application.detail}</small>
              </span>
              <span className="apps-list-arrow" aria-hidden="true">→</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default Apps;
