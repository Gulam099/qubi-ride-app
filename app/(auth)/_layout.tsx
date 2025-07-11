import { Redirect, Stack } from "expo-router";
import { SafeAreaView } from "react-native";
import { Text } from "react-native";
import { useTranslation } from "react-i18next";

const UnAuthenticatedLayout = () => {
  const { t } = useTranslation();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: "#666666",
        },
      }}
    >
      <Stack.Screen
        name="onboarding"
        options={{
          headerTitle: () => (
            <Text className="font-semibold text-lg text-white">
              {t("onboarding")}
            </Text>
          ),
        }}
      />
    </Stack>
  );
};

export default UnAuthenticatedLayout;
