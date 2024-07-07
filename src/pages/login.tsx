import React, { useState } from "react";
import axios from "axios";
import { Button, TextField, Typography, Container, Box } from "@mui/material";

type Mode = "login" | "signup";

const AuthForm: React.FC = () => {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      if (mode === "login") {
        const params = new URLSearchParams();
        params.append("username", email);
        params.append("password", password);
        const response = await axios.post(
          "http://localhost:8000/api/auth/token",
          params,
        );
        localStorage.setItem("token", response.data.access_token);
        alert("Login successful");
      } else {
        await axios.post("http://localhost:8000/api/auth/signup", {
          email: email,
          password: password,
          full_name: fullName,
        });
        alert("Signup successful");
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
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
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
            color="primary"
            sx={{ mt: 3, mb: 2 }}
          >
            {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </Button>
          <Button
            onClick={toggleMode}
            fullWidth
            variant="outlined"
            color="secondary"
          >
            Switch to {mode === "login" ? "Signup" : "Login"}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default AuthForm;
