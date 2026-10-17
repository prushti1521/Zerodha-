import React, { useState, useContext } from "react";

import GeneralContext from "./GeneralContext";

// Removed MUI imports because they are not required for dashboard rendering.

import { watchlist } from "../data/data";
import { DoughnutChart } from "./DoughnoutChart";

const WatchList = () => {
  const [search, setSearch] = useState("");
  const [selectedStock, setSelectedStock] = useState(null);
  const visibleStocks = watchlist.filter((stock) =>
    stock.name.toLowerCase().includes(search.trim().toLowerCase()),
  );
  const data = {
    labels: visibleStocks.map((stock) => stock.name),
    datasets: [
      {
        label: "Price",
        data: visibleStocks.map((stock) => stock.price),
        backgroundColor: [
          "rgba(255, 99, 132, 0.5)",
          "rgba(54, 162, 235, 0.5)",
          "rgba(255, 206, 86, 0.5)",
          "rgba(75, 192, 192, 0.5)",
          "rgba(153, 102, 255, 0.5)",
          "rgba(255, 159, 64, 0.5)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  // export const data = {
  //   labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
  // datasets: [
  //   {
  //     label: "# of Votes",
  //     data: [12, 19, 3, 5, 2, 3],
  //     backgroundColor: [
  //       "rgba(255, 99, 132, 0.2)",
  //       "rgba(54, 162, 235, 0.2)",
  //       "rgba(255, 206, 86, 0.2)",
  //       "rgba(75, 192, 192, 0.2)",
  //       "rgba(153, 102, 255, 0.2)",
  //       "rgba(255, 159, 64, 0.2)",
  //     ],
  //     borderColor: [
  //       "rgba(255, 99, 132, 1)",
  //       "rgba(54, 162, 235, 1)",
  //       "rgba(255, 206, 86, 1)",
  //       "rgba(75, 192, 192, 1)",
  //       "rgba(153, 102, 255, 1)",
  //       "rgba(255, 159, 64, 1)",
  //     ],
  //     borderWidth: 1,
  //   },
  // ],
  // };

  return (
    <div className="watchlist-container">
      <div className="search-container">
        <input
          type="text"
          name="search"
          id="search"
          placeholder="Search eg:infy, bse, nifty fut weekly, gold mcx"
          className="search"
          aria-label="Search watchlist"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <span className="counts">{visibleStocks.length} / {watchlist.length}</span>
      </div>
      <p className="watchlist-data-note">Sample quotes, not live market prices.</p>

      <ul className="list">
        {visibleStocks.map((stock) => (
          <WatchListItem
            stock={stock}
            key={stock.name}
            onShowAnalytics={setSelectedStock}
          />
        ))}
      </ul>
      {visibleStocks.length === 0 && <p className="watchlist-empty">No matching symbols.</p>}

      <DoughnutChart data={data} />
      {selectedStock && (
        <StockDetailsWindow
          stock={selectedStock}
          onClose={() => setSelectedStock(null)}
        />
      )}
    </div>
  );
};

export default WatchList;

const WatchListItem = ({ stock, onShowAnalytics }) => {
  return (
    <li>
      <div className="item">
        <p className={stock.isDown ? "down" : "up"}>{stock.name}</p>
        <div className="itemInfo">
          <span className="percent">{stock.percent}</span>
          {stock.isDown ? (
            <span className="down">↓</span>
          ) : (
            <span className="up">↑</span>
          )}
          <span className="price">{stock.price}</span>
        </div>
      </div>
      <WatchListActions stock={stock} onShowAnalytics={onShowAnalytics} />
    </li>
  );
};

const WatchListActions = ({ stock, onShowAnalytics }) => {
  const generalContext = useContext(GeneralContext);
  const [moreOpen, setMoreOpen] = useState(false);
  const [copyMessage, setCopyMessage] = useState("");

  const handleOrderClick = (mode) => {
    generalContext.openOrderWindow(stock.name, mode, stock.price);
  };

  const handleCopySymbol = async () => {
    try {
      await navigator.clipboard.writeText(stock.name);
      setCopyMessage("Copied");
    } catch {
      setCopyMessage("Copy unavailable");
    }
  };

  return (
    <div className="actions">
      <div className="watchlist-action-buttons">
        <button type="button" className="buy" title={`Buy ${stock.name}`} onClick={() => handleOrderClick("BUY")}>
          Buy
        </button>
        <button type="button" className="sell" title={`Sell ${stock.name}`} onClick={() => handleOrderClick("SELL")}>
          Sell
        </button>
        <button type="button" className="action" title={`Analytics for ${stock.name}`} onClick={() => onShowAnalytics(stock)}>
          📊
        </button>
        <button
          type="button"
          className="action more-trigger"
          title={`More actions for ${stock.name}`}
          aria-label={`More actions for ${stock.name}`}
          aria-expanded={moreOpen}
          onClick={() => setMoreOpen((open) => !open)}
        >
          •••
        </button>
        {moreOpen && (
          <div className="watchlist-more-menu" role="menu">
            <button type="button" role="menuitem" onClick={() => onShowAnalytics(stock)}>
              View quote details
            </button>
            <button type="button" role="menuitem" onClick={handleCopySymbol}>
              Copy symbol
            </button>
            {copyMessage && <span role="status">{copyMessage}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

const StockDetailsWindow = ({ stock, onClose }) => (
  <div className="stock-details-backdrop" role="presentation" onClick={onClose}>
    <section
      className="stock-details-window"
      role="dialog"
      aria-modal="true"
      aria-labelledby="stock-details-title"
      onClick={(event) => event.stopPropagation()}
    >
      <header>
        <div>
          <h2 id="stock-details-title">{stock.name}</h2>
          <p>Sample watchlist quote</p>
        </div>
        <button type="button" aria-label="Close quote details" onClick={onClose}>
          ×
        </button>
      </header>
      <dl>
        <div>
          <dt>Last price</dt>
          <dd>₹{stock.price.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</dd>
        </div>
        <div>
          <dt>Day change</dt>
          <dd className={stock.isDown ? "loss" : "profit"}>{stock.percent}</dd>
        </div>
      </dl>
      <p className="stock-details-note">Quote values are sample data and may not be current.</p>
    </section>
  </div>
);
