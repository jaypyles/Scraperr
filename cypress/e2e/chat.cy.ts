import { login } from "../utilities/authentication.utils";
import {
  selectJobFromSelector,
  submitBasicJob,
  waitForJobCompletion,
} from "../utilities/job.utilities";
import { mockLogin } from "../utilities/mocks";

describe.only("Chat", () => {
  beforeEach(() => {
    mockLogin();
    login();
    cy.visit("/");
  });

  it.only("should be able to chat", () => {
    const url = "https://books.toscrape.com";
    submitBasicJob(url, "test", "//body");
    waitForJobCompletion(url);

    cy.visit("/chat");
    selectJobFromSelector();

    cy.get("[data-cy='message-input']").type("Hello");
    cy.get("[data-cy='send-message']").click();

    cy.get("[data-cy='ai-message']").should("exist");
  });
});
