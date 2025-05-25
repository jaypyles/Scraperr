import React from "react";
import { Box } from "@mui/material";
import clsx from "clsx";

import classes from "./user-control.module.css";
import { LoggedInControl } from "./logged-in-control";
import { LoggedOutControl } from "./logged-out-control";
import { useUser } from "@/store/hooks";

export type UserControlProps = {
  loggedInChildren?: React.ReactNode;
  loggedOutChildren?: React.ReactNode;
  className?: string;
};

export const UserControl = ({
  loggedInChildren,
  loggedOutChildren,
  className,
}: UserControlProps) => {
  const { user } = useUser();

  return (
    <Box className={clsx(classes.userControl, className)}>
      {user.isAuthenticated ? (
        <LoggedInControl>{loggedInChildren}</LoggedInControl>
      ) : (
        <LoggedOutControl>{loggedOutChildren}</LoggedOutControl>
      )}
    </Box>
  );
};
