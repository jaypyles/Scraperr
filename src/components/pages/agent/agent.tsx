import { AdvancedJobOptions } from "@/components/common/advanced-job-options";
import { Disabled } from "@/components/common/disabled/disabled";
import {
  ErrorSnackbar,
  JobNotifySnackbar,
} from "@/components/common/snackbars";
import {
  Provider as JobSubmitterProvider,
  useJobSubmitterProvider,
} from "@/components/submit/job-submitter/provider";
import { useAdvancedJobOptions } from "@/hooks/use-advanced-job-options";
import { useSubmitJob } from "@/hooks/use-submit-job";
import { checkAI } from "@/lib";
import { useUser } from "@/store/hooks";
import {
  Box,
  Button,
  Divider,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export const Agent = () => {
  const router = useRouter();
  const theme = useTheme();

  const { user } = useUser();
  const { jobOptions, setJobOptions } = useAdvancedJobOptions();
  const { submitJob, error } = useSubmitJob();
  const { snackbarOpen, snackbarMessage, snackbarSeverity, closeSnackbar } =
    useJobSubmitterProvider();

  const [url, setUrl] = useState("");
  const [prompt, setPrompt] = useState("");
  const [aiEnabled, setAiEnabled] = useState(false);

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

  const handleSubmit = async () => {
    await submitJob(url, [], user, jobOptions, null, true, prompt);
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
          error={!!error}
          helperText={error}
          autoComplete="agent-url"
          fullWidth
          placeholder="https://www.example.com"
          variant="outlined"
          size="small"
          data-cy="url-input"
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
          data-cy="prompt-input"
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
        {snackbarSeverity === "info" ? (
          <JobNotifySnackbar
            open={snackbarOpen}
            onClose={closeSnackbar}
            message={snackbarMessage}
          />
        ) : (
          <ErrorSnackbar
            open={snackbarOpen}
            onClose={closeSnackbar}
            message={snackbarMessage}
          />
        )}
      </Box>
    </Box>
  );
};

export const AgentPage = () => {
  return (
    <JobSubmitterProvider>
      <Agent />
    </JobSubmitterProvider>
  );
};
