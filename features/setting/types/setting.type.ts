export type AppStateType = {
  theme: "light" | "dark" | "device";
  language: "en" | "ar"; // Add more languages as needed
  accessibility: "Stop" | "Dim Light" | "Invert Colors" | "White & Black";
  activateCamera: boolean;
  accessStudio: boolean;
  notifications: boolean;
  profilePasscode: boolean; // Passcode as a string
};
