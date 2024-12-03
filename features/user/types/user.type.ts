import { z } from "zod";
import { userSchema } from "../schema/user.schema";

export type UserType = z.infer<typeof userSchema>;