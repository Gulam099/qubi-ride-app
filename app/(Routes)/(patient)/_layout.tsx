import Logo from "@/features/Home/Components/Logo";
import { TabButton } from "@/features/Home/Components/TabButton";
import { Text } from "@/components/ui/Text";
import { Link, Redirect, Stack, Tabs } from "expo-router";
// import { Tabs, TabList, TabTrigger, TabSlot } from 'expo-router/ui';
import {
  DocumentLike,
  Home,
  NoteFavorite,
  Notepad,
  UserOctagon,
} from "iconsax-react-native";
import { useSelector } from "react-redux";
import NotificationIconButton from "@/features/Home/Components/NotificationIconButton";
import colors from "@/utils/colors";

export default function PatientLayout() {
  const user = useSelector((state: any) => state.user);

  if (!user.isAuthenticated) {
    return <Redirect href="/" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary[600],
        headerBackButtonDisplayMode: "generic",
        headerShadowVisible: false,
        headerRight: () => <NotificationIconButton className="mr-4" />,
        headerStyle: {
          backgroundColor: colors.gray[500],
        },
        headerBackgroundContainerStyle: "",
      }}
    >
      <Tabs.Screen
        name="p/index"
        options={{
          title: "Home",
          tabBarStyle: {
            backgroundColor: "black",
            borderColor: "black",
          },

          tabBarIcon: ({ color, focused }) => (
            <Home
              size={24}
              color={color}
              variant={focused ? "Bold" : "Outline"}
            />
          ),

          headerLeft: () => (
            <UserOctagon size={32} color={"black"} className="ml-4" />
          ),
          headerTitle: () => (
            <Link href={"/p/account"} className="ml-4">
              <Text className="font-semibold text-lg text-black">
                Hello , {user.firstName}
              </Text>
            </Link>
          ),
          headerStyle: {
            backgroundColor: "grey",
          },
        }}
      />
      <Tabs.Screen
        name="p/support/index"
        options={{
          title: "Group Support",
          tabBarIcon: ({ color, focused, size }) => (
            <DocumentLike
              size={24}
              color={color}
              variant={focused ? "Bold" : "Outline"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="p/program/index"
        options={{
          title: "Programs",
          tabBarIcon: ({ color, focused }) => (
            <NoteFavorite
              size={24}
              color={color}
              variant={focused ? "Bold" : "Outline"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="p/library/index"
        options={{
          title: "Cultural Library",
          tabBarIcon: ({ color, focused }) => (
            <Notepad
              size={24}
              color={color}
              variant={focused ? "Bold" : "Outline"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="p/account"
        options={{
          title: "Baserti",
          tabBarIcon: ({ color }) => <Logo size={32} />,
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
