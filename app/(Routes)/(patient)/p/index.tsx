import { View, Text } from "react-native";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { login, logout, updateUser } from "@/store/user/user";
import { Button } from "@/components/ui/Button";

export default function PatientPage() {
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.user);

  if(!user.isAuthenticated){

  }
  return (
    <View>
      <Text>PatientPage</Text>
      <Text>
        Name: {user.firstName || "Guest"} {user.lastName}
      </Text>
      <Text>Role: {user.role}</Text>
      <Text>
        Status: {user.isAuthenticated ? "Authenticated" : "Not Authenticated"}
      </Text>
      <Button onPress={() => dispatch(logout())} variant={'destructive'}>
        <Text className='text-white'>Logout</Text>
      </Button>
    </View>
  );
}
