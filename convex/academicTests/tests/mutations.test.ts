import type {
  InsertAssessmentSchemaValidator,
  InsertAssessmentComponentValidator,
} from "#academicTests/validators";
import { test } from "#test.setup";
import { api } from "#_generated/api";
import { addAssessmentComponent } from "#academicTests/mutations";
import { ConvexError } from "convex/values";
describe("academicTests.createAssessmentSchema", () => {
  const mockAssessmentSchema: InsertAssessmentSchemaValidator = {
    name: "CIE1",
    description: "This is internal test 1",
  };

  test("should create assessment schema", async ({ t }) => {
    const assessmentSchemaId = await t.mutation(
      api.academicTests.mutations.createAssessmentSchema,
      mockAssessmentSchema,
    );

    const assessmentSchema = await t.run((c) => c.db.get(assessmentSchemaId));

    expect(assessmentSchema).toMatchObject(mockAssessmentSchema);
  });
});

describe("academicTests.addAssessmentComponent", () => {
  const mockAssessmentSchema: InsertAssessmentSchemaValidator = {
    name: "CIE1",
    description: "This is internal test 1",
  };

  const mockAssessmentComponents: InsertAssessmentComponentValidator["body"][] =
    [
      {
        name: "Written Test",
        passingMarks: 10,
        totalAllotedMarks: 20,
      },
      {
        name: "Written Test1",
        passingMarks: 5,
        totalAllotedMarks: 10,
      },
      {
        name: "Written Test2",
        passingMarks: 8,
        totalAllotedMarks: 16,
      },
    ];

  test("should create components in right order", async ({ t }) => {
    // Insert assessment schema
    const assessmentSchemaId = await t.run((c) =>
      c.db.insert("assessmentSchemas", {
        ...mockAssessmentSchema,
        createdAt: Date.now(),
      }),
    );

    await Promise.all(
      mockAssessmentComponents.map((component) =>
        t.mutation(api.academicTests.mutations.addAssessmentComponent, {
          body: component,
          assessmentSchemaId,
        }),
      ),
    );

    const assessmentComponents = await t.run((c) =>
      c.db.query("assessmentComponents").collect(),
    );

    expect(assessmentComponents).toMatchObject(
      mockAssessmentComponents.map((mac, orderIdx) => ({ ...mac, orderIdx })),
    );
  });
test("should not allow user to create component with the same name", async ({ t }) => {
  const assessmentSchemaId = await t.run((c) =>
    c.db.insert("assessmentSchemas", {
      ...mockAssessmentSchema,
      createdAt: Date.now(),
    }),
  );

  // Insert all components
  for (const component of mockAssessmentComponents) {
    await t.mutation(api.academicTests.mutations.addAssessmentComponent, {
      body: component,
      assessmentSchemaId,
    });
  }
  // Store the initial value
  const upperCaseName = mockAssessmentComponents[0].name.toUpperCase();

  const upperCaseAssessmentComponent = t.mutation(api.academicTests.mutations.addAssessmentComponent,{
    body:{
      name:upperCaseName,
      passingMarks:5,
      totalAllotedMarks:10
      },
      assessmentSchemaId
  })
  await expect (upperCaseAssessmentComponent).rejects.toMatchObject({data:"Component with this name alredy exists"})

  const lowerCaseName = mockAssessmentComponents[0].name.toUpperCase();

  const lowerCaseAssessmentComponent = t.mutation(api.academicTests.mutations.addAssessmentComponent,{
    body:{
      name:lowerCaseName,
      passingMarks:5,
      totalAllotedMarks:10
      },
      assessmentSchemaId
  })
  await expect (lowerCaseAssessmentComponent).rejects.toMatchObject({data:"Component with this name alredy exists"})
});
});
