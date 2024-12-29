import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { H3 } from "@/components/ui/Typography";
import { cn } from "@/lib/utils";
import colors from "@/utils/colors";
import { RelativePathString, Slot, Stack, useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, View } from "react-native";

export default function HomeLayout() {
  const router = useRouter();
  const tab = [
    { title: "All", link: "/p/account/scale/record" },
    {
      title: "Generalized Anxiety Disorder",
      link: "/p/account/scale/record/generalized-anxiety-disorder-scale-record",
    },
    { title: "Mood", link: "/p/account/scale/record/mood-scale-record" },
    {
      title: "Quality of Life",
      link: "/p/account/scale/record/quality-of-life-scale-record",
    },
    {
      title: "Depression",
      link: "/p/account/scale/record/depression-scale-record",
    },
  ];
  const [activeTab, setActiveTab] = useState(tab[0]);

  return (
    <>
      <View className="p-4 bg-blue-50/10 h-full flex flex-col gap-4">
        <View className="flex flex-col gap-4">
          <H3 className="text-xl">Record - {activeTab.title}</H3>

          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-3"
          >
            {tab.map((tab) => {
              const isActiveTab = tab.link === activeTab.link;
              return (
                <Button
                  key={tab.link}
                  size={"sm"}
                  onPress={() => {
                    isActiveTab ||
                      router.push(`${tab.link}` as RelativePathString);
                    setActiveTab(tab);
                  }}
                  className={cn(
                    isActiveTab ? "bg-blue-900" : "bg-white",
                    " h-9 rounded-xl "
                  )}
                >
                  <Text
                    className={cn(
                      isActiveTab ? "text-white" : "text-blue-900",
                      "font-medium"
                    )}
                  >
                    {tab.title}
                  </Text>
                </Button>
              );
            })}
          </ScrollView>
        </View>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
      </View>
    </>
  );
}
