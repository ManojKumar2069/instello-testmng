import { Doc, Id } from "#_generated/dataModel";
import { DbWriter } from "#helpers/types";
import { ConvexError } from "convex/values";
import { isQualifiedName } from "typescript";

/** Create assessment component*/
export async function create(
  db: DbWriter,
  assessmentSchemaId: Id<"assessmentSchemas">,
  body: Pick<
    Doc<"assessmentComponents">,
    "name" | "totalAllotedMarks" | "passingMarks"
  >,
) {
  const exists= await db.query("assessmentComponents").withIndex("by_normalizedName",(q)=> q.eq("normalizedName",body.name.toLowerCase())).first();
  if(exists)
    throw new ConvexError("Component with this name alredy exists");

  const latest = await db
    .query("assessmentComponents")
    .withIndex("by_assessmentSchema_orderIdx", (q) =>
      q.eq("assessmentSchemaId", assessmentSchemaId),
    )
    .order("desc")
    .first();

  const nextOrderIdx = latest ? latest.orderIdx + 1 : 0;

  return await db.insert("assessmentComponents", {
    ...body,
    normalizedName:body.name.toLowerCase(),
    assessmentSchemaId,
    createdAt: Date.now(),
    orderIdx: nextOrderIdx,
  });
}
/** Update assessment component */
export async function update(
  db: DbWriter,
  id: Id<"assessmentComponents">,
  body: Partial<
    Pick<
      Doc<"assessmentComponents">,
      "name" | "totalAllotedMarks" | "passingMarks"
    >
  >,
) {
  return await db.patch(id, {
    ...body,
    updatedAt: Date.now(),
  });
}

export async function remove
(
    db:DbWriter,
    id:Id<"assessmentComponents">,
)
{
    await db.delete(id);
}
