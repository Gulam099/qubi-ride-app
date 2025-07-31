import { View, Text, Dimensions, ScrollView, FlatList } from "react-native";
import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import colors from "@/utils/colors";
import { LineChart, ProgressChart } from "react-native-chart-kit";

import { moodOptions } from "@/features/scale/constScale";
import { toCapitalizeFirstLetter } from "@/utils/string.utils";
import { H3 } from "@/components/ui/Typography";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/clerk-expo";
import { apiBaseUrl } from "@/features/Home/constHome";
import { apiNewUrl } from "@/const";

export default function QualityOfLifeScaleRecord() {
  const { user } = useUser();
  const userId = user?.publicMetadata.dbPatientId as string;
  const [lifeScaleData, setLifeScaleData] = useState([]);

  console.log('lifeScaleData',lifeScaleData)

  useEffect(() => {
    if (!userId) return;
    const fetchLifeScale = async () => {
      try {
        const res = await fetch(`${apiNewUrl}/api/life_scale/get/${userId}`);
        const data = await res.json();
        setLifeScaleData(data); // Assuming array of mood scale entries
      } catch (err) {
        console.error("Error fetching life scale data", err);
      }
    };

    fetchLifeScale();
  }, [userId]);


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
    data: [lifeScaleData[0]?.activity?.[0]?.score / 100 || 0],
  };

// Step 1: Format DB data to chart format
const chartDataFromDB = lifeScaleData.slice(-6).map(record => {
  const label = new Date(record.createdAt).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });

  const activityScores = record.activity.map(item => item.score || 0);
  const averageScore =
    activityScores.reduce((sum, val) => sum + val, 0) / activityScores.length || 0;

  return {
    label,
    score: averageScore,
  };
});

// Step 2: Wrap in format similar to your old `data2`
const formattedChartData = [
  {
    labels: chartDataFromDB.map(item => item.label),
    datasets: [
      {
        data: chartDataFromDB.map(item => item.score),
        color: (opacity = 1) => `rgba(34,197,94,${opacity})`, // green
        strokeWidth: 2,
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
        data={formattedChartData}
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
        <Text className="text-lg font-semibold mb-2">Feeling Details</Text>

        {lifeScaleData.map((item, index) => {
          const Mood = moodOptions.find((mood) => mood.label === item.mood);
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
                {toCapitalizeFirstLetter(item.mood)}
                <Text className="text-sm font-normal text-neutral-700">
                  {"    ( " +
                    format(new Date(item.createdAt), "EEE , dd-MM-yy , hh:mm a") +
                    " )    "}
                </Text>
              </Text>

              <Text className=" font-semibold">Best Activities</Text>
              <Text className="text-sm font-medium text-neutral-700">
                {item.activity
                  .filter((a) => a.type === "bestForMe")
                  .map((a, i, arr) => (
                    <React.Fragment key={i}>
                      {toCapitalizeFirstLetter(a.reason)}
                      {i !== arr.length - 1 ? ", " : ""}
                    </React.Fragment>
                  ))}
              </Text>

              <Text className=" font-semibold">Worst Activities</Text>
              <Text className="text-sm font-medium text-neutral-700">
                {item.activity
                  .filter((a) => a.type === "worstForMe")
                  .map((a, i, arr) => (
                    <React.Fragment key={i}>
                      {toCapitalizeFirstLetter(a.reason)}
                      {i !== arr.length - 1 ? ", " : ""}
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
