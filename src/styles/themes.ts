import { createTheme } from "@mui/material";

const commonThemeOptions = {
  typography: {
    fontFamily: "Roboto, sans-serif",
    h1: {
      fontWeight: 500,
    },
    h2: {
      fontWeight: 500,
    },
    h4: {
      fontWeight: 500,
    },
    body1: {
      fontFamily: "Roboto, sans-serif",
    },
    body2: {
      fontFamily: "Roboto, sans-serif",
    },
    button: {
      fontFamily: "Roboto, sans-serif",
    },
    caption: {
      fontFamily: "Roboto, sans-serif",
    },
    overline: {
      fontFamily: "Roboto, sans-serif",
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFamily: "Roboto, sans-serif",
        },
        html: {
          fontFamily: "Roboto, sans-serif",
        },
        "*": {
          fontFamily: "Roboto, sans-serif",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          padding: 16,
        },
      },
    },
  },
};

const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
    background: {
      default: "#f4f6f8",
      paper: "#ffffff",
    },
    text: {
      primary: "#000000",
      secondary: "#333333",
    },
  },
  ...commonThemeOptions,
});

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#90caf9",
    },
    secondary: {
      main: "#f48fb1",
    },
    background: {
      default: "#121212",
      paper: "#1e1e1e",
    },
    text: {
      primary: "#ffffff",
      secondary: "#bbbbbb",
    },
  },
  typography: {
    ...commonThemeOptions.typography,
    h1: {
      ...commonThemeOptions.typography.h1,
      color: "#ffffff",
    },
    h2: {
      ...commonThemeOptions.typography.h2,
      color: "#ffffff",
    },
    h4: {
      ...commonThemeOptions.typography.h4,
      color: "#ffffff",
    },
    h5: {
      color: "#ffffff",
    },
  },
  components: {
    ...commonThemeOptions.components,
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFamily: "Roboto, sans-serif",
        },
        html: {
          fontFamily: "Roboto, sans-serif",
        },
        "*": {
          fontFamily: "Roboto, sans-serif",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          color: "white",
        },
      },
    },
  },
});

export { lightTheme, darkTheme };
