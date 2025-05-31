export const cleanUpJobs = () => {
  cy.get("tbody tr")
    .first()
    .within(() => {
      cy.get('input[type="checkbox"]').click();
    });

  cy.get("[data-testid='DeleteIcon']").click();
};
