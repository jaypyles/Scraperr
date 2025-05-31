import { login } from "../utilities/authentication.utils";
import { cleanUpJobs } from "../utilities/job.utilities";

describe.only("Agent", () => {
  it("should be able to scrape some data", () => {
    login();

    cy.visit("/agent");

    cy.get("[data-cy='url-input']").type("https://books.toscrape.com");
    cy.get("[data-cy='prompt-input']").type(
      "Collect all the links on the page"
    );

    cy.get("button").contains("Submit").click();

    cy.visit("/jobs");

    cy.contains("div", "https://books.toscrape.com", { timeout: 10000 }).should(
      "exist"
    );

    cy.contains("div", "Completed", { timeout: 20000 }).should("exist");

    cleanUpJobs();
  });
});
