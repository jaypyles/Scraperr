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

    cy.get("li").contains("Previous Jobs").click();

    cy.contains("div", "https://example.com", { timeout: 10000 }).should(
      "exist"
    );
    cy.contains("div", "Completed", { timeout: 20000 }).should("exist");
  });
});
