import { View, Text } from "react-native";
import React, { useState } from "react";
import { AppointmentCardType } from "../types/account.types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import Drawer from "@/components/ui/Drawer";
import { H3 } from "@/components/ui/Typography";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import Thumb from "@/assets/icon/thumb.svg";
import { CalendarEdit, MessageText, Trash } from "iconsax-react-native";
import ScheduleSelector from "@/features/Home/Components/ScheduleSelector";
import { format } from "date-fns";
import { RelativePathString, useRouter } from "expo-router";

type Props = AppointmentCardType;

export default function AppointmentCard({
  doctorName,
  sessionDateTime,
  image,
}: Props) {
  const router = useRouter();
  const [isDrawerCancelVisible, setIsDrawerCancelVisible] = useState(false);
  const [isCancelSuccess, setIsCancelSuccess] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isDrawerRescheduleVisible, setIsDrawerRescheduleVisible] =
    useState(false);
  const [ScheduleTime, setScheduleTime] = useState(sessionDateTime);
  const [isRescheduleSuccess, setIsRescheduleSuccess] = useState(false);

  const handleCancelSubmit = async () => {
    try {
      // Simulating API submission
      console.log("Submitting cancellation reason:", cancelReason);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulated API delay
      setIsCancelSuccess(true);
    } catch (error) {
      console.error("Failed to submit cancellation:", error);
    }
  };

  const handleReScheduleSubmit = async () => {
    try {
      // Simulating API submission
      console.log("Submitting reschedule time:", ScheduleTime);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulated API delay
      setIsRescheduleSuccess(true);
    } catch (error) {
      console.error("Failed to submit reschedule:", error);
      // Handle error
    }
  };

  return (
    <View className="w-full p-4 bg-white rounded-xl shadow-md mb-4">
      {/* Card Header */}
      <View className="flex-row items-start gap-3">
        <Avatar alt="avatar-with-image" className="w-14 h-14">
          <AvatarImage
            source={{
              uri: image,
            }}
          />
          <AvatarFallback>
            <Text>UN</Text>
          </AvatarFallback>
        </Avatar>
        <View className="flex flex-col gap-2">
          <Text className="text-lg font-bold">{doctorName}</Text>
          <Text className="">
            Session Day :{" "}
            {format(new Date(sessionDateTime), "EEEE , d MMMM yyyy")}
          </Text>
          <Text className="">
            Session Time : {format(new Date(sessionDateTime), "h:mm a")}
          </Text>
        </View>
      </View>

      {/* Card Footer */}
      <View className="flex-row justify-around mt-4">
        <Button
          onPress={() => setIsDrawerCancelVisible(true)}
          className="flex-row items-center bg-red-100  h-9"
        >
          <Trash size="20" color="#000" />
          <Text className="ml-2 font-medium">Cancel</Text>
        </Button>

        <Button
          className="flex-row items-center bg-leaves-100  h-9"
          onPress={() => setIsDrawerRescheduleVisible(true)}
        >
          <CalendarEdit size="20" color="#000" />
          <Text className="ml-2 font-medium">Reschedule</Text>
        </Button>

        <Button className="flex-row items-center bg-blue-100/60  h-9" onPress={
          () => {
            router.push(`/p/account/chat/1234abcd` as RelativePathString);
          }
        }>
          <MessageText size="20" color="#000" />
          <Text className="ml-2 font-medium">Chats</Text>
        </Button>
      </View>

      {/* Cancel Drawer */}
      <Drawer
        visible={isDrawerCancelVisible}
        onClose={() => {
          setIsDrawerCancelVisible(false);
          setIsCancelSuccess(false);
        }}
        title="Cancel the session"
        height="50%"
        className="max-h-[40%]"
      >
        <View className="flex flex-1 justify-center items-center w-full gap-4 px-6">
          {isCancelSuccess ? (
            <View className="flex flex-col justify-center items-center">
              <View className="aspect-square flex justify-center items-center relative overflow-visible p-2">
                <View className="bg-blue-50/20 aspect-square rounded-full w-[5.5rem] absolute"></View>
                <Thumb height={80} width={80} />
              </View>
              <H3 className="border-none text-center">
                Session has been successfully canceled
              </H3>
            </View>
          ) : (
            <>
              <Text className="border-none text-center text-xl font-semibold text-neutral-600">
                Cancel Session
              </Text>
              <Textarea
                placeholder="Reason to cancel the session"
                value={cancelReason}
                onChangeText={(text) => setCancelReason(text)}
                className="w-full h-20"
              />
              <Button
                onPress={handleCancelSubmit}
                disabled={!cancelReason.trim()}
                className="w-full"
              >
                <Text className="text-background font-medium">
                  Cancellation confirmation session
                </Text>
              </Button>
              <Button
                variant={"ghost"}
                className="w-full"
                onPress={() => setIsDrawerCancelVisible(false)}
              >
                <Text className="text-neutral-500 font-medium">Retreat</Text>
              </Button>
            </>
          )}
        </View>
      </Drawer>

      {/* Reschedule Drawer */}
      <Drawer
        visible={isDrawerRescheduleVisible}
        onClose={() => setIsDrawerRescheduleVisible(false)}
        title="Reschedule the Session"
        className="max-h-[85%] "
      >
        {isRescheduleSuccess ? (
          <View className="flex flex-1 justify-center items-center w-full gap-4 px-6">
            <View className="flex flex-col justify-center items-center">
              <View className="aspect-square flex justify-center items-center relative overflow-visible p-2">
                <View className="bg-blue-50/20 aspect-square rounded-full w-[5.5rem] absolute"></View>
                <Thumb height={80} width={80} />
              </View>
              <H3 className="border-none text-center">
                Session has been successfully rescheduled
              </H3>
            </View>
          </View>
        ) : (
          <>
            <ScheduleSelector
              selectedDateTime={ScheduleTime}
              setSelectedDateTime={setScheduleTime}
              availableTimes={[
                "2024-12-26T11:00:00Z",
                "2024-12-26T13:00:00Z",
                "2024-12-26T15:00:00Z",
                "2024-12-27T09:00:00Z",
                "2024-12-27T12:00:00Z",
                "2024-12-27T16:00:00Z",
                "2024-12-28T10:00:00Z",
                "2024-12-28T14:00:00Z",
              ]}
            />
            <Button
              onPress={handleReScheduleSubmit}
              disabled={!ScheduleTime}
              className="w-full"
            >
              <Text className="text-background font-medium">
                Rescheduling confirmation
              </Text>
            </Button>
            <Button
              variant={"ghost"}
              className="w-full mb-4"
              onPress={() => setIsDrawerRescheduleVisible(false)}
            >
              <Text className="text-neutral-500 font-medium">Retreat</Text>
            </Button>
          </>
        )}
      </Drawer>
    </View>
  );
}
