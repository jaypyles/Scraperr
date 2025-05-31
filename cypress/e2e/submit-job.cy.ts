import { login } from "../utilities/authentication.utils";
import {
  addElement,
  cleanUpJobs,
  enterJobUrl,
  submitJob,
  waitForJobCompletion,
} from "../utilities/job.utilities";
import { mockSubmitJob } from "../utilities/mocks";

describe.only("Job", () => {
  beforeEach(() => {
    mockSubmitJob();
    login();
    cy.visit("/");
  });

  afterEach(() => {
    cleanUpJobs();
  });

  it("should create a job", () => {
    enterJobUrl("https://books.toscrape.com");
    addElement("body", "//body");
    submitJob();

    cy.wait("@submitScrapeJob").then((interception) => {
      if (!interception.response) {
        throw new Error("submitScrapeJob request did not return a response");
      }

      expect(interception.response.statusCode).to.eq(200);
    });

    waitForJobCompletion("https://books.toscrape.com");
  });
});
