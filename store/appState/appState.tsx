// store/app/appStateSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the type for app state
type AppStateType = {
  theme: "light" | "dark" | "device";
  language: "english" | "arabic"; // Add more languages as needed
};

// Define the initial state
const initialState: AppStateType = {
  theme: "light", // Default theme
  language: "english", // Default language
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
