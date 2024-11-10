import { Constants } from "@/lib";

export const submitJob = async (
  submittedURL: string,
  rows: any[],
  user: any,
  jobOptions: any,
  customHeaders: any
) => {
  return await fetch(`${Constants.DOMAIN}/api/submit-scrape-job`, {
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
        proxies: jobOptions.proxies ? jobOptions.proxies.split(",") : [],
      },
    }),
  });
};
