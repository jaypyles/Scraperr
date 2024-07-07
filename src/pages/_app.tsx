import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/globals.css";

import React from "react";
import type { AppProps } from "next/app";
import Head from "next/head";
import { SessionProvider } from "next-auth/react";
import NavDrawer from "../components/NavDrawer";

const App: React.FC<AppProps> = ({ Component, pageProps }) => {
  return (
    <>
      <Head>
        <title>Webapp Template</title>
      </Head>
      <SessionProvider session={pageProps.session}>
        <NavDrawer />
        <Component {...pageProps} />
      </SessionProvider>
    </>
  );
};

export default App;
