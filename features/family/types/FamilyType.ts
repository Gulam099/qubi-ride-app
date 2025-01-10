import { z } from "zod";
import { FamilyFormSchema, FamilySchema } from "../schema/familySchema";

export type FamilyType = z.infer<typeof FamilySchema>;
export type FamilyFormType = z.infer<typeof FamilyFormSchema>;

