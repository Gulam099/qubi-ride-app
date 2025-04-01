import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { useAuth } from "@clerk/clerk-expo";

export function createServerSupabaseClient() {
  const { getToken } = useAuth();
  return createClient(
    process.env.EXPO_PUBLIC_SUPABASE_URL || "",
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "",

    {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
      async accessToken() {
        return await getToken();
      },
    }
  );
}

export const supabase = createServerSupabaseClient();
