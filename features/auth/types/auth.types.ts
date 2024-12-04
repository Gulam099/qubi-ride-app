import { z } from "zod";
import {
  LogDataSchema,
  NationalIdVerificationDataSchema,
  VerificationDataSchema,
} from "../schema/auth.schema";

export type LogDataType = z.infer<typeof LogDataSchema>;

export type VerificationDataType = z.infer<typeof VerificationDataSchema>;

export type NationalIdVerificationDataType = z.infer<
  typeof NationalIdVerificationDataSchema
>;
