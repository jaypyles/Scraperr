"use client";

import React, { useState } from "react";
import axios from "axios";
import { Button, TextField, Typography, Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/router";
import { useAuth } from "../contexts/AuthContext";
import { Constants } from "../lib";

type Mode = "login" | "signup";

const AuthForm: React.FC = () => {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const theme = useTheme();
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      if (mode === "login") {
        await login(email, password);
        alert("Login successful");
        router.push("/");
      } else {
        await axios.post(`${Constants.DOMAIN}/api/auth/signup`, {
          email: email,
          password: password,
          full_name: fullName,
        });
        alert("Signup successful");
        router.push("/login");
      }
    } catch (error) {
      console.error(error);
      alert(`${mode.charAt(0).toUpperCase() + mode.slice(1)} failed`);
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
          <Button onClick={toggleMode} fullWidth variant="text" color="primary">
            {mode === "login" ? "No Account? Sign up" : "Login"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default AuthForm;
