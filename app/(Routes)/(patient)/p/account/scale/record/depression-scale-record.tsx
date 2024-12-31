import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from "react-native";
import React, { useState } from "react";
import { RecordListData } from "@/features/scale/constScale";
import { Button } from "@/components/ui/Button";
import Drawer from "@/components/ui/Drawer";
import { H3 } from "@/components/ui/Typography";
import { format } from "date-fns";
import { ProgressChart } from "react-native-chart-kit";
import colors from "@/utils/colors";
import { ArrowRight } from "iconsax-react-native";

export default function DepressionScaleRecord() {
  const [RecordList, setRecordList] = useState(RecordListData);
  const [isListActive, setIsListActive] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [RecordActive, setRecordActive] = useState<any>(RecordListData[0]);

  function handleRecordActive(record_Id: string) {
    setRecordActive(
      RecordListData.find((item) => item.record_Id === record_Id)
    );
    setIsDrawerVisible(true);
  }

  if (RecordActive === null) {
    return <Text>Record Active is null</Text>;
  }

  // each value represents a goal ring in Progress chart
  const data = {
    labels: ["Swim"], // optional
    data: [0.15],
  };

  // const chartConfig = {
  //   backgroundColor: "#fff",
  //   backgroundGradientFrom: "#fff",
  //   backgroundGradientTo: "#fff",
  //   decimalPlaces: 2, // optional, defaults to 2dp
  //   color: (opacity = 1) => "#fff",
  //   labelColor: (opacity = 1) => "#000",
  //   style: {
  //     borderRadius: 20,
  //   },
  //   propsForDots: {
  //     r: "3",
  //     strokeWidth: "1",
  //   },
  // };
  const chartConfig = {
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

  return (
    <>
      {!isListActive ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, gap: 8, paddingBottom: 20 }}
          className="bg-blue-50/10 flex flex-col gap-4 h-full w-full"
        >
          <View className="bg-white p-4 rounded-2xl relative h-[400]">
            <H3 className="text-xl">Last Result</H3>
            <View className="absolute top-[140] left-[155] z-10">
              <Text className=" text-blue-600 font-semibold  w-20 text-center">
                Severe Depression
              </Text>
              <Text className="text-3xl font-semibold text-blue-600 text-center">
                {data.data[0] * 100}
              </Text>
            </View>
            <ProgressChart
              data={data}
              width={Dimensions.get("window").width - 60}
              height={250}
              strokeWidth={18}
              radius={60}
              chartConfig={chartConfig}
              hideLegend={true}
            />
            <Text className="text-sm text-neutral-500">
              We encourage you to take care of your mental health and seek a
              session as soon as possible for meditation to help alleviate
              depression and achieve mental relaxation. Remember that you are
              not alone on this journey, and we are here at Baserah to assist
              you.
            </Text>
          </View>

          <View className="flex-col rounded-xl bg-background py-4 px-4 ">
            <View className="flex-row">
              <Text className="text-lg font-semibold flex-1 ">Record</Text>
              <View className="flex-row items-center justify-center gap-1">
                <Text
                  onPress={() => {
                    setIsListActive(!isListActive);
                  }}
                  className="text-sm font-semibold  text-end text-primary-500 "
                >
                  View all
                </Text>
                <ArrowRight size="20" color={colors.primary[500]} />
              </View>
            </View>
            <View className="flex-col h-full gap-2">
              {RecordList.slice(0, 4).map((record, index) => {
                return (
                  <View key={index} className="flex-row gap-2 py-2">
                    <View className="flex-1 gap-1">
                      <Text className="text-base font-semibold">
                        {record.title}
                      </Text>
                      <Text className="text-xs">{record.desc}</Text>
                    </View>
                    <View className=" w-1/4">
                      <Text className="text-xs">
                        {format(new Date(record.date), "dd-MM-yyyy")}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </ScrollView>
      ) : (
        <View className="bg-blue-50/10 flex flex-col gap-4 ">
          <FlatList
            data={RecordListData}
            contentContainerClassName="gap-2"
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                key={item.record_Id}
                onPress={() => handleRecordActive(item.record_Id)}
                className="flex flex-row justify-between items-center  bg-white border rounded-2xl border-blue-600 gap-2 overflow-hidden h-20"
              >
                <View className="bg-blue-600  w-6 h-20 flex-col justify-center items-center ">
                  <Text className="text-white font-semibold text-center text-sm">
                    {index + 1}
                  </Text>
                </View>
                <View className="flex-1 p-2">
                  <Text className="text-lg font-medium leading-5">
                    {item.title}
                  </Text>
                  <Text className="text-xs">{item.desc}</Text>
                </View>
                <View className=" px-4">
                  <Text className="text-sm">
                    {format(item.date, "dd-MM-yyyy")}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
          <View className="flex-1 justify-center items-center  mt-10 mb-20">
            <Drawer
              visible={isDrawerVisible}
              onClose={() => setIsDrawerVisible(false)}
              title="My Drawer"
              height="40%"
              className="max-h-[40%]"
            >
              <View className="flex flex-col flex-1 justify-center items-center w-full gap-6 px-6">
                <Text className="text-xl font-semibold text-neutral-600">
                  Details
                </Text>

                <View className="flex-col justify-center items-center gap-3 bg-blue-900 aspect-square w-1/3 rounded-xl p-2">
                  <Text className="text-white text-xs text-center">
                    Client's answers show
                  </Text>
                  <Text className="text-white text-4xl text-center">
                    {RecordActive.score}
                  </Text>
                </View>
                <Text className="text-xs">
                  {format(RecordActive.date, "dd-MM-yyyy")}
                </Text>

                <Text className="text-xl font-semibold text-neutral-600 text-center">
                  {RecordActive.desc}
                </Text>
              </View>
            </Drawer>
          </View>
        </View>
      )}
    </>
  );
}
