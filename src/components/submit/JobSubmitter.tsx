import React, { useEffect, useState, Dispatch } from "react";
import {
  TextField,
  Button,
  Box,
  Checkbox,
  FormControlLabel,
  CircularProgress,
} from "@mui/material";
import { Element, Result } from "../../types";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/router";

interface StateProps {
  submittedURL: string;
  setSubmittedURL: Dispatch<React.SetStateAction<string>>;
  rows: Element[];
  setResults: Dispatch<React.SetStateAction<Result>>;
  setSnackbarMessage: Dispatch<React.SetStateAction<string>>;
  setSnackbarOpen: Dispatch<React.SetStateAction<boolean>>;
  setSnackbarSeverity: Dispatch<React.SetStateAction<string>>;
}

interface Props {
  stateProps: StateProps;
}

interface JobOptions {
  multi_page_scrape: boolean;
  custom_headers: null | string;
}

export const JobSubmitter = ({ stateProps }: Props) => {
  const { user } = useAuth();
  const router = useRouter();

  const { job_options } = router.query;

  const {
    submittedURL,
    setSubmittedURL,
    rows,
    setResults,
    setSnackbarMessage,
    setSnackbarOpen,
    setSnackbarSeverity,
  } = stateProps;

  const [isValidURL, setIsValidUrl] = useState<boolean>(true);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [jobOptions, setJobOptions] = useState<JobOptions>({
    multi_page_scrape: false,
    custom_headers: null,
  });
  const [customJSONSelected, setCustomJSONSelected] = useState<boolean>(false);

  function validateURL(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch (_) {
      return false;
    }
  }

  const handleSubmit = () => {
    if (!validateURL(submittedURL)) {
      setIsValidUrl(false);
      setUrlError("Please enter a valid URL.");
      return;
    }

    setIsValidUrl(true);
    setUrlError(null);
    setLoading(true);

    let customHeaders;
    try {
      customHeaders = jobOptions.custom_headers
        ? JSON.parse(jobOptions.custom_headers)
        : null;
    } catch (error) {
      setSnackbarMessage("Invalid JSON in custom headers.");
      setSnackbarOpen(true);
      setSnackbarSeverity("error");
      setLoading(false);
      return;
    }

    fetch("/api/submit-scrape-job", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        url: submittedURL,
        elements: rows,
        user: user?.email,
        time_created: new Date().toISOString(),
        job_options: {
          ...jobOptions,
          custom_headers: customHeaders,
        },
      }),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((error) => {
            throw new Error(error.error);
          });
        }
        return response.json();
      })
      .then((data) => {
        setSnackbarMessage(data);
        setSnackbarSeverity("info");
        setSnackbarOpen(true);
      })
      .catch((error) => {
        setSnackbarMessage(error.message || "An error occurred.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (job_options) {
      const jsonOptions = JSON.parse(job_options as string);
      const newJobOptions: JobOptions = {
        multi_page_scrape: false,
        custom_headers: null,
      };

      if (
        jsonOptions.custom_headers &&
        Object.keys(jsonOptions.custom_headers).length
      ) {
        setCustomJSONSelected(true);
        newJobOptions.custom_headers = JSON.stringify(
          jsonOptions.custom_headers
        );
      }

      newJobOptions.multi_page_scrape = jsonOptions.multi_page_scrape;
      setJobOptions(newJobOptions);
    }
  }, [job_options]);

  return (
    <>
      <div className="flex flex-row space-x-4 items-center mb-2">
        <TextField
          label="URL"
          variant="outlined"
          fullWidth
          value={submittedURL}
          onChange={(e) => setSubmittedURL(e.target.value)}
          error={!isValidURL}
          helperText={!isValidURL ? urlError : ""}
        />
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={handleSubmit}
          disabled={!(rows.length > 0) || loading}
        >
          {loading ? <CircularProgress size={24} /> : "Submit"}
        </Button>
      </div>
      <Box bgcolor="background.paper" className="flex flex-col mb-2 rounded-md">
        <div id="options" className="p-2 flex flex-row space-x-2">
          <FormControlLabel
            label="Multi-Page Scrape"
            control={
              <Checkbox
                checked={jobOptions.multi_page_scrape}
                onChange={() =>
                  setJobOptions((prevJobOptions) => ({
                    ...prevJobOptions,
                    multi_page_scrape: !prevJobOptions.multi_page_scrape,
                  }))
                }
              />
            }
          ></FormControlLabel>
          <FormControlLabel
            label="Custom Headers (JSON)"
            control={
              <Checkbox
                checked={customJSONSelected}
                onChange={() => {
                  setCustomJSONSelected(!customJSONSelected);
                  setJobOptions((prevJobOptions) => ({
                    ...prevJobOptions,
                    custom_headers: "",
                  }));
                }}
              />
            }
          ></FormControlLabel>
        </div>
        {customJSONSelected ? (
          <div id="custom-json" className="pl-2 pr-2 pb-2">
            <TextField
              InputLabelProps={{ shrink: false }}
              fullWidth
              multiline
              minRows={4}
              variant="outlined"
              value={jobOptions.custom_headers || ""}
              onChange={(e) =>
                setJobOptions((prevJobOptions) => ({
                  ...prevJobOptions,
                  custom_headers: e.target.value,
                }))
              }
              style={{ maxHeight: "20vh", overflow: "auto" }}
              className="mt-2"
            />
          </div>
        ) : null}
      </Box>
    </>
  );
};
