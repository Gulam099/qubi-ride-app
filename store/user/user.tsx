// store/user/userSlice.ts
import { UserType } from "@/features/user/types/user.type";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: UserType = {
  role: "default",
  phoneNumber: "",
  country: "",
  nationalId: "",
  firstName: "",
  lastName: "",
  isAuthenticated: false,
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
