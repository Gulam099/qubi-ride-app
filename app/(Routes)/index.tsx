import { Image, StyleSheet, Platform, View } from "react-native";
// Import the global.css file in the index.js file:
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import ThemeToggleButton from "@/components/custom/ThemeToggle";
import { EmojiHappy } from "iconsax-react-native";
import { Link, Redirect } from "expo-router";
import CounterComponent from "@/components/CounterComponent";
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
    if (userRole === "admin") {
      return (
        <View className="flex-1 justify-center items-center gap-5">
          <ThemeToggleButton />
          <CounterComponent />
          <UserComponent />
          <Button>
            <Link href={"/welcome"}>
              <Text className="flex gap-2 justify-center items-center">
                If you See this Page it means you are Admin
                <EmojiHappy variant="Bulk" color={"yellow"} size={20} />
              </Text>
            </Link>
          </Button>
        </View>
      );
    }
  }

  return <Redirect href="/welcome" />;
}
