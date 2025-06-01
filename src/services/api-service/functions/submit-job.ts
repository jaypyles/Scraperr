import { SiteMap } from "@/types/job";

export const submitJob = async (
  submittedURL: string,
  rows: any[],
  user: any,
  jobOptions: any,
  customHeaders: any,
  customCookies: any,
  siteMap: SiteMap | null,
  agentMode: boolean = false,
  prompt?: string
) => {
  console.log(user);
  return await fetch(`/api/submit-scrape-job`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      data: {
        url: submittedURL,
        elements: rows,
        user: user?.email,
        time_created: new Date().toISOString(),
        job_options: {
          ...jobOptions,
          collect_media: jobOptions.collect_media || false,
          custom_headers: customHeaders || {},
          proxies: jobOptions.proxies ? jobOptions.proxies.split(",") : [],
          site_map: siteMap,
          custom_cookies: customCookies || [],
        },
        agent_mode: agentMode,
        prompt: prompt || "",
      },
    }),
  });
};
