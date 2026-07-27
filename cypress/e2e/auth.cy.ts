describe("Authentication", () => {
  const email = "cypress@test.com";
  const password = "TestPassword123!";

  beforeEach(() => {
    cy.visit("/login");
  });

  it("opens the login page successfully", () => {
    cy.url().should("include", "/login");

    cy.get('input[type="email"]')
      .should("be.visible");

    cy.get('input[type="password"]')
      .should("be.visible");
  });

  it("rejects invalid credentials", () => {
    cy.get('input[type="email"]')
      .should("be.visible")
      .clear()
      .type(email);

    cy.get('input[type="password"]')
      .should("be.visible")
      .clear()
      .type("WrongPassword123!");

    cy.contains("button", /sign in|login/i)
      .should("be.visible")
      .click();

    cy.url().should("include", "/login");

    cy.get('input[type="email"]')
      .should("be.visible");

    cy.get('input[type="password"]')
      .should("be.visible");
  });

  it("logs in successfully with valid credentials", () => {
    cy.intercept(
      "POST",
      "**/api/auth/callback/credentials**"
    ).as("credentialsLogin");

    cy.get('input[type="email"]')
      .should("be.visible")
      .clear()
      .type(email);

    cy.get('input[type="password"]')
      .should("be.visible")
      .clear()
      .type(password);

    cy.contains("button", /sign in|login/i)
      .should("be.visible")
      .click();

    cy.wait("@credentialsLogin", { timeout: 10000 })
      .then((interception) => {
        expect(interception.response?.statusCode).to.be.oneOf([
          200,
          302,
        ]);
      });

    cy.url({ timeout: 10000 })
      .should("include", "/dashboard");

    cy.contains("Tasks")
      .should("be.visible");
  });

  it("redirects unauthenticated users away from dashboard", () => {
    cy.visit("/dashboard");

    cy.url({ timeout: 10000 })
      .should("include", "/login");
  });
});
