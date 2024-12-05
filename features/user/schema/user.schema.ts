import { z } from "zod";

// Define Role Enum
const RoleEnum = z.enum(["patient", "specialist", "admin" , "default"]);

// Define Zod Schema for User
export const userSchema = z.object({
  role: RoleEnum,
  phoneNumber: z.string().min(1, "Phone number is required"),
  country: z.string().min(1, "Country is required"),
  nationalId: z.string().min(1, "National ID is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  isAuthenticated: z.boolean(),
  email: z.string().email("Invalid email").optional(),
  dateOfBirth: z.string().optional(), // Optionally, validate format further (e.g., YYYY-MM-DD)
});