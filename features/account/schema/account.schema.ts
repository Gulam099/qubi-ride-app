import { z } from "zod";

export const AppointmentCardSchema = z.object({
  id: z.string(),
  doctorName: z.string(),
  sessionDateTime: z
    .string()
    .refine((date) => !isNaN(new Date(date).getTime()), {
      message: "Invalid ISO date format",
    }),
  image: z.string().url(), // Validate URL for image
});
