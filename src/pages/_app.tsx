import "@/styles/globals.css";
import "bootstrap/dist/css/bootstrap.min.css";

import { NavDrawer } from "@/components/common";
import { persistor, store } from "@/store/store";
import { darkTheme, lightTheme } from "@/styles/themes";
import { Box, CssBaseline, ThemeProvider } from "@mui/material";
import type { AppProps } from "next/app";
import Head from "next/head";
import React, { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { ToastContainer } from "react-toastify";
import { PersistGate } from "redux-persist/integration/react";

const App: React.FC<AppProps> = ({ Component, pageProps }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setIsDarkMode(savedTheme === "dark");
    } else {
      const prefersDarkMode = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      setIsDarkMode(prefersDarkMode);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem("theme", newTheme ? "dark" : "light");
  };

  return (
    <>
      <Head>
        <title>Scraperr</title>
      </Head>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
            <CssBaseline />
            <Box sx={{ height: "100%", display: "flex" }}>
              <NavDrawer isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
              <Box
                component="main"
                sx={{
                  p: 3,
                  bgcolor: "background.default",
                  overflow: "hidden",
                  height: "100%",
                  width: "100%",
                }}
              >
                <Component {...pageProps} />
              </Box>
            </Box>
            <ToastContainer theme={isDarkMode ? "dark" : "light"} />
          </ThemeProvider>
        </PersistGate>
      </Provider>
    </>
  );
};

export default App;
