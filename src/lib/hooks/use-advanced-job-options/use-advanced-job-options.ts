import { useEffect, useState } from "react";

import { RawJobOptions } from "@/types";
import { parseJobOptions } from "@/lib/helpers/parse-job-options";
import { useRouter } from "next/router";

export const useAdvancedJobOptions = () => {
  const initialJobOptions: RawJobOptions = {
    multi_page_scrape: false,
    custom_headers: null,
    proxies: null,
    collect_media: false,
    custom_cookies: null,
  };

  const router = useRouter();
  const { job_options } = router.query;

  const [jobOptions, setJobOptions] =
    useState<RawJobOptions>(initialJobOptions);

  useEffect(() => {
    if (job_options) {
      parseJobOptions(job_options as string, setJobOptions);
    }
  }, [job_options]);

  return { jobOptions, setJobOptions };
};
