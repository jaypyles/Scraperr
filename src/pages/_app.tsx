import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/globals.css";

import React from "react";
import type { AppProps } from "next/app";
import Head from "next/head";
import { Auth0Provider } from "@auth0/auth0-react";
import NavDrawer from "../components/NavDrawer";

const domain = process.env.NEXT_PUBLIC_AUTH0_ISSUER_BASE_URL || "";
const clientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID || "";

console.log(domain);

const App: React.FC<AppProps> = ({ Component, pageProps }) => {
  return (
    <>
      <Head>
        <title>Webapp Template</title>
      </Head>
      <Auth0Provider
        domain={domain}
        clientId={clientId}
        authorizationParams={{
          redirect_uri: "http://localhost",
        }}
        cacheLocation="localstorage"
        useRefreshTokens={true}
      >
        <NavDrawer></NavDrawer>
        <Component {...pageProps} />
      </Auth0Provider>
    </>
  );
};

export default App;
