"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/router";
import { RawJobOptions } from "@/types/job";
import { parseJobOptions, validateURL } from "@/lib";
import { JobSubmitterHeader } from "./job-submitter-header";
import { JobSubmitterInput } from "./job-submitter-input";
import { JobSubmitterOptions } from "./job-submitter-options";
import { ApiService } from "@/services";
import { useJobSubmitterProvider } from "./provider";
import { AdvancedJobOptions } from "@/components/common/advanced-job-options";

const initialJobOptions: RawJobOptions = {
  multi_page_scrape: false,
  custom_headers: null,
  proxies: null,
  collect_media: false,
  custom_cookies: null,
};

export const JobSubmitter = () => {
  const { user } = useAuth();
  const router = useRouter();
  const { job_options } = router.query;

  const {
    submittedURL,
    rows,
    siteMap,
    setIsValidUrl,
    setSnackbarMessage,
    setSnackbarOpen,
    setSnackbarSeverity,
    setSiteMap,
  } = useJobSubmitterProvider();

  const [urlError, setUrlError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [jobOptions, setJobOptions] =
    useState<RawJobOptions>(initialJobOptions);

  const handleSubmit = async () => {
    if (!validateURL(submittedURL)) {
      setIsValidUrl(false);
      setUrlError("Please enter a valid URL.");
      return;
    }

    setIsValidUrl(true);
    setUrlError(null);
    setLoading(true);

    let customHeaders;
    let customCookies;

    try {
      customHeaders = jobOptions.custom_headers || null;
      customCookies = jobOptions.custom_cookies || null;
    } catch (error: any) {
      console.error(error);
      setSnackbarMessage("Invalid JSON in custom headers.");
      setSnackbarOpen(true);
      setSnackbarSeverity("error");
      setLoading(false);
      return;
    }

    await ApiService.submitJob(
      submittedURL,
      rows,
      user,
      jobOptions,
      customHeaders,
      customCookies,
      siteMap
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
          `Job: ${data.id} submitted successfully.` ||
            "Job submitted successfully."
        );
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
      parseJobOptions(job_options as string, setJobOptions, setSiteMap);
    }
  }, [job_options]);

  return (
    <div>
      <JobSubmitterHeader />
      <JobSubmitterInput
        urlError={urlError}
        handleSubmit={handleSubmit}
        loading={loading}
      />
      <AdvancedJobOptions
        jobOptions={jobOptions}
        setJobOptions={setJobOptions}
      />
    </div>
  );
};
