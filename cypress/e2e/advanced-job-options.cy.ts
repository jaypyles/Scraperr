import { login } from "../utilities/authentication.utils";
import {
  addCustomHeaders,
  addSiteMapAction,
  cleanUpJobs,
  mockSubmitJob,
  submitBasicJob,
  waitForJobCompletion,
} from "../utilities/job.utilities";

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

    cy.get("li").contains("Jobs").click();
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

    cy.get("li").contains("Jobs").click();
    waitForJobCompletion("https://example.com");
  });

  it("should handle multiple elements", () => {
    cy.get('[data-cy="url-input"]').type("https://books.toscrape.com");
    cy.get('[data-cy="name-field"]').type("titles");
    cy.get('[data-cy="xpath-field"]').type("//h3");
    cy.get('[data-cy="add-button"]').click();

    cy.get('[data-cy="name-field"]').type("prices");
    cy.get('[data-cy="xpath-field"]').type("//p[@class='price_color']");
    cy.get('[data-cy="add-button"]').click();

    cy.contains("Submit").click();

    cy.wait("@submitScrapeJob").then((interception) => {
      expect(interception.response?.statusCode).to.eq(200);
      expect(interception.request?.body.data.elements).to.have.length(2);
    });

    cy.get("li").contains("Jobs").click();
    waitForJobCompletion("https://books.toscrape.com");
  });
});
