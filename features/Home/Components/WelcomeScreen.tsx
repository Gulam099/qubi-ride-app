import { Text } from "@/components/ui/Text";
import React from "react";
import { StyleSheet, View, Image } from "react-native";
import PagerView from "react-native-pager-view";
import { EmojiHappy } from "iconsax-react-native";
import { H1, H3 } from "@/components/ui/Typography";

export default function WelcomeScreen() {
  const welcomeData = [
    {
      id: "1",
      src: require("../assets/images/1.jpg"),
      heading: "Insight",
      description:
        "It helps you see life differently, as it provides instant and scheduled consultations from a number of qualified advisors.",
    },
    {
      id: "2",
      src: require("../assets/images/2.jpg"),
      heading: "Freedom of choice in your sessions",
      description:
        "You can book your consultations in the way that is convenient for you, whether it's through text, voice, or video.",
    },
    {
      id: "3",
      src: require("../assets/images/3.jpg"),
      heading: "Available 24/7 to assist you",
      description:
        "Instant or scheduled consultations are available around the clock.",
    },
  ];

  return (
    <View className="flex-1">
      <PagerView style={styles.container} initialPage={0}>
        {welcomeData.map((item, index) => {
          return (
            <View
              key={item.id}
              className="w-screen h-full flex "
            >
              <Image
                source={item.src}
                className="mb-4 w-full h-full bg-cover absolute"
              />
              <View className="bg-background w-full absolute bottom-4 left-0">
                <H3 className="pb-4">
                  {item.heading}
                </H3>
                <Text className="text-base text-neutral-600 text-center">
                  {item.description}
                </Text>
              </View>
            </View>
          );
        })}
      </PagerView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width:'100%', height:"100%"
  },
});
