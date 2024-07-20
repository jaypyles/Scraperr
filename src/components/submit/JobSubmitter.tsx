import React, { useState, useEffect, useRef, Dispatch } from "react";
import {
  TextField,
  Button,
  Box,
  Checkbox,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Element, Result } from "../../types";
import { useAuth } from "../../contexts/AuthContext";

interface stateProps {
  submittedURL: string;
  setSubmittedURL: Dispatch<React.SetStateAction<string>>;
  rows: Element[];
  setResults: Dispatch<React.SetStateAction<Result>>;
  setSnackbarMessage: Dispatch<React.SetStateAction<string>>;
  setSnackbarOpen: Dispatch<React.SetStateAction<boolean>>;
}

interface Props {
  stateProps: stateProps;
}

interface JobOptions {
  multi_page_scrape: boolean;
  custom_headers: null | Object;
}

export const JobSubmitter = ({ stateProps }: Props) => {
  const { user } = useAuth();

  const {
    submittedURL,
    setSubmittedURL,
    rows,
    setResults,
    setSnackbarMessage,
    setSnackbarOpen,
  } = stateProps;

  const [isValidURL, setIsValidUrl] = useState<boolean>(true);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [jobOptions, setJobOptions] = useState<JobOptions>({
    multi_page_scrape: false,
    custom_headers: null,
  });

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

    fetch("/api/submit-scrape-job", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        url: submittedURL,
        elements: rows,
        user: user?.email,
        time_created: new Date().toISOString(),
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
      .then((data) => setResults(data))
      .catch((error) => {
        setSnackbarMessage(error.message || "An error occurred.");
        setSnackbarOpen(true);
      })
      .finally(() => setLoading(false));
  };

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
      <Box
        bgcolor="background.paper"
        className="p-2 mb-2 flex flex-row space-x-2"
      >
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
        <Accordion style={{ padding: 1 }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1-content"
            id="panel1-header"
          >
            Custom Headers (JSON)
          </AccordionSummary>
          <AccordionDetails>
            <TextField
              InputLabelProps={{ shrink: false }}
              fullWidth
              multiline
              minRows={4}
              variant="outlined"
              value={jobOptions.custom_headers}
              onChange={(e) =>
                setJobOptions((prevJobOptions) => ({
                  ...prevJobOptions,
                  custom_headers: e.target.value,
                }))
              }
              style={{ maxHeight: "20vh", overflow: "auto" }}
              className="mt-2"
            />
          </AccordionDetails>
        </Accordion>
      </Box>
    </>
  );
};
