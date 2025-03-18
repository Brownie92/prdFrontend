import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import WalletContextProvider from "./context/WalletProvider";
import App from "./App";
import "./index.css";
import { Buffer } from "buffer";

if (typeof window !== "undefined") {
   window.Buffer = Buffer;
}

const AppWrapper = (
    <WalletContextProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </WalletContextProvider>
);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  import.meta.env.PROD ? AppWrapper : <React.StrictMode>{AppWrapper}</React.StrictMode>
);
