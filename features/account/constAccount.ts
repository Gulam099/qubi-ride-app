import { AppointmentCardType } from "./types/account.types";

export const PatientDeleteAccountOptions = [
  "The services doesn't implies to me / I do not need the existing services",
  "The application is not working properly.",
  "Not satisfied with the provided services",
  "I have another account with a different phone number or ID",
];

export const AppointmentData: AppointmentCardType[] = [
  {
    id: "1",
    doctorName: "Dr.. Abdul Wahab Muhammad",
    sessionDateTime: "2024-12-22T01:30:00Z", // ISO format
    image: "https://via.placeholder.com/50",
  },
  {
    id: "2",
    doctorName: "Dr.. Abdul Wahab Muhammad",
    sessionDateTime: "2024-12-21T01:30:00Z",
    image: "https://via.placeholder.com/50",
  },
];
