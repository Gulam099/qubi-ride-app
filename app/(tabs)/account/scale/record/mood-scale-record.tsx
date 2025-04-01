import { View, Text, Dimensions, ScrollView } from "react-native";
import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import colors from "@/utils/colors";
import { LineChart } from "react-native-chart-kit";
import { Button } from "@/components/ui/Button";
import { AddCircle, ArrowCircleDown } from "iconsax-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Calendar } from "@/components/ui/Calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/DropdownMenu";
import { toCapitalizeFirstLetter } from "@/utils/string.utils";
import { apiBaseUrl } from "@/features/Home/constHome";
import { moodOptions } from "@/features/scale/constScale";
import { useUser } from "@clerk/clerk-expo";

export default function MoodScaleRecord() {
  const [LastMoodOption, setLastMoodOption] = useState(null);
  const [ActiveRecordType, setActiveRecordType] = useState<
    "weekly" | "monthly"
  >("weekly");
  const [markedDates, setMarkedDates] = useState({});
  const [selectedDate, setSelectedDate] = useState("");
  const [moodRecords, setMoodRecords] = useState([]);
  const [chartData, setChartData] = useState({ weekly: [], monthly: [] });
  const { user } = useUser();
  const userId = user?.publicMetadata.dbPatientId as string;

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

  // Fetch mood scale data from API
  const fetchMoodScaleData = async () => {
    try {
      const response = await fetch(
        `${apiBaseUrl}/api/mood-scale/${userId}?page=1`
      );
      const data = await response.json();

      if (response && data.responses) {
        setMoodRecords(data.responses);

        // Set last mood record
        const lastMood = data.responses[0];
        if (lastMood) {
          const moodOption = moodOptions.find(
            (option) =>
              option.label.toLowerCase() === lastMood.mood.toLowerCase()
          );
          setLastMoodOption({ ...lastMood, Icon: moodOption?.Icon || null });
        }

        // Generate markedDates for the calendar
        const marks = {};
        data.responses.forEach((record:any) => {
          const date = record.createdAt.split("T")[0];
          marks[date] = { marked: true };
        });
        setMarkedDates(marks);

        // Prepare chart data for weekly and monthly records
        const weekly = Array(7).fill(0); // For weekly chart
        const monthly = Array(4).fill(0); // For monthly chart (assuming 4 weeks)

        data.responses.forEach((record) => {
          const day = new Date(record.createdAt).getDay(); // Get weekday (0 - 6)
          const week = Math.floor(new Date(record.createdAt).getDate() / 7); // Estimate week number
          weekly[day] += record.score; // Aggregate weekly scores
          if (week < 4) monthly[week] += record.score; // Aggregate monthly scores
        });

        setChartData({ weekly, monthly });
      }
    } catch (error) {
      console.error("Error fetching mood scale data:", error);
    }
  };

  useEffect(() => {
    fetchMoodScaleData();
  }, []);

  const filteredRecords = selectedDate
    ? moodRecords.filter((record) => record.createdAt.startsWith(selectedDate))
    : moodRecords;

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1, gap: 8, paddingBottom: 20 }}
      className="bg-blue-50/10 flex flex-col gap-4 h-full w-full"
    >
      {/* Last Mood Recording */}
      {LastMoodOption && (
        <View className="flex-col gap-2 justify-center items-center rounded-xl bg-background py-4 px-4">
          <View className="flex-1 gap-1 flex-row justify-between items-center w-full">
            <Text className="text-lg font-semibold text-neutral-600">
              Last mood recording
            </Text>
            <View className="flex-row gap-2 justify-center items-center">
              <AddCircle size="16" color={colors.gray[500]} />
              <Text className="text-sm font-medium text-neutral-600 leading-7 text-center">
                Add a feeling
              </Text>
            </View>
          </View>
          <Text className="text-xs w-full text-blue-500">
            {format(
              new Date(LastMoodOption.createdAt),
              "EE, dd MMM yyyy, hh:mm a"
            )}
          </Text>
          <LastMoodOption.Icon height={60} width={60} />
          <Text className="text-sm font-medium text-neutral-600">
            {LastMoodOption.mood}
          </Text>
        </View>
      )}

      {/* Mood Chart */}
      <View className="overflow-hidden rounded-xl bg-background py-4 px-4">
        <Text className="text-lg font-semibold">Chart</Text>
        { (chartData.weekly.length != 0 || chartData.monthly.length != 0) &&  
         <LineChart
          data={{
            labels:
              ActiveRecordType === "weekly"
                ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
                : ["Week 1", "Week 2", "Week 3", "Week 4"],
            datasets: [
              {
                data:
                  ActiveRecordType === "weekly"
                    ? chartData.weekly
                    : chartData.monthly,
                color: () => colors.blue[400],
                strokeWidth: 2,
              },
            ],
          }}
          width={Dimensions.get("window").width + 70}
          height={140}
          chartConfig={chartConfig}
          bezier
          withInnerLines={false}
          withOuterLines={false}
          withVerticalLabels={false}
          withHorizontalLabels={false}
          yAxisInterval={1}
          style={{
            position: "relative",
            left: -60,
            borderRadius: 0,
            display: "flex",
          }}
        /> 
        }
      </View>

      {/* Calendar */}
      <View className="flex-col gap-2">
        <View className="flex-row justify-between items-center">
          <Text className="text-lg font-semibold">Mood record</Text>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-primary-50/30 flex-row gap-2">
                <Text className="text-primary-500 font-semibold">
                  {toCapitalizeFirstLetter(ActiveRecordType)}
                </Text>
                <ArrowCircleDown size="20" color={colors.primary[500]} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-28">
              <DropdownMenuItem onPress={() => setActiveRecordType("weekly")}>
                <Text>Weekly</Text>
              </DropdownMenuItem>
              <DropdownMenuItem onPress={() => setActiveRecordType("monthly")}>
                <Text>Monthly</Text>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </View>
        <Calendar
          onDayPress={(day) => setSelectedDate(day.dateString)}
          markedDates={{
            ...markedDates,
            [selectedDate]: { selected: true },
          }}
        />
      </View>

      {/* Selected Date Records */}
      {selectedDate && (
        <View className="bg-white rounded-xl p-4 mt-4">
          <Text className="text-lg font-semibold text-neutral-700">
            Mood Records
          </Text>
          {filteredRecords.map((record) => (
            <View key={record._id} className="mt-2">
              <Text className="text-sm text-neutral-600">
                Mood: {record.mood}
              </Text>
              <Text className="text-sm text-neutral-600">
                Reasons: {record.reasons.join(", ")}
              </Text>
              <Text className="text-sm text-neutral-600">
                Score: {record.score}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
