import { ConvexError } from "convex/values";
import { Doc, Id } from "#_generated/dataModel";
import { DbWriter, DbReader,lastorderIdx } from "#helpers/types";

/** Create assessment component
 * @throws an error if unable to create one*/
export async function create(
  db: DbWriter,
  body: Pick<Doc<"assessmentComponents">, "name" | "totalAllotedMarks"| "passingMarks" | "orderIdx">,
) {
  try {
    return await db.insert("assessmentComponents", {
      ...body,
      createdAt: Date.now(),
      orderIdx: lastorderIdx+1,
    });
  } catch (e) {
    throw new ConvexError("Unable to create assessment schema");
  }
}
/**
 **Update assessment component**
 * @throws an error if not able to update 
 */
export async function update(
    db:DbWriter,
    id:Id<"assessmentComponents">,
    body: Pick<Doc<"assessmentComponents">,"name" | "totalAllotedMarks" | "passingMarks" >,
){
    try{
        return await db.patch(id,{
            ...body,
            updatedAt:Date.now(),
        });
        return id;
    }
    catch(e){
        throw new ConvexError("Unable to upadate the value");
    }
}