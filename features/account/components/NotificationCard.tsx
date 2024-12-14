import React from "react";
import { View, Text, StyleSheet } from "react-native";

type NotificationCardProps = {
  date: string;
  message: string;
};

const NotificationCard = ({ date, message }: NotificationCardProps) => {
  return (
    <View style={styles.card} className="shadow-sm">
      <Text className="text-blue-600 font-semibold">{date}</Text>
      <Text className="text-neutral-700 text-base">{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    marginVertical: 6,

    elevation: 2,
  },
});

export default NotificationCard;
