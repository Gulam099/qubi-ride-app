import {
  View,
  Text,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect } from "react";
import { H3 } from "@/components/ui/Typography";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { LineChart } from "react-native-chart-kit";
import colors from "@/utils/colors";
import { format } from "date-fns";
import { ArrowLeft, ArrowRight } from "iconsax-react-native";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { apiNewUrl } from "@/const";
import Drawer from "@/components/ui/Drawer";
import { useTranslation } from "react-i18next";
import i18n from "@/lib/i18n";

export default function ScaleRecordPage() {
  const router = useRouter();
  const { user } = useUser();
  const userId = user?.publicMetadata.dbPatientId as string;
  const { t } = useTranslation();

  // State management
  const [isListActive, setIsListActive] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recordActive, setRecordActive] = useState(null);

  // Data states for all scales
  const [gadRecords, setGadRecords] = useState([]);
  const [moodRecords, setMoodRecords] = useState([]);
  const [depressionRecords, setDepressionRecords] = useState([]);
  const [lifeScaleRecords, setLifeScaleRecords] = useState([]);

  // Combined records for display
  const [allRecords, setAllRecords] = useState([]);
  const [lastMeasure, setLastMeasure] = useState(null);

  const currentLanguage = i18n.language;

  // Chart configuration
  const chartConfig = {
    backgroundColor: "#fff",
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    decimalPlaces: 2,
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

  // Fetch all scale data
  useEffect(() => {
    if (userId) {
      fetchAllScaleData();
    }
  }, [userId]);

  const fetchAllScaleData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch all scale data in parallel
      const [gadResponse, moodResponse, depressionResponse, lifeResponse] =
        await Promise.all([
          fetch(`${apiNewUrl}/api/gad-scale/user/${userId}?page=1`),
          fetch(`${apiNewUrl}/api/mood-scale/${userId}?page=1`),
          fetch(`${apiNewUrl}/api/depression-scale/user/${userId}?page=1`),
          fetch(`${apiNewUrl}/api/life_scale/get/${userId}`),
        ]);

      // Parse responses
      const gadData = await gadResponse.json();
      const moodData = await moodResponse.json();
      const depressionData = await depressionResponse.json();
      const lifeData = await lifeResponse.json();

      // Set individual scale data
      const gadRecordsData = gadData.responses || [];
      const moodRecordsData = moodData.responses || [];
      const depressionRecordsData = depressionData.responses || [];
      const lifeRecordsData = Array.isArray(lifeData) ? lifeData : [];

      setGadRecords(gadRecordsData);
      setMoodRecords(moodRecordsData);
      setDepressionRecords(depressionRecordsData);
      setLifeScaleRecords(lifeRecordsData);

      // Combine and sort all records
      const combined = [
        ...gadRecordsData.map((record) => ({
          ...record,
          type: t("Generalized Anxiety Disorder"),
          scale: "GAD",
          record_Id: `gad_${record._id}`,
          title: `${t("GAD Scale")} - ${t("Score")}: ${record.score}`,
          desc: getAnxietyLevel(record.score),
          date: new Date(record.createdAt),
          color: colors.green[200],
        })),
        ...moodRecordsData.map((record) => ({
          ...record,
          type: t("Mood scale"),
          scale: "MOOD",
          record_Id: `mood_${record._id}`,
          title: `${t("Mood scale")} - ${t(record.mood)}`,
          desc: `${t("Score")}: ${record.score}`,
          date: new Date(record.createdAt),
          color: colors.red[200],
        })),
        ...depressionRecordsData.map((record) => ({
          ...record,
          type: t("Depression scale"),
          scale: "DEPRESSION",
          record_Id: `depression_${record._id}`,
          title: `${t("Depression scale")} - ${t("Score")}: ${record.score}`,
          desc: getAnxietyLevel(record.score),
          date: new Date(record.createdAt),
          color: colors.orange[300],
        })),
        ...lifeRecordsData.map((record) => {
          // Extract average score from activity array
          let averageScore = 0;
          if (
            record.activity &&
            Array.isArray(record.activity) &&
            record.activity.length > 0
          ) {
            const activityScores = record.activity
              .map((item) => item.score || 0)
              .filter((score) => score > 0);

            if (activityScores.length > 0) {
              averageScore = Math.round(
                activityScores.reduce((sum, score) => sum + score, 0) /
                  activityScores.length
              );
            }
          }

          return {
            ...record,
            score: averageScore,
            type: t("Quality of Life Scale"),
            scale: "LIFE",
            record_Id: `life_${record._id}`,
            title: `${t("Quality of Life")} - ${t("Score")}: ${averageScore}%`,
            desc: `${t("Mood")}: ${record.mood || "Not specified"}`,
            date: new Date(record.createdAt || record.updatedAt),
            color: colors.blue[200],
          };
        }),
      ].sort((a, b) => b.date - a.date);

      setAllRecords(combined);

      // Set last measure
      if (combined.length > 0) {
        setLastMeasure(combined[0]);
      }
    } catch (err) {
      console.error("Error fetching scale data:", err);
      setError("Failed to load scale data");
    } finally {
      setLoading(false);
    }
  };

  const getAnxietyLevel = (score) => {
    if (score < 5) return "Minimal";
    if (score < 10) return "Mild";
    if (score < 15) return "Moderate";
    return "Severe";
  };

  // Generate chart data from last 6 months
  const generateChartData = () => {
    const last6Months = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      last6Months.push({
        label: format(date, "MMM"),
        month: date.getMonth(),
        year: date.getFullYear(),
      });
    }

    const datasets = [];

    // GAD Dataset - score is directly available
    const gadData = [];
    last6Months.forEach((monthInfo) => {
      const gadMonthRecords = gadRecords.filter((record) => {
        const recordDate = new Date(record.createdAt);
        return (
          recordDate.getMonth() === monthInfo.month &&
          recordDate.getFullYear() === monthInfo.year
        );
      });
      const gadAvg =
        gadMonthRecords.length > 0
          ? gadMonthRecords.reduce((sum, r) => sum + (r.score || 0), 0) /
            gadMonthRecords.length
          : 0;
      gadData.push(Math.round(gadAvg));
    });

    if (gadData.some((val) => val > 0)) {
      datasets.push({
        data: gadData,
        color: (opacity = 1) => colors.green[200],
        strokeWidth: 2,
        withDots: true,
      });
    }

    // Depression Dataset - score is directly available
    const depressionData = [];
    last6Months.forEach((monthInfo) => {
      const depressionMonthRecords = depressionRecords.filter((record) => {
        const recordDate = new Date(record.createdAt);
        return (
          recordDate.getMonth() === monthInfo.month &&
          recordDate.getFullYear() === monthInfo.year
        );
      });
      const depressionAvg =
        depressionMonthRecords.length > 0
          ? depressionMonthRecords.reduce((sum, r) => sum + (r.score || 0), 0) /
            depressionMonthRecords.length
          : 0;
      depressionData.push(Math.round(depressionAvg));
    });

    if (depressionData.some((val) => val > 0)) {
      datasets.push({
        data: depressionData,
        color: (opacity = 1) => colors.orange[300],
        strokeWidth: 2,
        withDots: true,
      });
    }

    // Mood Dataset - score is directly available
    const moodData = [];
    last6Months.forEach((monthInfo) => {
      const moodMonthRecords = moodRecords.filter((record) => {
        const recordDate = new Date(record.createdAt);
        return (
          recordDate.getMonth() === monthInfo.month &&
          recordDate.getFullYear() === monthInfo.year
        );
      });
      const moodAvg =
        moodMonthRecords.length > 0
          ? moodMonthRecords.reduce((sum, r) => sum + (r.score || 0), 0) /
            moodMonthRecords.length
          : 0;
      moodData.push(Math.round(moodAvg));
    });

    if (moodData.some((val) => val > 0)) {
      datasets.push({
        data: moodData,
        color: (opacity = 1) => colors.red[200],
        strokeWidth: 2,
        withDots: true,
      });
    }

    // Life Quality Dataset - need to extract score from activity array
    const lifeData = [];
    last6Months.forEach((monthInfo) => {
      const lifeMonthRecords = lifeScaleRecords.filter((record) => {
        const recordDate = new Date(record.createdAt || record.updatedAt);
        return (
          recordDate.getMonth() === monthInfo.month &&
          recordDate.getFullYear() === monthInfo.year
        );
      });

      let totalScore = 0;
      let recordCount = 0;

      lifeMonthRecords.forEach((record) => {
        if (
          record.activity &&
          Array.isArray(record.activity) &&
          record.activity.length > 0
        ) {
          // Calculate average score from activity array
          const activityScores = record.activity
            .map((item) => item.score || 0)
            .filter((score) => score > 0);

          if (activityScores.length > 0) {
            const avgScore =
              activityScores.reduce((sum, score) => sum + score, 0) /
              activityScores.length;
            totalScore += avgScore;
            recordCount++;
          }
        }
      });

      const lifeAvg = recordCount > 0 ? totalScore / recordCount : 0;
      lifeData.push(Math.round(lifeAvg));
    });

    if (lifeData.some((val) => val > 0)) {
      datasets.push({
        data: lifeData,
        color: (opacity = 1) => colors.blue[200],
        strokeWidth: 2,
        withDots: true,
      });
    }

    // If no data, return default structure
    if (datasets.length === 0) {
      return {
        labels: last6Months.map((m) => m.label),
        datasets: [
          {
            data: [0, 0, 0, 0, 0, 0],
            color: (opacity = 1) => colors.gray[400],
            strokeWidth: 2,
            withDots: true,
          },
        ],
      };
    }

    return {
      labels: last6Months.map((m) => m.label),
      datasets: datasets,
    };
  };

  const handleRecordActive = (record_Id) => {
    const record = allRecords.find((item) => item.record_Id === record_Id);
    setRecordActive(record);
    setIsDrawerVisible(true);
  };

  const legend = [
    {
      title: t("Generalized Anxiety Disorder scale"),
      color: colors.green[200],
    },
    { title: t("Mood scale"), color: colors.red[200] },
    { title: t("Quality of Life Scale"), color: colors.blue[200] },
    { title: t("Depression scale"), color: colors.orange[300] },
  ];

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-blue-50/10">
        <ActivityIndicator size="large" color={colors.primary[500]} />
        <Text className="mt-4 text-lg text-neutral-600">{t("Loading")}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-blue-50/10 p-4">
        <Text className="text-lg text-red-600 text-center mb-2">
          {t("errorTitle")}
        </Text>
        <Text className="text-sm text-gray-600 text-center">{error}</Text>
        <Button onPress={fetchAllScaleData} className="mt-4">
          <Text>{t("Retry")}</Text>
        </Button>
      </View>
    );
  }

  const chartData = generateChartData();

  return (
    <>
      {!isListActive ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, gap: 8, paddingBottom: 20 }}
          className="bg-blue-50/10 flex flex-col gap-4 h-full w-full"
        >
          {/* Last Measure Section */}
          {lastMeasure && (
            <Text className="text-lg font-semibold text-neutral-600">
              {t("Last measure")} :{" "}
              <Text className="text-lg text-blue-900">
                {t(lastMeasure.type)}
              </Text>
            </Text>
          )}

          {/* Latest Result Card */}
          {lastMeasure && (
            <View className="flex-row gap-2 justify-center items-center rounded-xl bg-background py-4 px-4">
              <View className="flex-1 gap-1">
                <Text className="text-lg font-semibold">
                  {lastMeasure.title}
                </Text>
                <Text className="text-xs">{lastMeasure.type}</Text>
                <Text className="text-xs">
                  {format(lastMeasure.date, "dd-MM-yyyy")}
                </Text>
                <Text className="text-sm font-medium">{lastMeasure.desc}</Text>
              </View>
              <View className="flex-col justify-center items-center gap-3 bg-blue-600 aspect-square w-1/3 rounded-xl p-2">
                <Text className="text-white text-xs text-center">
                  {t("Latest Score")}
                </Text>
                <Text className="text-white text-4xl text-center">
                  {lastMeasure.score}
                </Text>
              </View>
            </View>
          )}

          {/* Chart Section */}
          {chartData.datasets.length > 0 && (
            <View className="overflow-hidden rounded-xl bg-background py-4 px-4">
              <Text className="text-lg font-semibold">{t("Chart")}</Text>
              <LineChart
                data={chartData}
                width={Dimensions.get("window").width + 70}
                height={140}
                withInnerLines={false}
                withOuterLines={false}
                withVerticalLabels={false}
                withHorizontalLabels={false}
                yAxisInterval={1}
                chartConfig={chartConfig}
                bezier
                style={{
                  position: "relative",
                  left: -60,
                  borderRadius: 0,
                  display: "flex",
                }}
              />
              {legend.map((dataset, index) => (
                <View
                  key={index}
                  className="flex flex-row items-center gap-2 py-1"
                >
                  <View
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: dataset.color }}
                  />
                  <Text className="text-xs">{dataset.title}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Records Section */}
          <View className="flex-col rounded-xl bg-background py-4 px-4">
            <View className="flex-row">
              <Text className="text-lg font-semibold flex-1">
                {t("Record")}
              </Text>
              <TouchableOpacity
                onPress={() => setIsListActive(true)}
                className="flex-row items-center justify-center gap-1"
              >
                <Text className="text-sm font-semibold text-end text-primary-500">
                  {t("View all")}
                </Text>
                {currentLanguage === "ar" ? (
                  <ArrowLeft size="20" color={colors.primary[500]} />
                ) : (
                  <ArrowRight size="20" color={colors.primary[500]} />
                )}
              </TouchableOpacity>
            </View>
            <View className="flex-col h-full gap-2">
              {allRecords.slice(0, 4).map((record, index) => (
                <View key={record.record_Id} className="flex-row gap-2 py-2">
                  <View className="flex-1 gap-1">
                    <Text className="text-base font-semibold">
                      {record.title}
                    </Text>
                    {/* <Text className="text-xs">{record.desc}</Text> */}
                  </View>
                  <View className="w-1/4">
                    <Text className="text-xs">
                      {format(record.date, "dd-MM-yyyy")}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      ) : (
        <View className="bg-blue-50/10 flex flex-col gap-4">
          <FlatList
            data={allRecords}
            contentContainerClassName="gap-2"
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                key={item.record_Id}
                onPress={() => handleRecordActive(item.record_Id)}
                className="flex flex-row justify-between items-center bg-white border rounded-2xl border-blue-600 gap-2 overflow-hidden h-20"
              >
                <View
                  className="w-6 h-20 flex-col justify-center items-center"
                  style={{ backgroundColor: item.color }}
                >
                  <Text className="text-white font-semibold text-center text-sm">
                    {index + 1}
                  </Text>
                </View>
                <View className="flex-1 p-2">
                  <Text className="text-lg font-medium leading-5">
                    {item.title}
                  </Text>
                  <Text className="text-xs">{t(item.desc)}</Text>
                </View>
                <View className="px-4">
                  <Text className="text-sm">
                    {format(item.date, "dd-MM-yyyy")}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />

          {/* Drawer for Record Details */}
          <View className="flex-1 justify-center items-center mt-10 mb-20">
            <Drawer
              visible={isDrawerVisible}
              onClose={() => setIsDrawerVisible(false)}
              title={t("Record Details")}
              height="40%"
              className="max-h-[40%]"
            >
              {recordActive && (
                <View className="flex flex-col flex-1 justify-center items-center w-full gap-6 px-6">
                  <Text className="text-xl font-semibold text-neutral-600">
                    {t("Details")}
                  </Text>
                  <View className="flex-col justify-center items-center gap-3 bg-blue-900 aspect-square w-1/3 rounded-xl p-2">
                    <Text className="text-white text-xs text-center">
                      {t("Score")}
                    </Text>
                    <Text className="text-white text-4xl text-center">
                      {recordActive.score}
                    </Text>
                  </View>
                  <Text className="text-xs">
                    {format(recordActive.date, "dd-MM-yyyy")}
                  </Text>
                  <Text className="text-xl font-semibold text-neutral-600 text-center">
                    {recordActive.desc}
                  </Text>
                  <Text className="text-sm text-neutral-500 text-center">
                    {recordActive.type}
                  </Text>
                </View>
              )}
            </Drawer>
          </View>
        </View>
      )}
    </>
  );
}
