import { View, Text, Dimensions, ScrollView, FlatList } from "react-native";
import React, { useState } from "react";
import { format } from "date-fns";
import colors from "@/utils/colors";
import { LineChart, ProgressChart } from "react-native-chart-kit";

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
import { H3 } from "@/components/ui/Typography";

export default function QualityOfLifeScaleRecord() {
  const chartConfig1 = {
    backgroundColor: "#fff",
    backgroundGradientFrom: "#fff",
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: "#fff",
    backgroundGradientToOpacity: 0,
    color: (opacity = 1) => `rgba(1, 40, 150, ${opacity})`,
    strokeWidth: 2, // optional, default 3
    barPercentage: 0.5,
    useShadowColorFromDataset: false, // optional
  };

  const chartConfig2 = {
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

  const data1 = {
    labels: ["Swim"], // optional
    data: [0.15],
  };

  const data2 = [
    {
      labels: ["January"],
      datasets: [
        {
          data: [20, 45, 28, 80, 99, 43],
          color: (opacity = 1) => colors.green[200], // optional
          strokeWidth: 2, // optional
          withDots: true,
        },
      ],
    },
    {
      labels: ["January"],
      datasets: [
        {
          data: [20, 45, 28, 80, 99, 43],
          color: (opacity = 1) => colors.green[200], // optional
          strokeWidth: 2, // optional
          withDots: true,
        },
      ],
    },
  ];

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1, gap: 8, paddingBottom: 20 }}
      className="bg-blue-50/10 flex flex-col gap-4 h-full w-full"
    >
      <View className="bg-white p-4 rounded-2xl relative flex-row w-full h-[150] justify-start items-center">
        <H3 className="text-xl w-1/3">Quality of life ratio</H3>
        <View className="absolute top-[60] right-[50] z-10 ">
          <Text className="text-3xl font-semibold text-blue-600 text-center">
            {data1.data[0] * 100}%
          </Text>
        </View>
        <View className=" rotate-[180deg]">
          <ProgressChart
            data={data1}
            width={Dimensions.get("window").width - 60}
            height={250}
            strokeWidth={18}
            radius={50}
            chartConfig={chartConfig1}
            hideLegend={true}
          />
        </View>
      </View>

      <FlatList
        data={data2}
        horizontal
        contentContainerClassName="gap-2"
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <View className="overflow-hidden rounded-xl bg-background p-4 w-[80%]">
            <Text className="text-lg font-semibold">Chart</Text>
            <LineChart
              data={item}
              width={240} // from react-native
              height={240}
              // withInnerLines={false}
              // withOuterLines={false}
              // withVerticalLabels={false}
              // withHorizontalLabels={false}
              yAxisInterval={1} // optional, defaults to 1
              chartConfig={chartConfig2}
              bezier
              style={{
                borderRadius: 0,
                display: "flex",
              }}
            />
          </View>
        )}
      />
    </ScrollView>
  );
}
