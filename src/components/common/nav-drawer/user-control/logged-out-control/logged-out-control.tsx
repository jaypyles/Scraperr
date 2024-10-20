import React from "react";
import { Button } from "@mui/material";
import classes from "./logged-out-control.module.css";
import { useRouter } from "next/navigation";

export type LoggedOutControlProps = {
  children?: React.ReactNode;
};

export const LoggedOutControl: React.FC<LoggedOutControlProps> = ({
  children,
}) => {
  const router = useRouter();
  const login = () => router.push("/login");

  if (children) {
    return <>{children}</>;
  }

  return (
    <Button
      variant="contained"
      onClick={login}
      className={classes.userControlButton}
    >
      Login
    </Button>
  );
};
