"use client";

import {
  ErrorSnackbar,
  JobNotifySnackbar,
} from "@/components/common/snackbars";
import { ElementTable, JobSubmitter } from "@/components/submit/job-submitter";
import { useJobSubmitterProvider } from "@/components/submit/job-submitter/provider";
import { Box, Container } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useRef } from "react";

export const Home = () => {
  const {
    submittedURL,
    setSubmittedURL,
    rows,
    setRows,
    results,
    snackbarOpen,
    snackbarMessage,
    snackbarSeverity,
    closeSnackbar,
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
      <Container maxWidth="lg" className="overflow-y-auto">
        <Box className="flex flex-col gap-6">
          <JobSubmitter />
          <ElementTable
            rows={rows}
            setRows={setRows}
            submittedURL={submittedURL}
          />
        </Box>
      </Container>

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
  );
};
