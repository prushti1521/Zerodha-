import React, { useEffect, useState } from "react";
import api, { getApiErrorMessage } from "../api";

const formatCurrency = (amount) => new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
}).format(amount);

const Funds = () => {
  const [fundData, setFundData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeAction, setActiveAction] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let isMounted = true;
    api.get("/funds")
      .then(({ data }) => {
        if (isMounted) setFundData(data);
      })
      .catch((requestError) => {
        if (isMounted) setError(getApiErrorMessage(requestError, "Demo balance"));
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const transactions = fundData?.transactions || [];
  const totalAdded = transactions
    .filter((transaction) => ["ADD", "SELL"].includes(transaction.mode))
    .reduce((total, transaction) => total + Number(transaction.amount), 0);
  const totalWithdrawn = transactions
    .filter((transaction) => ["WITHDRAW", "BUY"].includes(transaction.mode))
    .reduce((total, transaction) => total + Number(transaction.amount), 0);

  const handleActionSubmit = async (event) => {
    event.preventDefault();
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0 || numericAmount > 1000000) {
      setError("Enter an amount greater than 0 and no more than 1,000,000.");
      return;
    }

    setError("");
    setNotice("");
    try {
      await api.post(`/funds/${activeAction}`, { amount: numericAmount });
      const { data } = await api.get("/funds");
      setFundData(data);
      setNotice(activeAction === "deposit" ? "Demo funds added." : "Demo funds withdrawn.");
      setActiveAction("");
      setAmount("");
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Demo-funds request"));
    }
  };

  return (
    <section className="funds-page" aria-labelledby="funds-heading">
      <header className="funds-page-header">
        <div>
          <h2 id="funds-heading">Demo funds</h2>
          <p className="demo-funds-note">Simulated balance only. No real money or payment provider is involved.</p>
        </div>
        <div className="demo-funds-actions">
          <button type="button" className="btn btn-green" disabled={isLoading || !fundData} onClick={() => { setActiveAction("deposit"); setError(""); setNotice(""); }}>
            Add demo funds
          </button>
          <button type="button" className="btn btn-blue" disabled={isLoading || !fundData} onClick={() => { setActiveAction("withdraw"); setError(""); setNotice(""); }}>
            Withdraw
          </button>
        </div>
      </header>

      {error && <p className="demo-funds-error" role="alert">{error}</p>}
      {notice && <p className="demo-funds-notice" role="status">{notice}</p>}

      {activeAction && (
        <form className="demo-funds-form" onSubmit={handleActionSubmit}>
          <label htmlFor="demo-funds-amount">
            {activeAction === "deposit" ? "Amount to add" : "Amount to withdraw"}
          </label>
          <input
            id="demo-funds-amount"
            name="amount"
            type="number"
            min="0.01"
            max="1000000"
            step="0.01"
            required
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
          />
          <button type="submit" className="btn btn-blue">Confirm</button>
          <button type="button" className="btn btn-grey" onClick={() => setActiveAction("")}>Cancel</button>
        </form>
      )}

      <div className="demo-funds-summary">
        <div><span>Available demo cash</span><strong>{fundData ? formatCurrency(Number(fundData.balance)) : isLoading ? "Loading" : "—"}</strong></div>
        <div><span>Cash added / sale proceeds</span><strong>{fundData ? formatCurrency(totalAdded) : "—"}</strong></div>
        <div><span>Cash withdrawn / buy cost</span><strong>{fundData ? formatCurrency(totalWithdrawn) : "—"}</strong></div>
      </div>

      <section className="demo-funds-history" aria-labelledby="fund-history-heading">
        <h3 id="fund-history-heading">Activity</h3>
        {transactions.length === 0 ? (
          <p>{fundData ? "No demo-funds activity yet." : "Activity is unavailable."}</p>
        ) : (
          <div className="order-table">
            <table>
              <thead>
                <tr><th>Type</th><th>Amount</th><th>Balance after</th><th>Date</th></tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{{ ADD: "Added", WITHDRAW: "Withdrawn", BUY: "Buy", SELL: "Sell" }[transaction.mode]}</td>
                    <td>{formatCurrency(Number(transaction.amount))}</td>
                    <td>{formatCurrency(Number(transaction.balanceAfter))}</td>
                    <td>{new Date(transaction.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
};

export default Funds;