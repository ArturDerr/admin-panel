import React from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { HashRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

const theme = extendTheme({
  fonts: {
    heading: "Inter Display, sans-serif",
    body: "Inter Display, sans-serif",
  },
  radii: {
    none: "0",
  },
  styles: {
    global: {
      body: {
        bg: "#eef1f4",
        color: "#2b2f36",
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <HashRouter>
        <App />
      </HashRouter>
    </ChakraProvider>
  </React.StrictMode>,
);
