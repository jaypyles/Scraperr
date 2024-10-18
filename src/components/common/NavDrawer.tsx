"use client";

import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Box, List, Typography, Button, Drawer, Divider } from "@mui/material";

import { useRouter } from "next/router";
import { QuickSettings } from "../nav/quick-settings/quick-settings";
import { NavItem } from "./nav-drawer/nav-item";
import { NavItems } from "./nav-drawer/nav-items/nav-items";

interface NavDrawerProps {
  toggleTheme: () => void;
  isDarkMode: boolean;
}

const drawerWidth = 240;

export const NavDrawer: React.FC<NavDrawerProps> = ({
  toggleTheme,
  isDarkMode,
}) => {
  const router = useRouter();

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
        <Divider />
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {isAuthenticated ? (
            <>
              <Typography variant="body1" sx={{ margin: 1 }}>
                Welcome, {user?.full_name}
              </Typography>
              <Button
                variant="contained"
                onClick={logout}
                sx={{
                  width: "100%",
                }}
              >
                Logout
              </Button>
            </>
          ) : (
            <Button
              variant="contained"
              onClick={() => router.push("/login")}
              sx={{
                width: "100%",
              }}
            >
              Login
            </Button>
          )}
          <Divider sx={{ marginTop: 2, marginBottom: 2 }}></Divider>
          <QuickSettings toggleTheme={toggleTheme} isDarkMode={isDarkMode} />
        </Box>
      </Box>
    </Drawer>
  );
};
