import { z } from "zod";

export const RoleDataSchema = z.enum(["patient", "specialist", "admin" , "default"]);

export const LogDataSchema = z.object({
  country: z.string(),
  countryCode: z.string(),
  phoneNumber: z.string(),
  rememberMyDetails: z.boolean(),
  isSubmittedSuccess: z.boolean(),
});

export const VerificationDataSchema = z.object({
  isVerified: z.boolean(),
  otp: z.string(),
  otpLength: z.number(),
  otpResendTime: z.number(),
  otpExpiryTime:z.number()
});

export const NationalIdVerificationDataSchema = z.object({
  nationalId: z.string(),
  isNationalIdSubmittedSuccess: z.boolean(),
});
