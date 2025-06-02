import { faker } from "@faker-js/faker";
import { mockLogin, mockSignup } from "../utilities/mocks";

const mockEmail = faker.internet.email();
const mockPassword = faker.internet.password();

describe.only("Authentication", () => {
  beforeEach(() => {
    cy.visit("/");
    mockSignup();
    mockLogin();
  });

  it("should register", () => {
    cy.get("button").contains("Login").click();
    cy.url().should("include", "/login");

    cy.get("form").should("be.visible");

    cy.get("button")
      .contains("No Account? Sign up")
      .should("be.visible")
      .click();

    cy.get("input[name='email']").type(mockEmail);
    cy.get("input[name='password']").type(mockPassword);
    cy.get("input[name='fullName']").type(faker.person.fullName());
    cy.get("button[type='submit']").contains("Signup").click();

    cy.wait("@signup").then((interception) => {
      if (!interception.response) {
        throw new Error("signup request did not return a response");
      }

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
        cy.get("input[name='email']").type(mockEmail);
        cy.get("input[name='password']").type(mockPassword);
        cy.get("button[type='submit']").contains("Login").click();

        cy.wait("@token").then((interception) => {
          if (!interception.response) {
            throw new Error("token request did not return a response");
          }

          expect(interception.response.statusCode).to.eq(200);
        });
      });
  });
});
