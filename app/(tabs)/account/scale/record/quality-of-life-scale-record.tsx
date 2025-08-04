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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchLifeScale = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${apiNewUrl}/api/life_scale/get/${userId}`);

        if (!res.ok) {
          throw new Error(`Failed to fetch data: ${res.status}`);
        }

        const data = await res.json();

        // Ensure data is an array
        if (Array.isArray(data)) {
          setLifeScaleData(data);
        } else {
          console.warn("API returned non-array data:", data);
          setLifeScaleData([]);
        }
      } catch (err) {
        console.error("Error fetching life scale data", err);
        setError(err.message);
        setLifeScaleData([]);
      } finally {
        setLoading(false);
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

  // Safe data access for progress chart
  const getProgressData = () => {
    if (lifeScaleData.length === 0) {
      return { labels: ["No Data"], data: [0] };
    }

    const firstRecord = lifeScaleData[0];
    if (!firstRecord?.activity || firstRecord.activity.length === 0) {
      return { labels: ["No Data"], data: [0] };
    }

    const score = firstRecord.activity[0]?.score || 0;
    return {
      labels: ["Quality of Life"],
      data: [score / 100],
    };
  };

  const progressData = getProgressData();

  // Safe chart data formatting
  const getChartData = () => {
    if (lifeScaleData.length === 0) {
      return {
        labels: ["No Data"],
        datasets: [
          {
            data: [0],
            color: (opacity = 1) => `rgba(34,197,94,${opacity})`,
            strokeWidth: 2,
          },
        ],
      };
    }

    const chartDataFromDB = lifeScaleData.slice(-6).map((record) => {
      const label = new Date(record.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      });

      if (!record.activity || record.activity.length === 0) {
        return { label, score: 0 };
      }

      const activityScores = record.activity
        .map((item) => item.score || 0)
        .filter((score) => typeof score === "number");

      const averageScore =
        activityScores.length > 0
          ? activityScores.reduce((sum, val) => sum + val, 0) /
            activityScores.length
          : 0;

      return { label, score: averageScore };
    });

    return {
      labels: chartDataFromDB.map((item) => item.label),
      datasets: [
        {
          data: chartDataFromDB.map((item) => item.score),
          color: (opacity = 1) => `rgba(34,197,94,${opacity})`,
          strokeWidth: 2,
        },
      ],
    };
  };

  const chartData = getChartData();

  // Loading state
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-blue-50/10">
        <Text className="text-lg">Loading quality of life data...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-blue-50/10 p-4">
        <Text className="text-lg text-red-600 text-center mb-2">
          Error loading data
        </Text>
        <Text className="text-sm text-gray-600 text-center">{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1, gap: 8, paddingBottom: 20 }}
      className="bg-blue-50/10 flex flex-col gap-4 h-full w-full"
    >
      <View className="bg-white p-4 rounded-2xl relative flex-row w-full h-[150] justify-start items-center">
        <H3 className="text-xl w-1/3">Quality of life ratio</H3>
        <View className="absolute top-[60] right-[50] z-10">
          <Text className="text-3xl font-semibold text-blue-600 text-center">
            {Math.round(progressData.data[0] * 100)}%
          </Text>
        </View>
        <View className="rotate-[180deg]">
          <ProgressChart
            data={progressData}
            width={Dimensions.get("window").width - 60}
            height={250}
            strokeWidth={18}
            radius={50}
            chartConfig={chartConfig1}
            hideLegend={true}
          />
        </View>
      </View>

      <View className="overflow-hidden rounded-xl bg-white p-4">
        <Text className="text-lg font-semibold mb-2">Quality Trend</Text>
        <LineChart
          data={chartData}
          width={Dimensions.get("window").width - 32}
          height={240}
          withInnerLines={true}
          withOuterLines={false}
          withVerticalLabels={false}
          withVerticalLines={false}
          yAxisInterval={1}
          yAxisSuffix=" %"
          chartConfig={chartConfig2}
          bezier
          style={{
            borderRadius: 0,
          }}
        />
      </View>

      {lifeScaleData.length > 0 && (
        <View className="rounded-xl bg-white p-4">
          <Text className="text-lg font-semibold mb-2">Feeling Details</Text>

          {lifeScaleData.map((item, index) => {
            if (!item || !item.mood) return null;

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
                      format(
                        new Date(item.createdAt),
                        "EEE , dd-MM-yy , hh:mm a"
                      ) +
                      " )    "}
                  </Text>
                </Text>

                <Text className="font-semibold">Best Activities</Text>
                <Text className="text-sm font-medium text-neutral-700">
                  {item.activity && item.activity.length > 0
                    ? item.activity
                        .filter((a) => a?.type === "bestForMe" && a?.reason)
                        .map((a, i, arr) => (
                          <React.Fragment key={i}>
                            {toCapitalizeFirstLetter(a.reason)}
                            {i !== arr.length - 1 ? ", " : ""}
                          </React.Fragment>
                        ))
                    : "No activities recorded"}
                </Text>

                <Text className="font-semibold">Worst Activities</Text>
                <Text className="text-sm font-medium text-neutral-700">
                  {item.activity && item.activity.length > 0
                    ? item.activity
                        .filter((a) => a?.type === "worstForMe" && a?.reason)
                        .map((a, i, arr) => (
                          <React.Fragment key={i}>
                            {toCapitalizeFirstLetter(a.reason)}
                            {i !== arr.length - 1 ? ", " : ""}
                          </React.Fragment>
                        ))
                    : "No activities recorded"}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}
