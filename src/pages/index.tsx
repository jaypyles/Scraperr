"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button, Container, Box, Snackbar, Alert } from "@mui/material";
import { useRouter } from "next/router";
import { Element, Result } from "@/types";
import { ElementTable } from "@/components/submit";
import { JobSubmitter } from "@/components/submit/job-submitter";

const Home = () => {
  const router = useRouter();
  const { elements, url } = router.query;

  const [submittedURL, setSubmittedURL] = useState<string>("");
  const [rows, setRows] = useState<Element[]>([]);
  const [results, setResults] = useState<Result>({});
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<string>("error");
  const [isValidURL, setIsValidUrl] = useState<boolean>(true);

  const resultsRef = useRef<HTMLTableElement | null>(null);

  useEffect(() => {
    if (elements) {
      setRows(JSON.parse(elements as string));
    }
    if (url) {
      setSubmittedURL(url as string);
    }
  }, [elements, url]);

  useEffect(() => {
    if (results && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [results]);

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

  return (
    <Box
      bgcolor="background.default"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      height="100%"
      py={4}
    >
      <Container maxWidth="lg">
        <JobSubmitter
          stateProps={{
            submittedURL,
            setSubmittedURL,
            rows,
            isValidURL,
            setIsValidUrl,
            setSnackbarMessage,
            setSnackbarOpen,
            setSnackbarSeverity,
          }}
        />
        {submittedURL.length ? (
          <ElementTable
            rows={rows}
            setRows={setRows}
            submittedURL={submittedURL}
          />
        ) : null}
      </Container>
      {snackbarSeverity === "info" ? <NotifySnackbar /> : <ErrorSnackbar />}
    </Box>
  );
};

export default Home;
