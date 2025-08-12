import { View, TouchableOpacity, ScrollView } from "react-native";
import { Button } from "@/components/ui/Button";
import { useLocalSearchParams, useRouter } from "expo-router";
import { H3 } from "@/components/ui/Typography";
import {
  PatientHomeImage,
  PatientPageInstantMenuImage,
  consultPageHomeImage
} from "@/features/patient/constPatient";
import { Image } from "react-native";
import { cn } from "@/lib/utils";
import { Text } from "@/components/ui/Text";
import { useEffect } from "react";
import * as Updates from "expo-updates";
import { useTranslation } from "react-i18next";

const PatientPage = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { t } = useTranslation();

  const reloadApp = async () => {
    try {
      await Updates.reloadAsync();
    } catch (e) {
      console.error("Failed to reload app:", e);
    }
  };

  useEffect(() => {
    if (params.refresh) {
      reloadApp(); // Refresh logic
    }
  }, [params.refresh]);

  return (
    <ScrollView className="flex-1">
      <Image
        source={PatientHomeImage}
        className={cn("w-full h-[undefined] aspect-[375/295]")}
      />
      <View className="flex gap-6 flex-col px-4">
        <H3 className="text-center">
          {t("What type of consultation do you need?")}
        </H3>

        <TouchableOpacity onPress={() => router.push("/instant-booking")}>
          <View className="flex justify-between rounded-xl p-4 backdrop-blur-md border border-neutral-300 flex-row relative overflow-hidden h-40 bg-background">
            <View className="absolute -right-16 top-0 rounded-full bg-blue-50/30 h-40 aspect-square"></View>
            <View className="w-2/2 flex flex-col justify-end pr-6">
              <H3 className="font-normal justify-end mr-28">{t("Instant")}</H3>
              <Text className="text-base font-normal">
                {t("Immediate sessions with a specialist")}
              </Text>
            </View>
            <View className="flex justify-end w-1/3 items-end pl-8">
              <Image
                source={PatientPageInstantMenuImage}
                className={cn("w-full h-[undefined] aspect-square")}
              />
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/consult")}>
          <View className="flex justify-between rounded-xl p-4 backdrop-blur-md border border-neutral-300 flex-row relative overflow-hidden h-40 bg-background">
            <View className="absolute -right-16 top-0 rounded-full bg-blue-50/30 h-40 aspect-square"></View>
            <View className="w-2/2 flex flex-col justify-end pr-8">
              <H3 className="font-normal justify-end mr-44">{t("Scheduled")}</H3>
              <Text className="text-base font-normal">
                {t(
                  "Book your appointment with the appropriate specialist for you"
                )}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <Button
          className="bg-blue-50/30 backdrop-blur-md"
          onPress={() => router.push("/(stacks)/find-consultant")}
        >
          <Text className="font-medium text-left w-full text-neutral-700">
            {t("Help me find the right consultant")}
          </Text>
        </Button>
      </View>
    </ScrollView>
  );
};

export default PatientPage;