export const cleanUpJobs = () => {
  const maxRetries = 3;
  let retryCount = 0;

  const attemptCleanup = () => {
    cy.intercept("POST", "/api/retrieve").as("retrieve");

    cy.visit("/jobs");

    cy.wait("@retrieve", { timeout: 10000 }).then((interception) => {
      if (!interception.response) {
        cy.log("No response received!");
        throw new Error("retrieve request did not return a response");
      }
    });

    cy.get("tbody tr").should("have.length", 1);

    cy.get('[data-testid="select-all"]').click();
    cy.get("[data-testid='DeleteIcon']", { timeout: 10000 }).click();
  };

  const retry = () => {
    if (retryCount < maxRetries) {
      retryCount++;
      cy.log(`Retry attempt ${retryCount} of ${maxRetries}`);
      attemptCleanup();
    } else {
      cy.log("Max retries reached. Cleanup failed.");
    }
  };

  attemptCleanup();
  cy.on("fail", () => {
    retry();
    return false;
  });
};

export const submitBasicJob = (url: string, name: string, xpath: string) => {
  cy.get('[data-cy="url-input"]').type(url);
  cy.get('[data-cy="name-field"]').type(name);
  cy.get('[data-cy="xpath-field"]').type(xpath);
  cy.get('[data-cy="add-button"]').click();
  cy.contains("Submit").click();
};

export const waitForJobCompletion = (url: string) => {
  cy.visit("/jobs");
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

export const openAdvancedJobOptions = () => {
  cy.get("button").contains("Advanced Job Options").click();
};

export const selectJobFromSelector = () => {
  cy.get("div[id='select-job']").click();
  cy.get("li[role='option']").click();
};

export const addMedia = () => {
  cy.get('[data-cy="collect-media-checkbox"]').click();
};

export const checkForMedia = () => {
  cy.visit("/media");
  selectJobFromSelector();
  cy.get("[data-testid='media-grid']", { timeout: 10000 }).should("exist");
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

export const addElement = (name: string, xpath: string) => {
  cy.get('[data-cy="name-field"]').type(name);
  cy.get('[data-cy="xpath-field"]').type(xpath);
  cy.get('[data-cy="add-button"]').click();
};

export const buildAgentJob = (url: string, prompt: string) => {
  enterJobUrl(url);
  cy.get("[data-cy='prompt-input']").type(prompt);
};

export const submitJob = () => {
  cy.get("button").contains("Submit").click();
};

export const enterJobUrl = (url: string) => {
  cy.get('[data-cy="url-input"]').type(url);
};
