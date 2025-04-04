import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import BackButton from "@/features/Home/Components/BackButton";
import NotificationIconButton from "@/features/Home/Components/NotificationIconButton";
import { Stack, useRouter } from "expo-router";
import { Image, View } from "react-native";

export default function NotFoundScreen() {
  const router = useRouter();
  return (
    <>
      <Stack.Screen
        options={{
          headerBackButtonDisplayMode: "generic",
          headerShadowVisible: false,
          headerLeft: () => <BackButton className="" />,
          headerRight: () => <NotificationIconButton className="mr-4" />,
          headerTitle: () => (
            <Text className="font-semibold text-lg ">Page not found</Text>
          ),
        }}
      />
      <View className="flex-1 justify-center items-center gap-4 bg-primary-50/30">
        <Image
          source={require("../assets/images/notfound.png")}
          width={300}
          height={300}
        />
        <Text className="text-center text-xl font-semibold text-gray-900">
          This page doesn't exist.
        </Text>
        <Text className="text-center text-base font-semibold text-gray-900">
          You may have mistyped the address or the page may have moved.
        </Text>
        <Button>
          <Text
            className="text-center text-xl font-semibold text-background"
            onPress={() => router.back()}
          >
            Go Back
          </Text>
        </Button>
      </View>
    </>
  );
}
