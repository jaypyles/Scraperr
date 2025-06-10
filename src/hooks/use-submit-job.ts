import { useJobSubmitterProvider } from "@/components/submit/job-submitter/provider";
import { validateURL } from "@/lib/helpers";
import { ApiService } from "@/services/api-service";
import { Element } from "@/types";
import { RawJobOptions, SiteMap } from "@/types/job";
import { User } from "@/types/user.type";
import { useState } from "react";

export const useSubmitJob = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data] = useState<any>(null);

  const {
    setSnackbarMessage,
    setSnackbarOpen,
    setSnackbarSeverity,
    setIsValidUrl,
  } = useJobSubmitterProvider();

  const submitJob = async (
    submittedURL: string,
    rows: Element[],
    user: User,
    jobOptions: RawJobOptions,
    siteMap: SiteMap | null,
    agentMode: boolean,
    prompt: string | null,
    id?: string
  ) => {
    if (!validateURL(submittedURL)) {
      setIsValidUrl(false);
      setError("Please enter a valid URL.");
      return;
    }

    setIsValidUrl(true);
    setError(null);
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
      siteMap,
      agentMode,
      prompt || undefined,
      id
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
        const errorMessage =
          error instanceof Error ? error.message : "An error occurred.";
        console.log(errorMessage);
        setSnackbarMessage(errorMessage);
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      })
      .finally(() => setLoading(false));
  };

  return { submitJob, loading, error, data };
};
