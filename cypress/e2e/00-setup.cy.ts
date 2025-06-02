describe("Global setup", () => {
  it("signs up user once", () => {
    cy.request({
      method: "POST",
      url: "/api/signup",
      body: JSON.stringify({
        data: {
          email: "test@test.com",
          password: "password",
          full_name: "John Doe",
        },
      }),
      headers: {
        "Content-Type": "application/json",
      },
      failOnStatusCode: false,
    }).then((response) => {
      if (response.status !== 200 && response.status !== 201) {
        console.warn("Signup failed:", response.status, response.body);
      }
    });
  });
});
