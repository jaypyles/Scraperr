export const cleanUpJobs = () => {
  cy.intercept("POST", "/api/retrieve").as("retrieve");
  cy.visit("/jobs");

  cy.wait("@retrieve", { timeout: 15000 });

  cy.get("tbody tr", { timeout: 20000 }).should("have.length.at.least", 1);

  const tryClickSelectAll = (attempt = 1, maxAttempts = 5) => {
    cy.log(`Attempt ${attempt} to click Select All`);

    cy.get('[data-testid="select-all"]')
      .closest("button")
      .then(($btn) => {
        // Retry if button is disabled
        if ($btn.is(":disabled") || $btn.css("pointer-events") === "none") {
          if (attempt < maxAttempts) {
            cy.wait(1000).then(() =>
              tryClickSelectAll(attempt + 1, maxAttempts)
            );
          } else {
            throw new Error(
              "Select All button is still disabled after max retries"
            );
          }
        } else {
          // Click and then verify if checkbox is checked
          cy.wrap($btn)
            .click({ force: true })
            .then(() => {
              cy.get("tbody tr")
                .first()
                .find("td")
                .first()
                .find("input[type='checkbox']")
                .should("be.checked")
                .then(() => {
                  cy.log("Select All successful");
                });
            });

          // Handle failure case
          cy.on("fail", () => {
            cy.log("Error clicking Select All");
            if (attempt < maxAttempts) {
              cy.wait(1000).then(() =>
                tryClickSelectAll(attempt + 1, maxAttempts)
              );
            } else {
              throw new Error(
                "Checkbox was never checked after clicking Select All"
              );
            }
            return false; // Prevent Cypress from failing the test
          });
        }
      });
  };

  tryClickSelectAll();

  cy.get('[data-testid="DeleteIcon"]', { timeout: 10000 })
    .closest("button")
    .should("not.be.disabled")
    .click();
};
export const submitBasicJob = (url: string, name: string, xpath: string) => {
  cy.get('[data-cy="url-input"]').type(url);
  cy.get('[data-cy="name-field"]').type(name);
  cy.get('[data-cy="xpath-field"]').type(xpath);
  cy.get('[data-cy="add-button"]').click();
  cy.contains("Submit").click();
};

export const waitForJobCompletion = (url: string) => {
  cy.intercept("POST", "/api/retrieve").as("retrieve");

  cy.visit("/jobs");

  cy.wait("@retrieve", { timeout: 30000 });

  cy.contains("div", url, { timeout: 30000 }).should("exist");

  const checkJobStatus = () => {
    cy.get("[data-testid='job-status']", { timeout: 120000 }).then(($el) => {
      const status = $el.text().toLowerCase().trim();

      if (status.includes("completed")) {
        return true;
      } else if (status.includes("scraping") || status.includes("queued")) {
        cy.wait(5000);
        checkJobStatus();
      } else {
        throw new Error(`Unexpected job status: ${status}`);
      }
    });
  };

  checkJobStatus();
};

export const enableMultiPageScraping = () => {
  cy.get("button").contains("Advanced Options").click();
  cy.get('[data-cy="multi-page-toggle"]').click();
  cy.get("body").type("{esc}");
};

export const addCustomHeaders = (headers: Record<string, string>) => {
  cy.get("button").contains("Advanced Options").click();
  cy.get('[name="custom_headers"]').type(JSON.stringify(headers), {
    parseSpecialCharSequences: false,
  });
  cy.get("body").type("{esc}");
};

export const addCustomCookies = (cookies: Record<string, string>) => {
  cy.get("button").contains("Advanced Options").click();
  cy.get('[name="custom_cookies"]').type(JSON.stringify(cookies));
  cy.get("body").type("{esc}");
};

export const openAdvancedJobOptions = () => {
  cy.get("button").contains("Advanced Options").click();
};

export const selectJobFromSelector = () => {
  checkAiDisabled();
  cy.get("div[id='select-job']", { timeout: 10000 }).first().click();
  cy.get("li[role='option']", { timeout: 10000 }).first().click();
};

export const addMedia = () => {
  cy.get('[data-cy="collect-media-checkbox"]').click();
};

export const checkForMedia = () => {
  cy.intercept("GET", "/api/media/get-media?id=**").as("getMedia");

  cy.visit("/media");
  selectJobFromSelector();

  cy.wait("@getMedia", { timeout: 30000 });
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

export const checkAiDisabled = () => {
  cy.getAllLocalStorage().then((result) => {
    const storage = JSON.parse(
      result["http://localhost"]["persist:root"] as string
    );
    const settings = JSON.parse(storage.settings);
    expect(settings.aiEnabled).to.equal(true);
  });
};

export const buildAgentJob = (url: string, prompt: string) => {
  checkAiDisabled();
  enterJobUrl(url);
  cy.get("[data-cy='prompt-input']").type(prompt);
};

export const submitJob = () => {
  cy.get("button").contains("Submit").click();
};

export const enterJobUrl = (url: string) => {
  cy.get('[data-cy="url-input"]').type(url);
};
