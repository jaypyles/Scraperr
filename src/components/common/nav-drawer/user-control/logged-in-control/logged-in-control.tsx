import React from "react";
import { Typography, Button } from "@mui/material";
import classes from "./logged-in-control.module.css";

type LoggedInControlProps = {
  user: any;
  logout: () => void;
  children?: React.ReactNode;
};

export const LoggedInControl = ({
  user,
  logout,
  children,
}: LoggedInControlProps) => {
  if (children) {
    return <>{children}</>;
  }

  return (
    <>
      <Typography variant="body1" className={classes.welcome}>
        Welcome, {user?.full_name}
      </Typography>
      <Button
        variant="contained"
        onClick={logout}
        className={classes.userControlButton}
      >
        Logout
      </Button>
    </>
  );
};
