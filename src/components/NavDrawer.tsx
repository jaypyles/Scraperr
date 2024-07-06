import React, { useState } from "react";
import { useAuth } from "../useAuth";
import { LogoutOptions, RedirectLoginOptions } from "@auth0/auth0-react";
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
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import HttpIcon from "@mui/icons-material/Http";
import MenuIcon from "@mui/icons-material/Menu";
import { useRouter } from "next/router";

const NavDrawer: React.FC = () => {
  const router = useRouter();
  const { loginWithRedirect, logout, user, isAuthenticated } = useAuth();
  const [open, setOpen] = useState<boolean>(false);

  const handleLogout = () => {
    const logoutOptions: LogoutOptions = {};
    logout(logoutOptions);
  };

  const handleLogin = () => {
    const loginOptions: RedirectLoginOptions = {
      authorizationParams: { redirect_uri: "http://localhost" },
    };
    loginWithRedirect(loginOptions);
  };

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
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={toggleDrawer(true)}
          >
            <MenuIcon />
          </IconButton>
          {isAuthenticated ? (
            <>
              <Typography variant="body1" sx={{ marginRight: 2 }}>
                Welcome, {user?.name}
              </Typography>
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <Button color="inherit" onClick={handleLogin}>
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
