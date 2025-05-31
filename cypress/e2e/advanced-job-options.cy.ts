import { login } from "../utilities/authentication.utils";
import {
  addCustomHeaders,
  addElement,
  addMedia,
  addSiteMapAction,
  checkForMedia,
  cleanUpJobs,
  enterJobUrl,
  openAdvancedJobOptions,
  submitBasicJob,
  submitJob,
  waitForJobCompletion,
} from "../utilities/job.utilities";
import { mockSubmitJob } from "../utilities/mocks";

describe.only("Advanced Job Options", () => {
  beforeEach(() => {
    mockSubmitJob();
    login();
    cy.visit("/");
  });

  afterEach(() => {
    cleanUpJobs();
  });

  it.only("should handle custom headers", () => {
    const customHeaders = {
      "User-Agent": "Test Agent",
      "Accept-Language": "en-US",
    };

    addCustomHeaders(customHeaders);
    submitBasicJob("https://httpbin.org/headers", "headers", "//pre");

    cy.wait("@submitScrapeJob").then((interception) => {
      expect(interception.response?.statusCode).to.eq(200);
      expect(
        interception.request?.body.data.job_options.custom_headers
      ).to.deep.equal(customHeaders);
    });

    waitForJobCompletion("https://httpbin.org/headers");
  });

  it("should handle site map actions", () => {
    addSiteMapAction("click", "//button[contains(text(), 'Load More')]");
    addSiteMapAction("input", "//input[@type='search']", "test search");

    submitBasicJob("https://example.com", "content", "//div[@class='content']");

    cy.wait("@submitScrapeJob").then((interception) => {
      expect(interception.response?.statusCode).to.eq(200);
      const siteMap = interception.request?.body.data.job_options.site_map;
      expect(siteMap.actions).to.have.length(2);
      expect(siteMap.actions[0].type).to.equal("click");
      expect(siteMap.actions[1].type).to.equal("input");
    });

    waitForJobCompletion("https://example.com");
  });

  it("should handle multiple elements", () => {
    enterJobUrl("https://books.toscrape.com");

    addElement("titles", "//h3");
    addElement("prices", "//p[@class='price_color']");

    submitJob();

    cy.wait("@submitScrapeJob").then((interception) => {
      expect(interception.response?.statusCode).to.eq(200);
      expect(interception.request?.body.data.elements).to.have.length(2);
    });

    waitForJobCompletion("https://books.toscrape.com");
  });

  it.only("should handle collecting media", () => {
    enterJobUrl("https://books.toscrape.com");

    openAdvancedJobOptions();
    addMedia();

    cy.get("body").type("{esc}");

    addElement("images", "//img");

    submitJob();

    cy.wait("@submitScrapeJob").then((interception) => {
      expect(interception.response?.statusCode).to.eq(200);
      expect(interception.request?.body.data.job_options.collect_media).to.be
        .true;
    });

    waitForJobCompletion("https://books.toscrape.com");
    checkForMedia();
  });
});
