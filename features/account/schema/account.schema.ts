import { z } from "zod";

export const AppointmentCardSchema = z.object({
  _id: z.string(),
  doctorId: z.string(),
  type: z.enum(["cancelled", "completed", "pending"]),
  category: z.enum(["group", "session", "program"]),
  doctorName: z.string(),
  sessionDateTime: z
    .string()
    .refine((date) => !isNaN(new Date(date).getTime()), {
      message: "Invalid ISO date format",
    }),
  image: z.string().url(), // Validate URL for image
});
