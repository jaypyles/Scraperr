"use client";

import React, { useEffect, useState, Dispatch } from "react";
import { Element } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/router";
import { Constants } from "@/lib";

import { JobSubmitterHeader } from "./job-submitter-header";
import { JobSubmitterInput } from "./job-submitter-input";
import { JobSubmitterOptions } from "./job-submitter-options";

interface StateProps {
  submittedURL: string;
  setSubmittedURL: Dispatch<React.SetStateAction<string>>;
  rows: Element[];
  isValidURL: boolean;
  setIsValidUrl: Dispatch<React.SetStateAction<boolean>>;
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
    isValidURL,
    setIsValidUrl,
    setSnackbarMessage,
    setSnackbarOpen,
    setSnackbarSeverity,
  } = stateProps;

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

    fetch(`${Constants.DOMAIN}/api/submit-scrape-job`, {
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
        setSnackbarMessage(data || "Job submitted successfully.");
        setSnackbarSeverity("info");
        setSnackbarOpen(true);
      })
      .catch((error) => {
        setSnackbarMessage(error || "An error occurred.");
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
      <div>
        <JobSubmitterHeader />
        <JobSubmitterInput
          {...stateProps}
          urlError={urlError}
          handleSubmit={handleSubmit}
          loading={loading}
        />
        <JobSubmitterOptions
          {...stateProps}
          jobOptions={jobOptions}
          setJobOptions={setJobOptions}
          customJSONSelected={customJSONSelected}
          setCustomJSONSelected={setCustomJSONSelected}
        />
      </div>
    </>
  );
};
