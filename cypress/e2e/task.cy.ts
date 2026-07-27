describe("Task Management", () => {
  const email = "cypress@test.com";
  const password = "TestPassword123!";

  /**
   * Login once and reuse the session between tests.
   */
  const login = () => {
    cy.session(
      "cypress-user",
      () => {
        cy.visit("/login");

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

        cy.url()
          .should("not.include", "/login")
          .and("include", "/dashboard");
      },
      {
        validate() {
          cy.request({
            method: "GET",
            url: "/api/auth/session",
          }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body?.user).to.exist;
          });
        },
      },
    );
  };

  /**
   * Open dashboard and verify that the Tasks section exists.
   */
  const visitDashboard = () => {
    cy.visit("/dashboard");

    cy.url()
      .should("include", "/dashboard");

    cy.contains("Tasks")
      .should("be.visible");
  };

  /**
   * Delete all Cypress-created tasks.
   *
   * This keeps tests independent from each other.
   */
  const cleanupCypressTasks = () => {
    cy.request({
      method: "GET",
      url: "/api/task",
      failOnStatusCode: false,
    }).then((response) => {
      if (response.status !== 200) {
        return;
      }

      const body = response.body;

      const tasks = Array.isArray(body)
        ? body
        : Array.isArray(body?.tasks)
          ? body.tasks
          : [];

      tasks
        .filter(
          (task: { title?: string }) =>
            typeof task.title === "string" &&
            task.title.startsWith("Cypress Test"),
        )
        .forEach((task: { id: number }) => {
          cy.request({
            method: "DELETE",
            url: "/api/task",
            body: {
              id: task.id,
            },
            failOnStatusCode: false,
          });
        });
    });
  };

  /**
   * Create a task through the UI.
   */
  const createTaskThroughUI = (
    title: string,
    description = "Created by Cypress",
  ) => {
    /*
     * Open Create New Task dialog.
     *
     * The selector intentionally supports several possible
     * button texts used by the UI.
     */
    cy.contains(
      "button",
      /add task|new task|create task|\+/i,
    )
      .filter(":visible")
      .last()
      .should("be.visible")
      .click();

    /*
     * Make sure the dialog is open.
     */
    cy.contains(
      "h2",
      /create new task|new task/i,
    )
      .should("be.visible");

    /*
     * Task title.
     */
    cy.get(
      'input[placeholder="e.g. Draft product spec"]',
    )
      .should("be.visible")
      .clear()
      .type(title);

    /*
     * Description.
     */
    cy.get(
      'textarea[placeholder="Optional details..."]',
    )
      .should("be.visible")
      .clear()
      .type(description);

    /*
     * Submit.
     *
     * We use button[type="submit"] instead of button text
     * because the actual text may be Create / Save / Add Task.
     */
    cy.get('button[type="submit"]')
      .filter(":visible")
      .last()
      .should("be.visible")
      .click();

    /*
     * Wait for dialog to close.
     */
    cy.contains(
      "h2",
      /create new task|new task/i,
    )
      .should("not.exist");

    /*
     * Verify task appears.
     */
    cy.contains(title)
      .should("be.visible");
  };

  beforeEach(() => {
    login();
    visitDashboard();
  });

  afterEach(() => {
    /*
     * Remove Cypress test data after every test.
     */
    cleanupCypressTasks();
  });

  // =========================================================
  // 1. Dashboard
  // =========================================================

  it("opens OnTrack successfully after login", () => {
    cy.contains("Tasks")
      .should("be.visible");

    cy.contains("Total Tasks")
      .should("be.visible");
  });

  // =========================================================
  // 2. Create Task
  // =========================================================

  it("creates a new task successfully", () => {
    const taskTitle = "Cypress Test Create Task";

    createTaskThroughUI(
      taskTitle,
      "Created by Cypress",
    );

    /*
     * Verify task exists in backend.
     */
    cy.request("GET", "/api/task").then((response) => {
      expect(response.status).to.eq(200);

      const body = response.body;

      const tasks = Array.isArray(body)
        ? body
        : Array.isArray(body?.tasks)
          ? body.tasks
          : [];

      expect(
        tasks.some(
          (task: { title?: string }) =>
            task.title === taskTitle,
        ),
      ).to.eq(true);
    });
  });

  // =========================================================
  // 3. Edit Task
  // =========================================================

  it("edits an existing task successfully", () => {
    const originalTitle = "Cypress Test Edit Task";
    const editedTitle = "Cypress Test Edited Task";

    /*
     * Create test data through API.
     *
     * This makes the test independent from the
     * create-task test.
     */
    cy.request({
      method: "POST",
      url: "/api/task",
      body: {
        title: originalTitle,
        description: "Created for edit test",
        status: "TODO",
        startAt: new Date(
          "2026-07-27T00:00:00.000Z",
        ).toISOString(),
        endAt: new Date(
          "2026-07-27T00:00:00.000Z",
        ).toISOString(),
        isAllDay: false,
        categoryId: null,
      },
    }).then((response) => {
      expect(response.status).to.be.oneOf([
        200,
        201,
      ]);
    });

    /*
     * Reload dashboard so the task appears.
     */
    cy.reload();

    /*
     * Open the task.
     */
    cy.contains(originalTitle)
      .should("be.visible")
      .click();

    /*
     * Edit dialog must be visible.
     */
    cy.contains("h2", /edit task/i)
      .should("be.visible");

    /*
     * Change title.
     */
    cy.get(
      'input[placeholder="e.g. Draft product spec"]',
    )
      .should("be.visible")
      .clear()
      .type(editedTitle);

    /*
     * Change description.
     */
    cy.get(
      'textarea[placeholder="Optional details..."]',
    )
      .should("be.visible")
      .clear()
      .type("Updated by Cypress");

    /*
     * Save.
     *
     * Do NOT search for "Save" or "Update" text.
     * The submit button is more stable.
     */
    cy.get('button[type="submit"]')
      .filter(":visible")
      .last()
      .should("be.visible")
      .click();

    /*
     * Dialog should close.
     */
    cy.contains("h2", /edit task/i)
      .should("not.exist");

    /*
     * Edited task should appear.
     */
    cy.contains(editedTitle)
      .should("be.visible");

    /*
     * Verify backend.
     */
    cy.request("GET", "/api/task").then((response) => {
      expect(response.status).to.eq(200);

      const body = response.body;

      const tasks = Array.isArray(body)
        ? body
        : Array.isArray(body?.tasks)
          ? body.tasks
          : [];

      const editedTask = tasks.find(
        (task: { title?: string }) =>
          task.title === editedTitle,
      );

      expect(editedTask).to.exist;

      expect(editedTask.description).to.eq(
        "Updated by Cypress",
      );
    });
  });

  // =========================================================
  // 4. Delete Task
  // =========================================================

  it("deletes an existing task successfully", () => {
    const taskTitle = "Cypress Test Delete Task";

    /*
     * Create a known task through API.
     */
    cy.request({
      method: "POST",
      url: "/api/task",
      body: {
        title: taskTitle,
        description: "Created for delete test",
        status: "TODO",
        startAt: new Date(
          "2026-07-27T00:00:00.000Z",
        ).toISOString(),
        endAt: new Date(
          "2026-07-27T00:00:00.000Z",
        ).toISOString(),
        isAllDay: false,
        categoryId: null,
      },
    }).then((response) => {
      expect(response.status).to.be.oneOf([
        200,
        201,
      ]);
    });

    /*
     * Reload dashboard.
     */
    cy.reload();

    /*
     * Open task.
     */
    cy.contains(taskTitle)
      .should("be.visible")
      .click();

    /*
     * Make sure Edit Task dialog is open.
     */
    cy.contains("h2", /edit task/i)
      .should("be.visible");

    /*
     * IMPORTANT:
     *
     * Do NOT use:
     *
     * cy.contains("button", /delete/i)
     *
     * globally.
     *
     * Because the task itself is named:
     *
     * "Cypress Test Delete Task"
     *
     * Cypress could accidentally find the task button
     * instead of the actual Delete button.
     *
     * We therefore scope the search to the dialog.
     */
    cy.get('[role="dialog"]')
      .filter(":visible")
      .last()
      .within(() => {
        cy.contains(
          "button",
          /^delete$/i,
        )
          .should("be.visible")
          .click({ force: true });
      });

    /*
     * The current useTaskDialog implementation calls:
     *
     * onDelete(task.id)
     *
     * and closes the dialog directly.
     *
     * There is NO AlertDialog confirmation.
     *
     * Therefore we should NOT wait for:
     *
     * [role="alertdialog"]
     */

    /*
     * Edit dialog should close.
     */
    cy.contains("h2", /edit task/i)
      .should("not.exist");

    /*
     * Deleted task should disappear.
     */
    cy.contains(taskTitle)
      .should("not.exist");

    /*
     * Verify deletion in backend.
     */
    cy.request("GET", "/api/task").then((response) => {
      expect(response.status).to.eq(200);

      const body = response.body;

      const tasks = Array.isArray(body)
        ? body
        : Array.isArray(body?.tasks)
          ? body.tasks
          : [];

      expect(
        tasks.some(
          (task: { title?: string }) =>
            task.title === taskTitle,
        ),
      ).to.eq(false);
    });
  });
});