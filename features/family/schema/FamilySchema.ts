import { z } from "zod";

export const FamilySchema = z.object({
  _id: z.string(),
  idNumber: z.string(),
  name: z.string().min(1, "Name is required"),
  age: z.number().min(1, "Age is required"),
  fileNo: z.string().min(1, "File Number is required"),
  relationship: z.string().min(1, "Relationship is required"),
});

export const FamilyFormSchema = FamilySchema.omit({_id:true})
