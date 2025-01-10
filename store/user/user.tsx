import { UserType } from "@/features/user/types/user.type";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { updateUser } from "@/features/user/utils/userUtils";

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

    updateUserState: (state, action: PayloadAction<Partial<UserType>>) => {
      const userData = action.payload;
    
      updateUser({ phoneNumber: state.phoneNumber, data: userData })
        .then((result) => {
          if (result.success && result.data?.user) {
            console.log("User updated successfully:", result.data.user);
    
            // Merge the updated fields into Redux state
            return { ...state, ...result.data.user };
          } else {
            console.error("Failed to update user:", result.message);
            throw new Error(result.message || "Update failed");
          }
        })
        .catch((error) => {
          console.error("Error updating user:", error);
        });
    
      // Return the updated state locally for optimistic updates
      return { ...state, ...userData };
    },
  },
});

export const { login, logout, updateUserState } = userSlice.actions;
export default userSlice.reducer;
