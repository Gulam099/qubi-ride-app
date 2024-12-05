import { Redirect, Stack, Tabs } from "expo-router";
import { Home } from "iconsax-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

export default function AuthLayout() {
  const user = useSelector((state: any) => state.user);

  if (!user.isAuthenticated) {
    return <Redirect href="/" />;
  }
  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* <Stack screenOptions={{ headerShown: false }} /> */}
      <Tabs screenOptions={{ headerShown: false , tabBarActiveTintColor: 'green' }}>
      <Tabs.Screen
        name="s/index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home size={28} color='green' />,
        }}
      />
    </Tabs>
    </SafeAreaView>
  );
}
