import { View, Text } from "react-native";
import React from "react";

const Loader = () => {
  return (
    <View className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></View>
  );
};

export default Loader;
