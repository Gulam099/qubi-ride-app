import { z } from "zod";

// Define Role Enum
const RoleEnum = z.enum(["patient", "specialist", "admin", "default" , "user"]);

// Define Zod Schema for User
export const userSchema = z.object({
  favorites: z.object({
    programs: z.array(z.string()).optional(),
    doctors: z.array(z.string()).optional(),
    groups: z.array(z.string()).optional(),
  }).optional(),
  _id: z.string(),
  name: z.string().nullable(),
  email: z.string().email("Invalid email").nullable(),
  address: z.object({
    line1: z.string().optional(),
    line2: z.string().optional(),
  }).optional(),
  gender: z.string().default("Not selected"),
  dob: z.string().default("Not selected"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  passcode: z.string().nullable(),
  cards: z.array(z.string()).optional(),
  family: z.array(z.string()).optional(),
  notifications: z.array(z.string()).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  lastOtpSentTime: z.number(),
  otpExpirationTime: z.number(),
  role: RoleEnum,
  country: z.string().min(1, "Country is required"),
  nationalId: z.string().min(1, "National ID is required"),
  isAuthenticated: z.boolean(),
});
