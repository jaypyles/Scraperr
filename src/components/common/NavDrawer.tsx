"use client";

import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemButton,
  ListItemText,
  Typography,
  Button,
  Switch,
  Drawer,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import HttpIcon from "@mui/icons-material/Http";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import TerminalIcon from "@mui/icons-material/Terminal";
import BarChart from "@mui/icons-material/BarChart";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { useRouter } from "next/router";

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
          <List>
            <ListItem>
              <ListItemButton onClick={() => router.push("/")}>
                <ListItemIcon>
                  <HomeIcon />
                </ListItemIcon>
                <ListItemText primary="Home" />
              </ListItemButton>
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemButton onClick={() => router.push("/jobs")}>
                <ListItemIcon>
                  <HttpIcon />
                </ListItemIcon>
                <ListItemText primary="Previous Jobs" />
              </ListItemButton>
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemButton onClick={() => router.push("/chat")}>
                <ListItemIcon>
                  <AutoAwesomeIcon />
                </ListItemIcon>
                <ListItemText primary="Chat" />
              </ListItemButton>
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemButton onClick={() => router.push("/statistics")}>
                <ListItemIcon>
                  <BarChart />
                </ListItemIcon>
                <ListItemText primary="Statistics" />
              </ListItemButton>
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemButton onClick={() => router.push("/logs")}>
                <ListItemIcon>
                  <TerminalIcon />
                </ListItemIcon>
                <ListItemText primary="View App Logs" />
              </ListItemButton>
            </ListItem>
            <Divider />
          </List>
        </div>
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
          <Accordion sx={{ padding: 0, width: "90%", marginBottom: 1 }}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <Typography>Quick Settings</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <div className="flex flex-row mr-1">
                <Typography className="mr-2" component="span">
                  <p className="text-sm">Dark Theme Toggle</p>
                </Typography>
                <Switch checked={isDarkMode} onChange={toggleTheme} />
              </div>
            </AccordionDetails>
          </Accordion>
        </Box>
      </Box>
    </Drawer>
  );
};
