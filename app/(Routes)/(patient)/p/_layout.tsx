import Logo from "@/features/Home/Components/Logo";
import { TabButton } from "@/features/Home/Components/TabButton";
import { Text } from "@/components/ui/Text";
import { Link, Redirect, Stack, Tabs } from "expo-router";
// import { Tabs, TabList, TabTrigger, TabSlot } from 'expo-router/ui';
import {
  DocumentLike,
  DocumentText1,
  Home,
  NoteFavorite,
  Notepad,
  Profile2User,
  ProfileCircle,
  ShieldTick,
  UserOctagon,
} from "iconsax-react-native";
import { useSelector } from "react-redux";
import NotificationIconButton from "@/features/Home/Components/NotificationIconButton";
import colors from "@/utils/colors";
import { cn } from "@/lib/utils";
import { View } from "react-native";

export default function PatientLayout() {
  const user = useSelector((state: any) => state.user);

  if (!user.isAuthenticated) {
    return <Redirect href="/" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.blue[600],
        headerBackButtonDisplayMode: "generic",
        headerShadowVisible: false,
        headerRight: () => <NotificationIconButton className="mr-4" />,
        headerStyle: {
          backgroundColor: colors.blue[900],
        },
        headerTitle: ({ children }) => (
          <Text className="font-semibold text-lg text-white">
            {children}
          </Text>
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
              <ProfileCircle size={32} color={"white"} className="ml-4" />
            </View>
          ),
          headerTitle: () => (
            <Link href={"/p/account"} className="ml-2">
              <Text className="font-semibold text-lg text-white">
                Hello , {user.firstName}
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
        }}
      />
      <Tabs.Screen
        name="program/index"
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
        }}
      />
      <Tabs.Screen
        name="library/index"
        options={{
          title: "Cultural Library",
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
    //   <Tabs>
    //   {/* Tab Slot: Place for rendering tabs */}
    //   <TabSlot>
    //     <View>
    //       <Text>Tab Content Goes Here</Text>
    //     </View>
    //   </TabSlot>

    //   {/* Tab List: Define Tab Triggers */}
    //   <TabList>
    //     <TabTrigger name="home" href="/p" className="flex flex-col gap-2">
    //     <TabButton icon={Home}  />
    //     </TabTrigger>
    //     <TabTrigger name="support" href="/p/support">
    //       <Text>Group Support</Text>
    //     </TabTrigger>
    //     <TabTrigger name="program" href="/p/program">
    //       <Text>Programs</Text>
    //     </TabTrigger>
    //     <TabTrigger name="library" href="/p/library">
    //       <Text>Cultural Library</Text>
    //     </TabTrigger>
    //     <TabTrigger name="account" href="/p/account">
    //       <Text>Baserti</Text>
    //     </TabTrigger>
    //   </TabList>
    // </Tabs>
  );
}
