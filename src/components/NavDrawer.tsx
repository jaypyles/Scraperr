import React from "react";
import { useAuth } from "../contexts/AuthContext";
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
  Tooltip,
  Drawer,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import HttpIcon from "@mui/icons-material/Http";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useRouter } from "next/router";
import { useTheme } from "@mui/material/styles";

interface NavDrawerProps {
  toggleTheme: () => void;
  isDarkMode: boolean;
}

const drawerWidth = 240;

const NavDrawer: React.FC<NavDrawerProps> = ({ toggleTheme, isDarkMode }) => {
  const router = useRouter();
  const theme = useTheme();
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
                color="primary"
                onClick={logout}
                sx={{
                  width: "100%",
                  color: theme.palette.mode === "light" ? "#000000" : "#ffffff",
                }}
              >
                Logout
              </Button>
            </>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={() => router.push("/login")}
              sx={{
                width: "100%",
                color: theme.palette.mode === "light" ? "#000000" : "#ffffff",
              }}
            >
              Login
            </Button>
          )}
          <Divider sx={{ marginTop: 2, marginBottom: 2 }}></Divider>
          <Accordion sx={{ padding: 0, width: "90%" }}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <Typography>Settings</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Tooltip title="Dark Theme Toggle" placement="bottom">
                <Switch checked={isDarkMode} onChange={toggleTheme} />
              </Tooltip>
            </AccordionDetails>
          </Accordion>
        </Box>
      </Box>
    </Drawer>
  );
};

export default NavDrawer;
