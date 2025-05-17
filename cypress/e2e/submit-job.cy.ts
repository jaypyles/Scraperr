describe.only("Job", () => {
  it("should create a job", () => {
    cy.intercept("POST", "/api/submit-scrape-job").as("submitScrapeJob");

    cy.visit("/");

    cy.get('[data-cy="url-input"]').type("https://example.com");
    cy.get('[data-cy="name-field"]').type("example");
    cy.get('[data-cy="xpath-field"]').type("//body");
    cy.get('[data-cy="add-button"]').click();

    cy.contains("Submit").click();

    cy.wait("@submitScrapeJob").then((interception) => {
      if (!interception.response) {
        cy.log("No response received!");
        cy.log("Request body: " + JSON.stringify(interception.request?.body));
        throw new Error("submitScrapeJob request did not return a response");
      }

      cy.log("Response status: " + interception.response.statusCode);
      cy.log("Response body: " + JSON.stringify(interception.response.body));

      expect(interception.response.statusCode).to.eq(200);
    });

    cy.get("li").contains("Jobs").click();

    cy.contains("div", "https://example.com", { timeout: 10000 }).should(
      "exist"
    );
    cy.contains("div", "Completed", { timeout: 20000 }).should("exist");

    cy.get("tbody tr")
      .first()
      .within(() => {
        cy.get('input[type="checkbox"]').click();
      });

    cy.get("[data-testid='DeleteIcon']").click();

    cy.contains("div", "https://example.com", { timeout: 10000 }).should(
      "not.exist"
    );
  });

  it("should create a job with advanced options (media)", () => {
    cy.intercept("POST", "/api/submit-scrape-job").as("submitScrapeJob");

    cy.visit("/");

    cy.get("button").contains("Advanced Job Options").click();

    cy.get('[data-cy="collect-media-checkbox"]').click();
    cy.get("body").type("{esc}");

    cy.get('[data-cy="url-input"]').type("https://books.toscrape.com");
    cy.get('[data-cy="name-field"]').type("example");
    cy.get('[data-cy="xpath-field"]').type("//body");
    cy.get('[data-cy="add-button"]').click();

    cy.get("button").contains("Submit").click();

    cy.get("li").contains("Jobs").click();

    cy.contains("div", "https://books.toscrape.com", { timeout: 10000 }).should(
      "exist"
    );

    cy.contains("div", "Completed", { timeout: 20000 }).should("exist");
    cy.get("li").contains("Media").click();

    cy.get("div[id='select-job']").click();
    cy.get("li[role='option']").click();

    cy.get("[data-testid='media-grid']", { timeout: 10000 }).should("exist");

    cy.get("li").contains("Jobs").click();

    cy.get("tbody tr")
      .first()
      .within(() => {
        cy.get('input[type="checkbox"]').click();
      });

    cy.get("[data-testid='DeleteIcon']").click();
  });
});
