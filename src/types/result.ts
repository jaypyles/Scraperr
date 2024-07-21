interface ScrapeResult {
  xpath: string;
  text: string;
  name: string;
}

export type Result = {
  [key: string]: ScrapeResult[];
};
