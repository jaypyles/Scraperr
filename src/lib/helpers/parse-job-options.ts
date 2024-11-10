import { Dispatch, SetStateAction } from "react";

import { RawJobOptions } from "@/types";

export const parseJobOptions = (
  job_options: string,
  setCustomJSONSelected: Dispatch<SetStateAction<boolean>>,
  setProxiesSelected: Dispatch<SetStateAction<boolean>>,
  setJobOptions: Dispatch<SetStateAction<RawJobOptions>>
) => {
  if (job_options) {
    const jsonOptions = JSON.parse(job_options as string);
    const newJobOptions: RawJobOptions = {
      multi_page_scrape: false,
      custom_headers: null,
      proxies: null,
    };

    if (
      jsonOptions.custom_headers &&
      Object.keys(jsonOptions.custom_headers).length
    ) {
      setCustomJSONSelected(true);
      newJobOptions.custom_headers = JSON.stringify(jsonOptions.custom_headers);
    }

    newJobOptions.multi_page_scrape = jsonOptions.multi_page_scrape;

    if (jsonOptions.proxies) {
      setProxiesSelected(true);
      newJobOptions.proxies = jsonOptions.proxies.join(",");
    }

    setJobOptions(newJobOptions);
  }
};
