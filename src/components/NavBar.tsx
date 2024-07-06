import React from "react";
import { useAuth } from "../useAuth";
import { LogoutOptions, RedirectLoginOptions } from "@auth0/auth0-react";

const NavBar: React.FC = () => {
  const { loginWithRedirect, logout, user, isAuthenticated } = useAuth();

  const handleLogout = () => {
    const logoutOptions: LogoutOptions = {};
    logout(logoutOptions);
  };

  const handleLogin = () => {
    const loginOptions: RedirectLoginOptions = {
      authorizationParams: { redirect_uri: "http://localhost" },
    };
    loginWithRedirect(loginOptions);
  };

  return (
    <nav>
      {isAuthenticated ? (
        <>
          <p>Welcome, {user?.name}</p>
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </nav>
  );
};

export default NavBar;
