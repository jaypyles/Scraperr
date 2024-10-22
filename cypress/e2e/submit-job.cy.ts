describe("Job", () => {
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
  });
});
