import { View, Text, Dimensions, ScrollView, FlatList } from "react-native";
import React from "react";
import { format } from "date-fns";
import colors from "@/utils/colors";
import { LineChart, ProgressChart } from "react-native-chart-kit";

import { moodOptions } from "@/features/scale/constScale";
import { toCapitalizeFirstLetter } from "@/utils/string.utils";
import { H3 } from "@/components/ui/Typography";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/clerk-expo";

export default function QualityOfLifeScaleRecord() {
  const { user } = useUser();
  const userId = user?.publicMetadata.dbPatientId as string;
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
    decimalPlaces: 0, // optional, defaults to 2dp
    color: (opacity = 1) => "#aaa",
    labelColor: (opacity = 1) => "#000",
    style: {
      borderRadius: 20,
    },
    propsForDots: {
      r: "6",
      strokeWidth: "5",
      stroke: colors.primary[50],
    },
  };

  const data1 = {
    labels: ["Swim"], // optional
    data: [0.15],
  };

  const data2 = [
    {
      labels: ["January", "February", "March"],
      datasets: [
        {
          data: [20, 45, 28, 80, 99, 43],
          color: (opacity = 1) => "#000", // optional
          strokeWidth: 2, // optional
          withDots: true,
        },
      ],
    },
    {
      labels: ["January", "February", "March"],
      datasets: [
        {
          data: [20, 45, 28, 80, 99, 43],
          color: (opacity = 1) => "#000", // optional
          strokeWidth: 2, // optional
          withDots: true,
        },
      ],
    },
  ];

  const feelingData = [
    {
      felling: "good",
      date: "2022-01-01",
      positive_feeling: ["happy", "joyful"],
      negative_feeling: ["sad", "angry"],
    },
    {
      felling: "bad",
      date: "2022-01-01",
      positive_feeling: ["happy", "joyful"],
      negative_feeling: ["sad", "angry"],
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
        showsHorizontalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <View className="overflow-hidden rounded-xl bg-background p-4 ">
            <Text className="text-lg font-semibold">Chart</Text>
            <LineChart
              data={item}
              width={240} // from react-native
              height={240}
              withInnerLines={true}
              withOuterLines={false}
              withVerticalLabels={false}
              withVerticalLines={false}
              // withHorizontalLabels={false}
              yAxisInterval={1} // optional, defaults to 1
              yAxisSuffix=" %"
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

      <View className="rounded-xl bg-background p-4">
        <Text className="text-lg font-semibold">Feeling Details</Text>
        {feelingData.map((item, index) => {
          const Mood = moodOptions.find((mood) => mood.label === item.felling);

          if (!Mood) return null;
          return (
            <View
              key={index}
              className="border-l p-8 pl-12 ml-8 flex-col gap-2 relative"
            >
              <Mood.Icon className="w-8 h-8 absolute top-4 left-8" />
              <Text
                className={cn("text-lg font-semibold")}
                style={{ color: Mood?.color }}
              >
                {toCapitalizeFirstLetter(item.felling)}
                <Text className="text-sm font-normal text-neutral-700">
                  {"    ( " +
                    format(item.date, "EEE , dd-mm-yy , hh:mm a") +
                    " )    "}
                </Text>
              </Text>

              <Text className=" font-semibold">Positive Feeling</Text>

              <Text className="text-sm font-medium text-neutral-700">
                {item.positive_feeling.map((item2, index) => (
                  <React.Fragment key={index}>
                    {toCapitalizeFirstLetter(item2)}
                    {index !== item.positive_feeling.length - 1 ? ", " : ""}
                  </React.Fragment>
                ))}
              </Text>

              <Text className=" font-semibold">Negative Feeling</Text>
              <Text className="text-sm font-medium text-neutral-700">
                {item.negative_feeling.map((item2, index) => (
                  <React.Fragment key={index}>
                    {toCapitalizeFirstLetter(item2)}
                    {index !== item.positive_feeling.length - 1 ? ", " : ""}
                  </React.Fragment>
                ))}
              </Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}
