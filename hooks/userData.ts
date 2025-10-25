import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

const useUserData = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user_data");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };

    loadUser();
  }, []);

  return user;
};

export default useUserData;
