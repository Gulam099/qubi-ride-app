import { z } from "zod";
import {
  LogDataSchema,
  NationalIdVerificationDataSchema,
  RoleDataSchema,
  VerificationDataSchema,
} from "../schema/auth.schema";

export type RoleType = z.infer<typeof RoleDataSchema>;

export type LogDataType = z.infer<typeof LogDataSchema>;

export type VerificationDataType = z.infer<typeof VerificationDataSchema>;

export type NationalIdVerificationDataType = z.infer<
  typeof NationalIdVerificationDataSchema
>;
