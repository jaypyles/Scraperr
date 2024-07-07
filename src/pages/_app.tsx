import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/globals.css";

import React, { useState, useEffect } from "react";
import type { AppProps } from "next/app";
import Head from "next/head";
import { ThemeProvider, CssBaseline } from "@mui/material";
import NavDrawer from "../components/NavDrawer";
import { darkTheme, lightTheme } from "../styles/themes";
import { AuthProvider } from "../contexts/AuthContext";

const App: React.FC<AppProps> = ({ Component, pageProps }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setIsDarkMode(savedTheme === "dark");
    } else {
      const prefersDarkMode = window.matchMedia(
        "(prefers-color-scheme: dark)",
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
      <AuthProvider>
        <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
          <CssBaseline />
          <NavDrawer isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
          <Component {...pageProps} />
        </ThemeProvider>
      </AuthProvider>
    </>
  );
};

export default App;
