import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/globals.css";

import React from "react";
import type { AppProps } from "next/app";
import Head from "next/head";

const App: React.FC<AppProps> = ({ Component, pageProps }) => {
  return (
    <>
      <Head>
        <title>Webapp Template</title>
      </Head>
      <Component {...pageProps} />
    </>
  );
};

export default App;
