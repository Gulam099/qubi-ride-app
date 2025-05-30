import { View, TouchableOpacity } from "react-native";
import { Button } from "@/components/ui/Button";
import { useRouter } from "expo-router";
import { H3 } from "@/components/ui/Typography";
import {
  PatientHomeImage,
  PatientPageInstantMenuImage,
} from "@/features/patient/constPatient";
import { Image } from "react-native";
import { cn } from "@/lib/utils";
import { Text } from "@/components/ui/Text";

export default function PatientPage() {
  const router = useRouter();

  return (
    <View className="flex-1 flex gap-6 flex-col h-full">
      <Image
        source={PatientHomeImage}
        className={cn("w-full h-[undefined] aspect-[375/295]")}
      />
      <View className="flex gap-6 flex-col px-4">
        <H3 className="text-center">What type of consultation do you need?</H3>

        <TouchableOpacity
          onPress={() => router.push("/instant-booking")}
        >
          <View className="flex justify-between  rounded-xl p-4  backdrop-blur-md border border-neutral-300 flex-row relative overflow-hidden h-40 bg-background">
            <View className="absolute -right-16 top-0 rounded-full bg-blue-50/30 h-40 aspect-square"></View>
            <View className="w-2/3 flex flex-col justify-end">
              <H3 className="font-normal">Instant</H3>
              <Text className=" text-base font-normal">
                Immediate sessions with a specialist
              </Text>
            </View>
            <View className="flex justify-end w-1/3  items-end">
              <Image
                source={PatientPageInstantMenuImage}
                className={cn("w-full h-[undefined] aspect-square")}
              />
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/consult")}>
          <View className="flex justify-between  rounded-xl p-4  backdrop-blur-md border border-neutral-300 flex-row relative overflow-hidden h-40 bg-background">
            <View className="absolute -right-16 top-0 rounded-full bg-blue-50/30 h-40 aspect-square"></View>
            <View className="w-2/3 flex flex-col justify-end">
              <H3 className="font-normal">Scheduled</H3>
              <Text className=" text-base font-normal">
                Book your appointment with the appropriate specialist for you
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* <Button
          className="bg-blue-50/30 backdrop-blur-md "
          onPress={() => router.push("/account/consult/help")}
        >
          <Text className="font-medium text-left w-full text-neutral-700">
            Help me find the right consultant{" "}
          </Text>
        </Button> */}
      </View>
    </View>
  );
}
