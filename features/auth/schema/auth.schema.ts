import { z } from "zod";

export const LogDataSchema = z.object({
  phoneNumber: z.string(),
  rememberMyDetails: z.boolean(),
  isSubmittedSuccess: z.boolean(),
});

export const VerificationDataSchema = z.object({
  isVerified: z.boolean(),
  otp: z.string(),
  otpLength: z.number(),
  otpResendTime : z.number(),
});
