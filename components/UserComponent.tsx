// components/UserComponent.tsx
import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { login, logout, updateUser } from "@/store/user/user";

const UserComponent = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.user);

  return (
    <View >
      <Text style={styles.title}>User Information</Text>
      <Text style={styles.info}>Name: {user.firstName || "Guest"} {user.lastName}</Text>
      <Text style={styles.info}>Role: {user.role}</Text>
      <Text style={styles.info}>
        Status: {user.isAuthenticated ? "Authenticated" : "Not Authenticated"}
      </Text>

      <View style={styles.buttonContainer}>
        <Button
          title="Login"
          onPress={() =>
            dispatch(
              login({
                firstName: "John",
                lastName: "Doe",
                role: "admin",
                isAuthenticated: true,
                email: "john.doe@example.com",
              })
            )
          }
        />
        <Button title="Logout" onPress={() => dispatch(logout())} />
        <Button
          title="Update User"
          onPress={() =>
            dispatch(
              updateUser({
                firstName: "Jane",
                email: "jane.doe@example.com",
              })
            )
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  info: {
    fontSize: 18,
    marginVertical: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
    width: "80%",
  },
});

export default UserComponent;
