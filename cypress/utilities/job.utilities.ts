export const cleanUpJobs = () => {
  cy.get("tbody tr")
    .first()
    .within(() => {
      cy.get('input[type="checkbox"]').click();
    });

  cy.get("[data-testid='DeleteIcon']").click();
};

export const submitBasicJob = (url: string, name: string, xpath: string) => {
  cy.get('[data-cy="url-input"]').type(url);
  cy.get('[data-cy="name-field"]').type(name);
  cy.get('[data-cy="xpath-field"]').type(xpath);
  cy.get('[data-cy="add-button"]').click();
  cy.contains("Submit").click();
};

export const waitForJobCompletion = (url: string) => {
  cy.contains("div", url, { timeout: 10000 }).should("exist");
  cy.contains("div", "Completed", { timeout: 20000 }).should("exist");
};

export const enableMultiPageScraping = () => {
  cy.get("button").contains("Advanced Job Options").click();
  cy.get('[data-cy="multi-page-toggle"]').click();
  cy.get("body").type("{esc}");
};

export const addCustomHeaders = (headers: Record<string, string>) => {
  cy.get("button").contains("Advanced Job Options").click();
  cy.get('[name="custom_headers"]').type(JSON.stringify(headers), {
    parseSpecialCharSequences: false,
  });
  cy.get("body").type("{esc}");
};

export const addCustomCookies = (cookies: Record<string, string>) => {
  cy.get("button").contains("Advanced Job Options").click();
  cy.get('[name="custom_cookies"]').type(JSON.stringify(cookies));
  cy.get("body").type("{esc}");
};

export const addSiteMapAction = (
  type: "click" | "input",
  xpath: string,
  input?: string
) => {
  cy.get("button").contains("Create Site Map").click();
  cy.get('[data-cy="site-map-select"]').select(type);
  cy.get('[data-cy="site-map-xpath"]').type(xpath);
  if (type === "input" && input) {
    cy.get('[data-cy="site-map-input"]').type(input);
  }
  cy.get('[data-cy="add-site-map-action"]').click();
};
