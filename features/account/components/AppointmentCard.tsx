import { View, Text, Image } from "react-native";
import React from "react";
import { Button } from "@/components/ui/Button";
import { CalendarEdit, MessageText, Trash } from "iconsax-react-native";
import { AppointmentCardType } from "../types/account.types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";

type Props = AppointmentCardType;

const formatDateTime = (isoDate: string) => {
  const date = new Date(isoDate);
  const day = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);

  const time = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);

  return { day, time };
};

export default function AppointmentCard({
  doctorName,
  sessionDateTime,
  image,
}: Props) {
  const { day, time } = formatDateTime(sessionDateTime);
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
          <Text className="">Session Day : {day}</Text>
          <Text className="">Session Time : {time}</Text>
        </View>
      </View>

      {/* Card Footer */}
      <View className="flex-row justify-around mt-4">
        <Button className="flex-row items-center bg-red-100  h-9">
          <Trash size="20" color="#000" />
          <Text className=" ml-2 font-medium">Cancel</Text>
        </Button>

        <Button className="flex-row items-center bg-leaves-100  h-9">
          <CalendarEdit size="20" color="#000" />
          <Text className=" ml-2 font-medium">Reschedule</Text>
        </Button>

        <Button className="flex-row items-center bg-blue-100/60  h-9">
          <MessageText size="20" color="#000" />
          <Text className=" ml-2 font-medium">Chats</Text>
        </Button>
      </View>
    </View>
  );
}
