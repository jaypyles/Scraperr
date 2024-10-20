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
};
