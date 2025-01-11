import { FamilySchema } from "@/features/family/schema/FamilySchema";
import { z } from "zod";

// Define Zod Schema for User
export const userSchema = z.object({
  favorites: z.object({
    programs: z.array(z.string()),
    doctors: z.array(z.string()),
    groups: z.array(z.string()),
  }),
  _id: z.string(),
  name: z.string().nullable(),
  email: z.string().email("Invalid email").nullable(),
  address: z.object({
    line1: z.string(),
    line2: z.string(),
  }),
  gender: z.string().default("Not selected"),
  dob: z.string().default("Not selected"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  passcode: z.string().nullable(),
  cards: z.array(z.string()),
  family: z.array(FamilySchema),
  notifications: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),
  lastOtpSentTime: z.number(),
  otpExpirationTime: z.number(),
  country: z.string().min(1, "Country is required"),
  nationalId: z.string().min(1, "National ID is required"),
  isAuthenticated: z.boolean(),
});
