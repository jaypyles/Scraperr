import { Message } from "./message";

export interface Job {
  id: string;
  url: string;
  elements: Object[];
  result: Object;
  time_created: Date;
  status: string;
  job_options: Object;
  favorite: boolean;
  chat?: Message[];
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
