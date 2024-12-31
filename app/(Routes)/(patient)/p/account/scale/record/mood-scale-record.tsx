import { View, Text, Dimensions, ScrollView } from "react-native";
import React, { useState } from "react";
import { format } from "date-fns";
import colors from "@/utils/colors";
import { LineChart } from "react-native-chart-kit";

import { Button } from "@/components/ui/Button";
import { AddCircle, ArrowCircleDown } from "iconsax-react-native";
import { moodOptions } from "@/features/scale/constScale";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  DropdownMenuGroup,
  DropdownMenu,
  DropdownMenuShortcut,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/DropdownMenu";
import { toCapitalizeFirstLetter } from "@/utils/string.utils";
import { Calendar } from "@/components/ui/Calendar";

export default function MoodScaleRecord() {
  const [LastMoodOption, setLastMoodOption] = useState(moodOptions[1]);
  const [ActiveRecordType, setActiveRecordType] = useState<
    "weekly" | "monthly"
  >("weekly");
  
  const chartConfig = {
    backgroundColor: "#fff",
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    decimalPlaces: 2, // optional, defaults to 2dp
    color: (opacity = 1) => "#fff",
    labelColor: (opacity = 1) => "#000",
    style: {
      borderRadius: 20,
    },
    propsForDots: {
      r: "3",
      strokeWidth: "1",
    },
  };

  const data = {
    labels: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    datasets: [
      {
        data: [20, 30, 40, 50, 60, 70, 80],
        color: (opacity = 1) => colors.blue[100], // optional
        strokeWidth: 2, // optional
        withDots: true,
      },
      {
        data: [10, 15, 25, 35, 45, 55, 65],
        color: (opacity = 1) => colors.red[100], // optional
        strokeWidth: 2, // optional
        withDots: true,
      },
    ],
  };

  const legend = [
    { title: "Good mood", color: colors.blue[100] },
    { title: "Bad mood", color: colors.red[100] },
  ];

  const triggerRef =
    React.useRef<React.ElementRef<typeof DropdownMenuTrigger>>(null);
  const insets = useSafeAreaInsets();
  const contentInsets = {
    top: insets.top,
    bottom: insets.bottom,
    left: 12,
    right: 12,
  };

  const mostInfluentialFactors = {
    weekly: ["Sport", "Relationships", "Work", "Family"],
    monthly: ["Travel", "Health", "Work", "Hobbies"],
  };

  const [selectedDate, setSelectedDate] = useState("");
  const weeklyData = {
    labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    datasets: [
      {
        data: [3, 4, 3, 5, 2, 4, 4],
        color: () => colors.blue[400],
        strokeWidth: 2,
      },
      {
        data: [1, 2, 1, 3, 1, 2, 1],
        color: () => colors.red[400],
        strokeWidth: 2,
      },
    ],
  };

  const monthlyData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        data: [12, 15, 11, 14],
        color: () => colors.blue[400],
        strokeWidth: 2,
      },
      {
        data: [5, 7, 6, 4],
        color: () => colors.red[400],
        strokeWidth: 2,
      },
    ],
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1, gap: 8, paddingBottom: 20 }}
      className="bg-blue-50/10 flex flex-col gap-4 h-full w-full"
    >
      <View className="flex-col gap-2 justify-center items-center rounded-xl bg-background py-4 px-4">
        <View className="flex-1 gap-1 flex-row justify-between items-center w-full ">
          <Text className="text-lg font-semibold text-neutral-600">
            Last mood recording
          </Text>
          <Button className="flex-row gap-1" variant={"ghost"}>
            <AddCircle size="16" color={colors.gray[500]} />
            <Text className="text-sm font-medium text-neutral-600">
              Add a feeling
            </Text>
          </Button>
        </View>
        <Text className="text-xs w-full text-blue-500">
          {format(new Date(), " EE , dd MMM yyyy , hh:mm a")}
        </Text>
        <LastMoodOption.Icon height={60} width={60} />
        <Text className="text-sm font-medium text-neutral-600">
          {LastMoodOption.label}
        </Text>
      </View>

      <View className="overflow-hidden rounded-xl bg-background py-4 px-4">
        <Text className="text-lg font-semibold">Chart</Text>
        <LineChart
          data={data}
          width={Dimensions.get("window").width + 70} // from react-native
          height={140}
          withInnerLines={false}
          withOuterLines={false}
          withVerticalLabels={false}
          withHorizontalLabels={false}
          yAxisInterval={1} // optional, defaults to 1
          chartConfig={chartConfig}
          bezier
          style={{
            position: "relative",
            left: -60,
            borderRadius: 0,
            display: "flex",
          }}
        />
        {legend.map((dataset, index) => {
          return (
            <View key={index} className="flex flex-row items-center gap-2 py-1">
              <View
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: dataset.color }}
              ></View>
              <Text className="text-xs">{dataset.title}</Text>
            </View>
          );
        })}
      </View>

      <View className="flex-col gap-2">
        <View className="flex-row justify-between items-center">
          <Text className="text-lg font-semibold">Mood record </Text>
          <DropdownMenu>
            <DropdownMenuTrigger ref={triggerRef} asChild>
              <Button className="bg-primary-50/30 flex-row gap-2">
                <Text className="text-primary-500 font-semibold">
                  {toCapitalizeFirstLetter(ActiveRecordType)}{" "}
                </Text>
                <ArrowCircleDown size="20" color={colors.primary[500]} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent insets={contentInsets} className="w-28">
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onPress={() => {
                    setActiveRecordType("weekly");
                  }}
                >
                  <Text>Weekly</Text>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onPress={() => {
                    setActiveRecordType("monthly");
                  }}
                >
                  <Text>Monthly</Text>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </View>

        {ActiveRecordType === "weekly" ? (
          <View className="grid grid-cols-7 gap-2">
            {weeklyData.labels.map((day, index) => (
              <View
                key={index}
                className="flex items-center p-2 rounded-lg bg-blue-50/30 border-blue-600"
              >
                <Text className="text-sm text-neutral-600">{day}</Text>
                <Text className="text-xs text-neutral-400">Mood Data</Text>
              </View>
            ))}
          </View>
        ) : (
          <Calendar onDayPress={(day) => setSelectedDate(day.dateString)} />
        )}

        <View className="mt-4">
          {selectedDate && (
            <Text className="text-sm text-neutral-500">
              Selected Date: {format(new Date(selectedDate), "dd MMM yyyy")}
            </Text>
          )}
        </View>
      </View>

      {/* Influential Factors Section */}
      <View className="bg-white rounded-xl shadow p-4">
        <Text className="text-lg font-semibold text-neutral-700">
          The most influential factors on your mood
        </Text>
        <View className="grid grid-cols-2 gap-2 mt-4">
          {["Sport", "Relationships", "Work", "Family"].map((factor, index) => (
            <View
              key={index}
              className="flex items-center justify-center p-2 bg-blue-100 rounded-lg"
            >
              <Text className="text-sm font-medium text-neutral-600">
                {index + 1}. {factor}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
