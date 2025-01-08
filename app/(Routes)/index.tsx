import { Image, StyleSheet, Platform, View } from "react-native";
// Import the global.css file in the index.js file:
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import ThemeToggleButton from "@/components/custom/ThemeToggle";
import { EmojiHappy } from "iconsax-react-native";
import { Link, Redirect } from "expo-router";
import UserComponent from "@/components/UserComponent";
import { useDispatch, useSelector } from "react-redux";
import { RoleType } from "@/features/auth/types/auth.types";
import { login, logout, updateUser } from "@/store/user/user";

export default function HomeScreen() {
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.user);

  if (!user) {
    return <Text>Loading....</Text>;
  }

  if (!user.isAuthenticated) {
    return <Redirect href="/welcome" />;
  }

  if (user.isAuthenticated) {
    const userRole: RoleType = user.role;
    if (userRole === "default") {
      dispatch(
        login({
          isAuthenticated: false,
        })
      );
      return <Redirect href="/welcome" />;
    }
    if (userRole === "patient") {
      return <Redirect href="/p" />;
    }
    if (userRole === "specialist") {
      return <Redirect href="/s" />;
    }
  }

  return <Redirect href="/welcome" />;
}
