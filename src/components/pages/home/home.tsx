"use client";

import React, { useEffect, useRef } from "react";
import { Container, Box } from "@mui/material";
import { useRouter } from "next/router";
import { ElementTable, JobSubmitter } from "@/components/submit/job-submitter";
import { useJobSubmitterProvider } from "@/components/submit/job-submitter/provider";
import {
  ErrorSnackbar,
  JobNotifySnackbar,
} from "@/components/common/snackbars";

export const Home = () => {
  const {
    submittedURL,
    setSubmittedURL,
    rows,
    setRows,
    results,
    snackbarOpen,
    setSnackbarOpen,
    snackbarMessage,
    snackbarSeverity,
  } = useJobSubmitterProvider();
  const router = useRouter();
  const { elements, url } = router.query;

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
      <Container maxWidth="lg" className="overflow-y-auto max-h-full">
        <JobSubmitter />

        {submittedURL.length ? (
          <ElementTable
            rows={rows}
            setRows={setRows}
            submittedURL={submittedURL}
          />
        ) : null}
      </Container>

      {snackbarSeverity === "info" ? (
        <JobNotifySnackbar
          open={snackbarOpen}
          onClose={handleCloseSnackbar}
          message={snackbarMessage}
        />
      ) : (
        <ErrorSnackbar
          open={snackbarOpen}
          onClose={handleCloseSnackbar}
          message={snackbarMessage}
        />
      )}
    </Box>
  );
};
