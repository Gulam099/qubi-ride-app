import React from "react";
import { View, Image, StyleSheet } from "react-native";

export default function Logo(props: { size?: number }) {
  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/logo.jpeg")} // path ko adjust karein agar alias use nahi kar rahe ho
        style={{
          width: props.size || 100,
          height: props.size || 100,
          resizeMode: "contain",
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});
