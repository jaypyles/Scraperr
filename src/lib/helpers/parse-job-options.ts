import { Dispatch, SetStateAction } from "react";

import { RawJobOptions, SiteMap } from "@/types";

export const parseJobOptions = (
  id: string,
  job_options: string,
  setJobOptions: Dispatch<SetStateAction<RawJobOptions>>,
  setSiteMap?: Dispatch<SetStateAction<SiteMap | null>>,
  setJobId?: Dispatch<SetStateAction<string>>
) => {
  if (job_options) {
    const jsonOptions = JSON.parse(job_options as string);
    const newJobOptions: RawJobOptions = {
      multi_page_scrape: false,
      custom_headers: null,
      proxies: null,
      collect_media: false,
      custom_cookies: null,
      return_html: false,
    };

    if (jsonOptions.collect_media) {
      newJobOptions.collect_media = true;
    }

    if (
      jsonOptions.custom_headers &&
      Object.keys(jsonOptions.custom_headers).length
    ) {
      newJobOptions.custom_headers = jsonOptions.custom_headers;
    }

    if (jsonOptions.custom_cookies && jsonOptions.custom_cookies.length > 0) {
      newJobOptions.custom_cookies = jsonOptions.custom_cookies;
    }

    newJobOptions.multi_page_scrape = jsonOptions.multi_page_scrape;

    if (jsonOptions.proxies.length > 0) {
      newJobOptions.proxies = jsonOptions.proxies.join(",");
    }

    if (jsonOptions.site_map && setSiteMap) {
      setSiteMap(jsonOptions.site_map);
    }

    if (jsonOptions.return_html) {
      newJobOptions.return_html = true;
    }

    if (id && setJobId) {
      setJobId(id);
    }

    setJobOptions(newJobOptions);
  }
};
