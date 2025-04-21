import { Text } from "@/components/ui/Text";
import { Link, Tabs } from "expo-router";
import {
  DocumentText1,
  Home,
  Notepad,
  Profile2User,
  ShieldTick,
} from "iconsax-react-native";
import NotificationIconButton from "@/features/Home/Components/NotificationIconButton";
import colors from "@/utils/colors";
import { cn } from "@/lib/utils";
import { View } from "react-native";
import ProfileImage from "@/features/account/components/ProfileImage";
import { useUser } from "@clerk/clerk-expo";

export default function PatientLayout() {
  const { user } = useUser();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.blue[600],
        headerBackButtonDisplayMode: "generic",
        headerShadowVisible: false,
        headerRight: () => <NotificationIconButton className="mr-4" />,
        headerStyle: {
          backgroundColor: "white",
        },
        headerTitle: ({ children }) => (
          <Text className="font-semibold text-lg ">{children}</Text>
        ),
        headerBackgroundContainerStyle: "",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <View
              className={cn(focused ? "bg-primary-300 p-1 rounded-full" : "")}
            >
              <Home
                size={24}
                color={focused ? "white" : "grey"}
                variant={focused ? "Bold" : "Outline"}
              />
            </View>
          ),

          headerLeft: () => (
            <View className="pl-4">
              <Link href={"/account"}>
                <ProfileImage
                  className="size-12 border border-primary-600"
                  TextClassName="text-sm font-bold"
                  imageUrl={user?.imageUrl!}
                  name={user?.firstName!}
                />
              </Link>
            </View>
          ),
          headerTitle: () => (
            <Link href={"/account"} className="ml-2">
              <Text className="font-semibold text-lg text-white">
                Hello , {user?.firstName ?? "User"}
              </Text>
            </Link>
          ),

          headerTransparent: true,
          headerStyle: {
            backgroundColor: "#00000056",
          },
        }}
      />
      <Tabs.Screen
        name="support"
        options={{
          title: "Group",
          tabBarIcon: ({ color, focused, size }) => (
            <View
              className={cn(focused ? "bg-primary-300 p-1 rounded-full" : "")}
            >
              <Profile2User
                size={24}
                color={focused ? "white" : "grey"}
                variant={focused ? "Bold" : "Outline"}
              />
            </View>
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="program"
        options={{
          title: "Programs",
          tabBarIcon: ({ color, focused }) => (
            <View
              className={cn(focused ? "bg-primary-300 p-1 rounded-full" : "")}
            >
              <ShieldTick
                size={24}
                color={focused ? "white" : "grey"}
                variant={focused ? "Bold" : "Outline"}
              />
            </View>
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: "Library",
          tabBarIcon: ({ color, focused }) => (
            <View
              className={cn(focused ? "bg-primary-300 p-1 rounded-full" : "")}
            >
              <Notepad
                size={24}
                color={focused ? "white" : "grey"}
                variant={focused ? "Bold" : "Outline"}
              />
            </View>
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "File",
          tabBarIcon: ({ color, focused }) => (
            <View
              className={cn(focused ? "bg-primary-300 p-1 rounded-full" : "")}
            >
              <DocumentText1
                size={24}
                color={focused ? "white" : "grey"}
                variant={focused ? "Bold" : "Outline"}
              />
            </View>
          ),
          headerShown: false,
        }}
      />
    </Tabs>
  );
}