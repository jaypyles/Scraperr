describe("Authentication", () => {
  it("should register", () => {
    cy.intercept("POST", "/api/signup").as("signup");

    cy.visit("/").then(() => {
      cy.get("button").contains("Login").click();
      cy.url().should("include", "/login");

      cy.get("form").should("be.visible");
      cy.get("button")
        .contains("No Account? Sign up")
        .should("be.visible")
        .click();

      cy.get("input[name='email']").type("test@test.com");
      cy.get("input[name='password']").type("password");
      cy.get("input[name='fullName']").type("John Doe");
      cy.get("button[type='submit']").contains("Signup").click();

      cy.wait("@signup").then((interception) => {
        if (!interception.response) {
          cy.log("No response received!");
          throw new Error("signup request did not return a response");
        }

        cy.log("Response status: " + interception.response.statusCode);
        cy.log("Response body: " + JSON.stringify(interception.response.body));

        expect(interception.response.statusCode).to.eq(200);
      });
    });
  });

  it("should login", () => {
    cy.intercept("POST", "/api/token").as("token");

    cy.visit("/").then(() => {
      cy.get("button")
        .contains("Login")
        .click()
        .then(() => {
          cy.get("input[name='email']").type("test@test.com");
          cy.get("input[name='password']").type("password");
          cy.get("button[type='submit']").contains("Login").click();

          cy.wait("@token").then((interception) => {
            if (!interception.response) {
              cy.log("No response received!");
              throw new Error("token request did not return a response");
            }

            cy.log("Response status: " + interception.response.statusCode);
            cy.log("Response body: " + JSON.stringify(interception.response.body));

            expect(interception.response.statusCode).to.eq(200);
          });
        });
    });
  });
});
