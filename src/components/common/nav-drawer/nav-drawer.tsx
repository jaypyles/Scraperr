"use client";

import React from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { Box, Drawer, Divider } from "@mui/material";

import { QuickSettings } from "../../nav/quick-settings";
import { NavItems } from "./nav-items/nav-items";
import { UserControl } from "./user-control";

import classes from "./nav-drawer.module.css";

interface NavDrawerProps {
  toggleTheme: () => void;
  isDarkMode: boolean;
}

const drawerWidth = 240;

export const NavDrawer: React.FC<NavDrawerProps> = ({
  toggleTheme,
  isDarkMode,
}) => {
  const { logout, user, isAuthenticated } = useAuth();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: "border-box",
        },
      }}
    >
      <Box
        sx={{
          overflow: "auto",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          height: "100%",
        }}
      >
        <div>
          <NavItems />
        </div>
        <div>
          <UserControl
            isAuthenticated={isAuthenticated}
            user={user}
            logout={logout}
            className={classes.userControl}
          />
          <QuickSettings toggleTheme={toggleTheme} isDarkMode={isDarkMode} />
        </div>
      </Box>
    </Drawer>
  );
};
