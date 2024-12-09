import React from "react";
import { StyleSheet, View, Image } from "react-native";
import PagerView from "react-native-pager-view";
import { welcomeData } from "../constHome";
import { H2 } from "@/components/ui/Typography";
import { Text } from "@/components/ui/Text";

export default function WelcomeScreen() {
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
                <H2 className="text-white border-0">{item.title}</H2>
                <Text className="text-white border-0 leading-8 text-lg">{item.desc}</Text>
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
