import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the type for app state
type AppStateType = {
  theme: "light" | "dark" | "device";
  language: "en" | "ar"; // Add more languages as needed
  accessibility: "Stop" | "Dim Light" | "Invert Colors" | "White & Black";
  activateCamera: boolean;
  accessStudio: boolean;
  notifications: boolean;
  profilePasscode: string; // Passcode as a string
};

// Define the initial state
const initialState: AppStateType = {
  theme: "light", // Default theme
  language: "en", // Default language
  accessibility: "Stop", // Default accessibility setting
  activateCamera: false, // Default permission
  accessStudio: false, // Default permission
  notifications: true, // Default notifications setting
  profilePasscode: "", // Default empty string for passcode
};

const appStateSlice = createSlice({
  name: "appState",
  initialState,
  reducers: {
    updateAppState: (state, action: PayloadAction<Partial<AppStateType>>) => {
      return { ...state, ...action.payload };
    },
    resetAppState: () => initialState, // Reset to initial state
  },
});

// Export actions
export const { updateAppState, resetAppState } = appStateSlice.actions;

// Export reducer
export default appStateSlice.reducer;
