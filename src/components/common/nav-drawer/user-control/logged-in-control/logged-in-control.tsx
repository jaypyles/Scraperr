import React from "react";
import { Typography, Button } from "@mui/material";
import classes from "./logged-in-control.module.css";
import { useUser } from "@/store/hooks";
import router from "next/router";
import { useAuth } from "@/hooks/use-auth";

type LoggedInControlProps = {
  children?: React.ReactNode;
};

export const LoggedInControl = ({ children }: LoggedInControlProps) => {
  const { user } = useUser();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

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
        onClick={handleLogout}
        className={classes.userControlButton}
      >
        Logout
      </Button>
    </>
  );
};
