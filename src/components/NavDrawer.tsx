import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemButton,
  ListItemText,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
  Switch,
  Tooltip,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import HttpIcon from "@mui/icons-material/Http";
import MenuIcon from "@mui/icons-material/Menu";
import { useRouter } from "next/router";

interface NavDrawerProps {
  toggleTheme: () => void;
  isDarkMode: boolean;
}

const NavDrawer: React.FC<NavDrawerProps> = ({ toggleTheme, isDarkMode }) => {
  const router = useRouter();
  const { login, logout, user, isAuthenticated } = useAuth();
  const [open, setOpen] = useState<boolean>(false);

  const toggleDrawer =
    (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
      if (
        event.type === "keydown" &&
        ((event as React.KeyboardEvent).key === "Tab" ||
          (event as React.KeyboardEvent).key === "Shift")
      ) {
        return;
      }
      setOpen(open);
    };

  const DrawerList = (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>
        <ListItem>
          <ListItemButton onClick={() => router.push("/")}>
            <ListItemIcon>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText>Home</ListItemText>
          </ListItemButton>
        </ListItem>
        <ListItem>
          <ListItemButton onClick={() => router.push("/jobs")}>
            <ListItemIcon>
              <HttpIcon />
            </ListItemIcon>
            <ListItemText>Previous Jobs</ListItemText>
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="static">
        <Toolbar className="flex flex-row justify-between items-center">
          <div className="flex flex-row">
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={toggleDrawer(true)}
            >
              <MenuIcon />
            </IconButton>
            <Tooltip title="Dark Theme Toggle" placement="bottom">
              <Switch checked={isDarkMode} onChange={toggleTheme} />
            </Tooltip>
          </div>
          {isAuthenticated ? (
            <div className="flex flex-row items-center">
              <Typography variant="body1" sx={{ marginRight: 2 }}>
                Welcome, {user?.full_name}
              </Typography>
              <Button color="inherit" onClick={logout} className="!color-white">
                Logout
              </Button>
            </div>
          ) : (
            <Button color="inherit" onClick={() => router.push("/login")}>
              Login
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <Drawer open={open} onClose={toggleDrawer(false)}>
        {DrawerList}
      </Drawer>
    </>
  );
};

export default NavDrawer;
