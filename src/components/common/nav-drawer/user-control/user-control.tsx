import React from "react";
import { Box } from "@mui/material";
import clsx from "clsx";

import classes from "./user-control.module.css";
import { LoggedInControl } from "./logged-in-control";
import { LoggedOutControl } from "./logged-out-control";

export type UserControlProps = {
  isAuthenticated: boolean;
  user: any;
  logout: () => void;
  loggedInChildren?: React.ReactNode;
  loggedOutChildren?: React.ReactNode;
  className?: string;
};

export const UserControl = ({
  isAuthenticated,
  user,
  logout,
  loggedInChildren,
  loggedOutChildren,
  className,
}: UserControlProps) => {
  return (
    <Box className={clsx(classes.userControl, className)}>
      {isAuthenticated ? (
        <LoggedInControl user={user} logout={logout}>
          {loggedInChildren}
        </LoggedInControl>
      ) : (
        <LoggedOutControl>{loggedOutChildren}</LoggedOutControl>
      )}
    </Box>
  );
};
