import { z } from "zod";
import { AppointmentCardSchema } from "../schema/account.schema";

export type AppointmentCardType = z.infer<typeof AppointmentCardSchema>;
