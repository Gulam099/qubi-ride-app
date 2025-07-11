import { Redirect, Stack } from "expo-router";
import { SafeAreaView } from "react-native";
import { Text } from "react-native";

const UnAuthenticatedLayout = () => {

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
    </Stack>
  );
};

export default UnAuthenticatedLayout;
