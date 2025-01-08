// store/user/userSlice.ts
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
      return { ...state, ...action.payload };
    },
  },
});

export const { login, logout, updateUser } = userSlice.actions;
export default userSlice.reducer;
