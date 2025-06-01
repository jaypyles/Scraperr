"use client";

import { ApiService } from "@/services";
import { useUser, useUserSettings } from "@/store/hooks";
import { Box, Button, TextField, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import axios from "axios";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getUserSettings } from "../lib";

type Mode = "login" | "signup";

const AuthForm: React.FC = () => {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const theme = useTheme();
  const router = useRouter();
  const [registrationEnabled, setRegistrationEnabled] = useState<boolean>(true);
  const { setUserSettings } = useUserSettings();
  const { setUserState } = useUser();

  const checkRegistrationEnabled = async () => {
    const response = await axios.get(`/api/check`);
    setRegistrationEnabled(response.data.registration);
  };

  useEffect(() => {
    checkRegistrationEnabled();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      if (mode === "login") {
        const user = await ApiService.login(email, password);

        const userSettings = await getUserSettings();
        setUserSettings(userSettings);

        setUserState({
          isAuthenticated: true,
          email: user.email,
          username: user.username,
          full_name: user.full_name,
          loading: false,
          error: null,
        });

        toast.success("Login successful");
        router.push("/");
      } else {
        await ApiService.register(email, password, fullName);
        setMode("login");
        toast.success("Registration successful");
      }
    } catch (error) {
      console.error(error);
      toast.error("There was an error logging or registering");
    }
  };

  const toggleMode = () => {
    setMode((prevMode) => (prevMode === "login" ? "signup" : "login"));
  };

  return (
    <Box
      bgcolor="background.default"
      component="main"
      minHeight="100vh"
      sx={{ display: "flex", justifyContent: "center" }}
    >
      <Box
        bgcolor="background.paper"
        maxWidth="md"
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: 4,
          marginTop: 4,
          marginBottom: 4,
          height: "50vh",
        }}
      >
        <Typography component="h1" variant="h5">
          {mode.charAt(0).toUpperCase() + mode.slice(1)}
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {mode === "signup" && (
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="fullName"
              label="Full Name"
              type="text"
              id="fullName"
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              mt: 3,
              mb: 2,
              color: theme.palette.mode === "light" ? "#000000" : "#ffffff",
            }}
          >
            {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </Button>
          {registrationEnabled && (
            <Button
              onClick={toggleMode}
              fullWidth
              variant="text"
              color="primary"
            >
              {mode === "login" ? "No Account? Sign up" : "Login"}
            </Button>
          )}

          {!registrationEnabled && (
            <div
              style={{
                marginTop: 10,
                width: "100%",
                textAlign: "center",
                border: "1px solid #ccc",
                backgroundColor: "#f8f8f8",
                padding: 8,
                borderRadius: 4,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Typography variant="body2" color="text">
                Registration has been disabled
              </Typography>
            </div>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default AuthForm;
