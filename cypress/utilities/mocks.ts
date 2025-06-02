export const mockSubmitJob = () => {
  cy.intercept("POST", "/api/submit-scrape-job").as("submitScrapeJob");
};

export const mockToken = () => {
  cy.intercept("POST", "/api/token").as("token");
};

export const mockSignup = () => {
  cy.intercept("POST", "/api/signup").as("signup");
};

export const mockLogin = () => {
  cy.intercept("POST", "/api/token").as("token");
};
