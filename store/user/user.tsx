import { UserType } from "@/features/user/types/user.type";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { updateUser } from "@/features/user/utils/userUtils";
import { toast } from "sonner-native";

const initialState: UserType = {
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
  favorites: {
    programs: [],
    doctors: [],
    groups: [],
  },
  address: {
    line1: "",
    line2: "",
  },
  cards: [],
  family: [],
  notifications: [],
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<Partial<UserType>>) => {
      const userData = action.payload;

      (async () => {
        // Update user data if necessary
        if (userData?.name === null || userData?.email === null) {
          const updatedFields: Partial<typeof userData> = {};

          if (userData?.name === null) {
            updatedFields.name = `User-${userData.phoneNumber?.slice(
              userData.phoneNumber?.length - 4
            )}`;
          }

          if (userData?.email === null) {
            updatedFields.email = "";
          }

          const updateResult = await updateUser({
            phoneNumber: userData.phoneNumber as string,
            data: updatedFields,
          });

          if (updateResult.success) {
            Object.assign(userData, updateResult.data);
          } else {
            toast.error(
              updateResult.message
            );
          }
        }
      })();

      return { ...state, ...userData };
    },

    logout: (state) => {
      (async () => {
        try {
          const result = await updateUser({
            phoneNumber: state.phoneNumber,
            data: { isAuthenticated: false },
          });

          if (!result.success) {
            toast.error(result.message || "Failed to log out user");
          }
        } catch (error) {
          toast.error("Error logging out user");
        }
      })();

      return initialState;
    },

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
