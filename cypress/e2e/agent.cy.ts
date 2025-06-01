import { login } from "../utilities/authentication.utils";
import {
  buildAgentJob,
  cleanUpJobs,
  submitJob,
  waitForJobCompletion,
} from "../utilities/job.utilities";
import { mockSubmitJob } from "../utilities/mocks";

describe.only("Agent", () => {
  beforeEach(() => {
    mockSubmitJob();
    login();
    cy.visit("/agent");
  });

  afterEach(() => {
    cleanUpJobs();
  });

  it("should be able to scrape some data", () => {
    const url = "https://books.toscrape.com";
    const prompt = "Collect all the links on the page";
    buildAgentJob(url, prompt);

    submitJob();

    cy.wait("@submitScrapeJob").then((interception) => {
      expect(interception.response?.statusCode).to.eq(200);
      expect(interception.request?.body.data.url).to.eq(url);
      expect(interception.request?.body.data.prompt).to.eq(prompt);
    });

    waitForJobCompletion("https://books.toscrape.com");
  });
});
