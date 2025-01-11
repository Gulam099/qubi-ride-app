import React, { useEffect } from "react";
import { Text } from "@/components/ui/Text";
import { UserType } from "@/features/user/types/user.type";
import { Redirect } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { getUser } from "@/features/user/utils/userUtils";
import { logout, updateUserState } from "@/store/user/user";

export default function HomeScreen() {
  const user: UserType = useSelector((state: any) => state.user);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUserData = async () => {
      if (user.isAuthenticated && user.phoneNumber) {
        const result = await getUser({ phoneNumber: user.phoneNumber });

        if (result.success) {
          const fetchedUser = result.data;

          // Check if `isAuthenticated` is true in fetched user data
          if (fetchedUser.isAuthenticated) {
            dispatch(updateUserState(fetchedUser));
          } else {
            dispatch(logout());
          }
        } else {
          // Handle fetch failure
          console.error(result.message || "Failed to fetch user data");
          dispatch(logout());
        }
      }
    };

    fetchUserData();
  }, [user.isAuthenticated, user.phoneNumber, dispatch]);

  if (!user) {
    return <Text>Loading....</Text>;
  }

  if (!user.isAuthenticated) {
    return <Redirect href="/welcome" />;
  }

  if (user.isAuthenticated) {
    return <Redirect href="/p" />;
  }

  return <Redirect href="/welcome" />;
}
