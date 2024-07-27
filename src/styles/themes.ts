import { createTheme } from "@mui/material";

const commonThemeOptions = {
  typography: {
    fontFamily: '"Schibsted Grotesk", sans-serif',
    h1: {
      fontWeight: 500,
    },
    h2: {
      fontWeight: 500,
    },
    h3: {
      fontWeight: 500,
    },
    h4: {
      fontWeight: 500,
    },
    body1: {
      fontFamily: '"Schibsted Grotesk", sans-serif',
    },
    body2: {
      fontFamily: '"Schibsted Grotesk", sans-serif',
    },
    button: {
      fontFamily: '"Schibsted Grotesk", sans-serif',
    },
    caption: {
      fontFamily: '"Schibsted Grotesk", sans-serif',
    },
    overline: {
      fontFamily: '"Schibsted Grotesk", sans-serif',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFamily: '"Schibsted Grotesk", sans-serif',
        },
        html: {
          fontFamily: '"Schibsted Grotesk", sans-serif',
        },
        "*": {
          fontFamily: '"Schibsted Grotesk", sans-serif',
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
  components: {
    ...commonThemeOptions.components,
    MuiButton: {
      styleOverrides: {
        root: {
          color: "white",
          "&.MuiButton-root": {
            backgroundColor: "#034efc",
          },
          "&:hover": {
            backgroundColor: "#027be0",
          },
        },
      },
    },
  },
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
    h3: {
      ...commonThemeOptions.typography.h3,
      color: "#ffffff",
    },
    h4: {
      ...commonThemeOptions.typography.h4,
      color: "#ffffff",
    },
    h5: {
      color: "#ffffff",
    },
    body1: {
      ...commonThemeOptions.typography.body1,
      color: "#ffffff",
    },
  },
  components: {
    ...commonThemeOptions.components,
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFamily: '"Schibsted Grotesk", sans-serif',
        },
        html: {
          fontFamily: '"Schibsted Grotesk", sans-serif',
        },
        "*": {
          fontFamily: '"Schibsted Grotesk", sans-serif',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          color: "white",
          "&.MuiButton-root": {
            backgroundColor: "#034efc",
          },
          "&:hover": {
            backgroundColor: "#027be0",
          },
        },
      },
    },
  },
});

export { lightTheme, darkTheme };
