import React from "react";
import { StyleSheet, View, Image } from "react-native";
import PagerView from "react-native-pager-view";

import { H2 } from "@/components/ui/Typography";
import { Text } from "@/components/ui/Text";
import { useTranslation } from "react-i18next";

export default function WelcomeScreen() {
  const { t } = useTranslation();
  const welcomeData = [
    {
      title: t("Insight"),
      desc: "It helps you see life differently, as it provides instant and scheduled consultations from a number of qualified advisors.",
      src: require("../assets/images/welcomescreen1.png"),
    },
    {
      title: "Freedom of choice in your sessions",
      desc: "You can book your consultations in the way that is convenient for you, whether it's through text, voice, or video.",
      src: require("../assets/images/welcomescreen2.png"),
    },
    {
      title: "Available 24/7 to assist you",
      desc: "Instant or scheduled consultations are available around the clock",
      src: require("../assets/images/welcomescreen3.png"),
    },
  ];
  return (
    <View className="flex-1 relative">
      <PagerView style={styles.container} initialPage={0}>
        {welcomeData.map((item, index) => {
          return (
            <View key={index} className="w-screen h-full flex ">
              <Image
                source={item.src}
                className="w-full h-full bg-cover absolute"
              />
              <View className="absolute bottom-0 px-6 py-20 flex flex-col gap-6">
                <H2 className="text-white border-0 w-full ">{item.title}</H2>
                <Text className="text-white border-0 leading-8 text-lg">
                  {item.desc}
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
    width: "100%",
    height: "100%",
  },
});
