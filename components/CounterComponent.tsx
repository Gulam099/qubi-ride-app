import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { increment, decrement } from "../store/counter/counter";

const CounterComponent = () => {
  const dispatch = useDispatch();
  const count = useSelector((state: any) => state.count.count); // Accessing count state

  return (
    <View className="flex items-center justify-center p-4">
      <Text style={styles.title}>Redux Counter</Text>
      <Text style={styles.count}>{count}</Text>

      <View style={styles.buttonContainer}>
        <Button title="Increment" onPress={() => dispatch(increment())} />
        <Button title="Decrement" onPress={() => dispatch(decrement())} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 3,
  },
  count: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "60%",
  },
});

export default CounterComponent;
