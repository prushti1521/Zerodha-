import React, { useState } from "react";

import BuyActionWindow from "./BuyActionWindow";

const GeneralContext = React.createContext({
  openOrderWindow: (uid, mode, price) => {},
  closeBuyWindow: () => {},
});

export const GeneralContextProvider = (props) => {
  const [isBuyWindowOpen, setIsBuyWindowOpen] = useState(false);
  const [selectedStockUID, setSelectedStockUID] = useState("");
  const [selectedOrderMode, setSelectedOrderMode] = useState("BUY");
  const [selectedStockPrice, setSelectedStockPrice] = useState(0);

  const handleOpenOrderWindow = (uid, mode = "BUY", price = 0) => {
    setIsBuyWindowOpen(true);
    setSelectedStockUID(uid);
    setSelectedOrderMode(mode);
    setSelectedStockPrice(price);
  };

  const handleCloseBuyWindow = () => {
    setIsBuyWindowOpen(false);
    setSelectedStockUID("");
  };

  return (
    <GeneralContext.Provider
      value={{
        openOrderWindow: handleOpenOrderWindow,
        closeBuyWindow: handleCloseBuyWindow,
      }}
    >
      {props.children}
      {isBuyWindowOpen && (
        <BuyActionWindow
          uid={selectedStockUID}
          mode={selectedOrderMode}
          initialPrice={selectedStockPrice}
        />
      )}
    </GeneralContext.Provider>
  );
};

export default GeneralContext;
