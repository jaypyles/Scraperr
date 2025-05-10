describe.only("Job", () => {
  it("should create a job", () => {
    cy.visit("/");

    const input = cy.get('[data-cy="url-input"]');
    input.type("https://example.com");

    const nameField = cy.get('[data-cy="name-field"]');
    const xPathField = cy.get('[data-cy="xpath-field"]');
    const addButton = cy.get('[data-cy="add-button"]');

    nameField.type("example");
    xPathField.type("//body");
    addButton.click();

    const submit = cy.contains("Submit");
    submit.click();

    const previousJobs = cy.get("li").contains("Previous Jobs");
    previousJobs.click();

    const jobUrl = cy.get("div").contains("https://example.com");
    jobUrl.should("exist");

    cy.wait(10000);

    const completedJobStatus = cy.get("div").contains("Completed");
    completedJobStatus.should("exist");
  });
});
