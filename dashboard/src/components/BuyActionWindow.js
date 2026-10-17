import React, { useContext, useState } from "react";
import api, { getApiErrorMessage } from "../api";
import GeneralContext from "./GeneralContext";

import "./BuyActionWindow.css";

const BuyActionWindow = ({ uid, mode = "BUY", initialPrice = 0 }) => {
  const [stockQuantity, setStockQuantity] = useState(1);
  const [stockPrice, setStockPrice] = useState(initialPrice);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const generalContext = useContext(GeneralContext);

  const handleOrderClick = async () => {
    const quantity = Number(stockQuantity);
    const price = Number(stockPrice);
    if (!Number.isSafeInteger(quantity) || quantity <= 0 || !Number.isFinite(price) || price < 0) {
      setError("Enter a valid quantity and price.");
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      await api.post("/newOrder", {
        name: uid,
        qty: quantity,
        price,
        mode,
      });
      generalContext.closeBuyWindow();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Order"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelClick = () => {
    generalContext.closeBuyWindow();
  };
  const orderValue = Number(stockQuantity) * Number(stockPrice);

  return (
    <div className="container" id="buy-window" draggable="true">
      <div className="regular-order">
        <div className="inputs">
          <fieldset>
            <legend>Qty.</legend>
            <input
              type="number"
              name="qty"
              id="qty"
              min="1"
              step="1"
              onChange={(e) => setStockQuantity(e.target.value)}
              value={stockQuantity}
            />
          </fieldset>
          <fieldset>
            <legend>Price</legend>
            <input
              type="number"
              name="price"
              id="price"
              min="0"
              step="0.05"
              onChange={(e) => setStockPrice(e.target.value)}
              value={stockPrice}
            />
          </fieldset>
        </div>
      </div>

      <div className="buttons">
        <span>Estimated order value ₹{orderValue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        <div>
          <button type="button" className="btn btn-blue" onClick={handleOrderClick} disabled={submitting}>
            {submitting ? "Saving…" : mode === "BUY" ? "Buy" : "Sell"}
          </button>
          <button type="button" className="btn btn-grey" onClick={handleCancelClick}>
            Cancel
          </button>
        </div>
        {error && <p role="alert">{error}</p>}
      </div>
    </div>
  );
};

export default BuyActionWindow;
