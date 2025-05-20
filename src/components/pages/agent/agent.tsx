import { validateURL } from "@/lib/helpers/validate-url";
import { ApiService } from "@/services";
import {
  Box,
  Button,
  Divider,
  Snackbar,
  Alert,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { AdvancedJobOptions } from "@/components/common/advanced-job-options";
import { useAdvancedJobOptions } from "@/lib/hooks/use-advanced-job-options/use-advanced-job-options";
import { checkAI } from "@/lib";
import { Disabled } from "@/components/common/disabled/disabled";

export const Agent = () => {
  const [url, setUrl] = useState("");
  const [prompt, setPrompt] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "success" | "error" | "info" | "warning"
  >("info");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const router = useRouter();
  const { jobOptions, setJobOptions } = useAdvancedJobOptions();
  const theme = useTheme();

  useEffect(() => {
    if (router.query.url) {
      setUrl(router.query.url as string);
    }

    if (router.query.prompt) {
      setPrompt(router.query.prompt as string);
    }
  }, [router.query.url, router.query.prompt]);

  useEffect(() => {
    checkAI(setAiEnabled);
  }, []);

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const ErrorSnackbar = () => {
    return (
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="error">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    );
  };

  const NotifySnackbar = () => {
    const goTo = () => {
      router.push("/jobs");
    };

    const action = (
      <Button color="inherit" size="small" onClick={goTo}>
        Go To Job
      </Button>
    );

    return (
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="info" action={action}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    );
  };

  const handleSubmit = async () => {
    if (!validateURL(url)) {
      setUrlError("Please enter a valid URL.");
      return;
    }

    setUrlError(null);

    await ApiService.submitJob(
      url,
      [],
      "",
      {
        collect_media: jobOptions.collect_media,
        multi_page_scrape: jobOptions.multi_page_scrape,
      },
      jobOptions.custom_headers,
      jobOptions.custom_cookies,
      null,
      true,
      prompt
    )
      .then(async (response) => {
        if (!response.ok) {
          return response.json().then((error) => {
            throw new Error(error.error);
          });
        }
        return response.json();
      })
      .then((data) => {
        setSnackbarMessage(
          `Agent job: ${data.id} submitted successfully.` ||
            "Agent job submitted successfully."
        );
        setSnackbarSeverity("info");
        setSnackbarOpen(true);
      })
      .catch((error) => {
        setSnackbarMessage(error || "An error occurred.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      });
  };

  if (!aiEnabled) {
    return (
      <Disabled message="Must set either OPENAI_KEY or OLLAMA_MODEL to use AI features." />
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: theme.palette.background.default,
        p: 4,
      }}
    >
      <Box
        sx={{
          backgroundColor: theme.palette.background.paper,
          borderRadius: 4,
          boxShadow: 6,
          p: 4,
          width: "100%",
          maxWidth: 800,
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <Typography variant="h3" sx={{ textAlign: "center", fontWeight: 600 }}>
          Agent Mode
        </Typography>
        <Typography
          variant="body1"
          sx={{ textAlign: "center", color: "text.secondary" }}
        >
          Use AI to scrape a website
        </Typography>
        <Divider />
        <Typography variant="body1" sx={{ fontWeight: 500 }}>
          Website URL
        </Typography>
        <TextField
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          error={!!urlError}
          helperText={urlError}
          autoComplete="agent-url"
          fullWidth
          placeholder="https://www.example.com"
          variant="outlined"
          size="small"
        />
        <Typography variant="body1" sx={{ fontWeight: 500, marginBottom: 0 }}>
          Prompt
        </Typography>
        <TextField
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          autoComplete="agent-prompt"
          fullWidth
          placeholder="Collect all the links on the page"
          variant="outlined"
          size="small"
        />
        <Box
          sx={{
            display: "flex",
            gap: 2,
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
          }}
        >
          <AdvancedJobOptions
            jobOptions={jobOptions}
            setJobOptions={setJobOptions}
            multiPageScrapeEnabled={false}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            sx={{ minWidth: 120 }}
          >
            Submit
          </Button>
        </Box>
        {snackbarSeverity === "info" ? <NotifySnackbar /> : <ErrorSnackbar />}
      </Box>
    </Box>
  );
};
