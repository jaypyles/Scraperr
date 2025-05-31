// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import "./commands";

// Alternatively you can use CommonJS syntax:
// require('./commands')

before(() => {
  cy.request({
    method: "POST",
    url: "/api/signup",
    body: {
      email: "test@test.com",
      password: "password",
      fullName: "John Doe",
    },
    failOnStatusCode: false,
  }).then((response) => {
    if (response.status !== 200 && response.status !== 201) {
      console.warn("Signup failed:", response.status, response.body);
    }
  });
});
