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
import { View, ActivityIndicator } from "react-native";
import ProfileImage from "@/features/account/components/ProfileImage";
import { useUser } from "@clerk/clerk-expo";
import { useTranslation } from "react-i18next";

const PatientLayout = () => {
  const { user, isLoaded } = useUser();
  const { t } = useTranslation();

  const tabConfig = [
    {
      name: "index",
      title: t("Home"),
      icon: Home,
      headerLeft: ({ user }: any) => (
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
      headerTitle: ({ user }: any) => (
        <Link href={"/account"} className="ml-2">
          <Text className="font-semibold text-lg text-white">
            {t("Hello")}, {user?.firstName ?? "User"}
          </Text>
        </Link>
      ),
      headerTransparent: true,
      headerStyle: {
        backgroundColor: "#00000056",
      },
    },
     {
      name: "group",
      title: t("Group"),
      icon: Profile2User,
      headerShown: false,
    },
    {
      name: "program",
      title: t("Programs"),
      icon: ShieldTick,
      headerShown: false,
    },
    {
      name: "library",
      title: t("Library"),
      icon: Notepad,
      headerShown: false,
    },
    {
      name: "account",
      title: t("File"),
      icon: DocumentText1,
      headerShown: false,
    },
  ];

  // Show loading spinner while Clerk is initializing
  if (!isLoaded) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color={colors.blue[600]} />
      </View>
    );
  }

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
          <Text className="font-semibold text-lg">{children}</Text>
        ),
      }}
    >
      {tabConfig.map(
        ({
          name,
          title,
          icon: Icon,
          headerShown = true,
          headerLeft,
          headerTitle,
          headerTransparent,
          headerStyle,
        }) => (
          <Tabs.Screen
            key={name}
            name={name}
            options={{
              title,
              headerShown,
              headerLeft: headerLeft ? () => headerLeft({ user }) : undefined,
              headerTitle: headerTitle
                ? () => headerTitle({ user })
                : undefined,
              headerTransparent,
              headerStyle,
              tabBarIcon: ({ focused }) => (
                <View
                  className={cn(
                     "text-[16px] text-nowrap",
                    focused ? "bg-primary-300 p-1 rounded-full" : ""
                  )}
                >
                  <Icon
                    size={24}
                    color={focused ? "white" : "grey"}
                    variant={focused ? "Bold" : "Outline"}
                  />
                </View>
              ),
            }}
          />
        )
      )}
    </Tabs>
  );
};

export default PatientLayout;