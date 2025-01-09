import { UserType } from "@/features/user/types/user.type";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: UserType = {
  role: "patient",
  phoneNumber: "",
  email: null,
  dob: "",
  country: "",
  nationalId: "",
  name: null,
  isAuthenticated: false,
  _id: "",
  gender: "",
  passcode: null,
  createdAt: "",
  updatedAt: "",
  lastOtpSentTime: 0,
  otpExpirationTime: 0,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<Partial<UserType>>) => {
      return { ...state, ...action.payload, isAuthenticated: true };
    },
    logout: () => initialState,

    updateUser: (state, action: PayloadAction<Partial<UserType>>) => {
      const userData = action.payload;

      // Include phoneNumber from the current state
      const finalData = {
        ...userData,
        phoneNumber: state.phoneNumber,
      };

      // Make the PUT API call
      fetch(
        "https://monkfish-app-6ahnd.ondigitalocean.app/api/profile/update-profile",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(finalData),
        }
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to update user");
          }
          return response.json();
        })
        .then((data) => {
          console.log("User updated successfully:", data);
        })
        .catch((error) => {
          console.error("Error updating user:", error);
        });

      // Update the state with the new data
      return { ...state, ...userData };
    },
  },
});

export const { login, logout, updateUser } = userSlice.actions;
export default userSlice.reducer;
