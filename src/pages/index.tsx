import React, { useState, useEffect, useRef } from "react";
import { Typography, Container, Box, Snackbar, Alert } from "@mui/material";
import { useRouter } from "next/router";
import { Element, Result } from "../types";
import { ElementTable, JobSubmitter, ResultsTable } from "../components/submit";

const Home = () => {
  const router = useRouter();
  const { elements, url } = router.query;

  const [submittedURL, setSubmittedURL] = useState<string>("");
  const [rows, setRows] = useState<Element[]>([]);
  const [results, setResults] = useState<Result>({});
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<string>("alert");

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
      <Alert onClose={handleCloseSnackbar} severity="error">
        {snackbarMessage}
      </Alert>
    );
  };

  const NotifySnackbar = () => {
    return (
      <Alert onClose={handleCloseSnackbar} severity="info">
        {snackbarMessage}
      </Alert>
    );
  };

  return (
    <Box
      bgcolor="background.default"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      py={4}
    >
      <Container maxWidth="md">
        <Typography variant="h1" gutterBottom textAlign="center">
          Scraperr
        </Typography>
        <JobSubmitter
          stateProps={{
            submittedURL,
            setSubmittedURL,
            rows,
            setResults,
            setSnackbarMessage,
            setSnackbarOpen,
            setSnackbarSeverity,
          }}
        />
        <ElementTable
          rows={rows}
          setRows={setRows}
          submittedURL={submittedURL}
        />
        {/* <ResultsTable stateProps={{ results }} resultsRef={resultsRef} /> */}
      </Container>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <p>Woo</p>
        {/* {snackbarSeverity === "info" ? <NotifySnackbar /> : <ErrorSnackbar />} */}
      </Snackbar>
    </Box>
  );
};

export default Home;
