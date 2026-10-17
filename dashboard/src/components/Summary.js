import React, { useEffect, useState } from "react";
import api from "../api";

const formatCurrency = (amount) => new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
}).format(amount);

const Summary = ({ user }) => {
  const [holdings, setHoldings] = useState(null);
  const [availableFunds, setAvailableFunds] = useState(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    Promise.allSettled([api.get("/allHoldings"), api.get("/funds")]).then(([holdingsResult, fundsResult]) => {
      if (!isMounted) return;
      if (holdingsResult.status === "fulfilled") {
        setHoldings(holdingsResult.value.data);
      } else {
        setLoadError(true);
      }
      if (fundsResult.status === "fulfilled") {
        setAvailableFunds(Number(fundsResult.value.data.balance));
      } else {
        setLoadError(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const portfolioHoldings = holdings || [];
  const invested = portfolioHoldings.reduce(
    (total, holding) => total + Number(holding.avg) * Number(holding.qty),
    0,
  );
  const currentValue = portfolioHoldings.reduce(
    (total, holding) => total + Number(holding.price) * Number(holding.qty),
    0,
  );
  const profitLoss = currentValue - invested;
  const profitPercent = invested > 0 ? (profitLoss / invested) * 100 : 0;
  const accountEquity = availableFunds === null || holdings === null
    ? null
    : availableFunds + currentValue;

  return (
    <>
      <div className="username">
        <h6>Hi, {user?.name || "there"}!</h6>
        <hr className="divider" />
      </div>

      {loadError && <p className="account-data-error" role="alert">Account totals are unavailable. Check the backend connection.</p>}

      <div className="section">
        <span>
          <p>Account equity</p>
        </span>

        <div className="data">
          <div className="first">
            <h3>{accountEquity === null ? "—" : formatCurrency(accountEquity)}</h3>
            <p>Demo cash + current holdings</p>
          </div>
          <hr />

          <div className="second">
            <p>Available demo cash <span>{availableFunds === null ? "—" : formatCurrency(availableFunds)}</span></p>
            <p>Holdings value <span>{holdings === null ? "—" : formatCurrency(currentValue)}</span></p>
          </div>
        </div>
        <hr className="divider" />
      </div>

      <div className="section">
        <span>
          <p>Holdings ({holdings === null ? "—" : holdings.length})</p>
        </span>

        <div className="data">
          <div className="first">
            <h3 className={profitLoss >= 0 ? "profit" : "loss"}>
              {holdings === null ? "—" : formatCurrency(profitLoss)}
              {holdings !== null && <small>{profitPercent >= 0 ? "+" : ""}{profitPercent.toFixed(2)}%</small>}
            </h3>
            <p>Unrealized P&amp;L</p>
          </div>
          <hr />

          <div className="second">
            <p>Current value <span>{holdings === null ? "—" : formatCurrency(currentValue)}</span></p>
            <p>Invested <span>{holdings === null ? "—" : formatCurrency(invested)}</span></p>
          </div>
        </div>
        <hr className="divider" />
      </div>
    </>
  );
};

export default Summary;
