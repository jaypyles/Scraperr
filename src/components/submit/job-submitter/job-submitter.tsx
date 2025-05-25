"use client";

import { AdvancedJobOptions } from "@/components/common/advanced-job-options";
import { parseJobOptions } from "@/lib";
import { initialJobOptions, RawJobOptions } from "@/types/job";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { JobSubmitterHeader } from "./job-submitter-header";
import { JobSubmitterInput } from "./job-submitter-input";
import { useJobSubmitterProvider } from "./provider";
import { useUser } from "@/store/hooks";
import { useSubmitJob } from "@/hooks/use-submit-job";

export const JobSubmitter = () => {
  const router = useRouter();
  const { job_options } = router.query;
  const { user } = useUser();

  const { submitJob, loading, error } = useSubmitJob();
  const { submittedURL, rows, siteMap, setSiteMap } = useJobSubmitterProvider();

  const [jobOptions, setJobOptions] =
    useState<RawJobOptions>(initialJobOptions);

  useEffect(() => {
    if (job_options) {
      parseJobOptions(job_options as string, setJobOptions, setSiteMap);
    }
  }, [job_options]);

  const handleSubmit = async () => {
    await submitJob(submittedURL, rows, user, jobOptions, siteMap, false, null);
  };

  return (
    <div>
      <JobSubmitterHeader />
      <JobSubmitterInput
        urlError={error}
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
