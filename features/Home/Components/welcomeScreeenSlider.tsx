import React from "react";
import { StyleSheet, View, Image } from "react-native";
import PagerView from "react-native-pager-view";
import { welcomeData } from "../constHome";

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
