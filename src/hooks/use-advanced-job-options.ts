import { useEffect, useState } from "react";

import { parseJobOptions } from "@/lib/helpers/parse-job-options";
import { RawJobOptions } from "@/types";
import { useRouter } from "next/router";

export const useAdvancedJobOptions = () => {
  const initialJobOptions: RawJobOptions = {
    multi_page_scrape: false,
    custom_headers: null,
    proxies: null,
    collect_media: false,
    custom_cookies: null,
    return_html: false,
  };

  const router = useRouter();
  const { job_options, job_id } = router.query;

  const [jobOptions, setJobOptions] =
    useState<RawJobOptions>(initialJobOptions);

  useEffect(() => {
    if (job_options) {
      parseJobOptions(job_id as string, job_options as string, setJobOptions);
    }
  }, [job_options]);

  return { jobOptions, setJobOptions };
};
