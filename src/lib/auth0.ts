import { initAuth0 } from "@auth0/nextjs-auth0";

const secret = process.env.AUTH0_SECRET;

if (!secret) {
  throw new Error("Secret not found");
}

export default initAuth0({
  secret: process.env.AUTH0_SECRET as string,
  baseURL: process.env.AUTH0_BASE_URL as string,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL as string,
  clientID: process.env.AUTH0_CLIENT_ID as string,
  clientSecret: process.env.AUTH0_CLIENT_SECRET as string,
  routes: {
    callback: "/auth/callback",
    postLogoutRedirect: "/",
  },
});
