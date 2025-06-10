"use client";

import { AdvancedJobOptions } from "@/components/common/advanced-job-options";
import { useSubmitJob } from "@/hooks/use-submit-job";
import { parseJobOptions } from "@/lib";
import { useUser } from "@/store/hooks";
import { Box, Paper } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { JobSubmitterHeader } from "./job-submitter-header";
import { JobSubmitterInput } from "./job-submitter-input";
import { useJobSubmitterProvider } from "./provider";

export const JobSubmitter = () => {
  const router = useRouter();
  const { job_options, id } = router.query;
  console.log(id);
  const { user } = useUser();

  const { submitJob, loading, error } = useSubmitJob();
  const {
    jobId,
    setJobId,
    submittedURL,
    rows,
    siteMap,
    setSiteMap,
    jobOptions,
    setJobOptions,
  } = useJobSubmitterProvider();

  useEffect(() => {
    if (job_options) {
      parseJobOptions(
        id as string,
        job_options as string,
        setJobOptions,
        setSiteMap,
        setJobId
      );
    }
  }, [job_options]);

  const handleSubmit = async () => {
    await submitJob(
      submittedURL,
      rows,
      user,
      jobOptions,
      siteMap,
      false,
      null,
      jobId
    );
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        borderRadius: 2,
        bgcolor: "background.paper",
        border: 1,
        borderColor: "divider",
        "&:hover": {
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
        },
      }}
    >
      <Box className="flex flex-col gap-6">
        <JobSubmitterHeader />
        <Box className="flex flex-col gap-4">
          <JobSubmitterInput
            urlError={error}
            handleSubmit={handleSubmit}
            loading={loading}
          />
          <AdvancedJobOptions
            jobOptions={jobOptions}
            setJobOptions={setJobOptions}
          />
        </Box>
      </Box>
    </Paper>
  );
};
