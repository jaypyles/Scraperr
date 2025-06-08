import { Message } from "./message";

export interface Job {
  id: string;
  url: string;
  elements: Object[];
  result: Object;
  time_created: Date;
  status: string;
  job_options: RawJobOptions;
  favorite: boolean;
  chat?: Message[];
  agent_mode?: boolean;
  prompt?: string;
}

export type JobOptions = {
  multi_page_scrape: boolean;
  custom_headers: null | string;
  proxies: string[];
  site_map?: SiteMap;
};

export type RawJobOptions = {
  multi_page_scrape: boolean;
  custom_headers: string | null;
  proxies: string | null;
  collect_media: boolean;
  custom_cookies: string | null;
  return_html: boolean;
};

export type ActionOption = "click" | "input";

export type Action = {
  type: ActionOption;
  xpath: string;
  name: string;
  do_once?: boolean;
  input?: string;
};

export type SiteMap = {
  actions: Action[];
};

export type CronJob = {
  id: string;
  user_email: string;
  job_id: string;
  cron_expression: string;
  time_created: Date;
  time_updated: Date;
};

export const initialJobOptions: RawJobOptions = {
  multi_page_scrape: false,
  custom_headers: null,
  proxies: null,
  collect_media: false,
  custom_cookies: null,
  return_html: false,
};

export const COLOR_MAP: Record<string, string> = {
  Queued: "rgba(255,201,5,0.25)",
  Scraping: "rgba(3,104,255,0.25)",
  Completed: "rgba(5,255,51,0.25)",
  Failed: "rgba(214,0,25,0.25)",
};
