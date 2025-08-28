import React, { useState } from "react";
import { StyleSheet, View, Image, TouchableOpacity } from "react-native";
import PagerView from "react-native-pager-view";

import { H2, H3 } from "@/components/ui/Typography";
import { Text } from "@/components/ui/Text";
import { useTranslation } from "react-i18next";
import { welcomeData } from "../constHome";

interface WelcomeScreenProps {
  onComplete: () => void;
}

export default function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(0);

  const handlePageChange = (e: any) => {
    setCurrentPage(e.nativeEvent.position);
  };

  const handleNextOrComplete = () => {
    if (currentPage < welcomeData.length - 1) {
      // Move to next page
      setCurrentPage(currentPage + 1);
    } else {
      // Call onComplete when on the last page
      onComplete();
    }
  };

  const handleSkip = () => {
    // Allow users to skip the welcome flow
    onComplete();
  };

  return (
    <View className="flex-1 relative">
      <PagerView 
        style={styles.container} 
        initialPage={0}
        onPageSelected={handlePageChange}
      >
        {welcomeData.map((item, index) => {
          return (
            <View key={index} className="w-screen h-full flex ">
              <Image
                source={item.src}
                className="w-full h-full bg-cover absolute"
              />
              <View className="absolute bottom-0 px-6 py-20 flex flex-col gap-6">
                <H3 className="text-white border-0 w-full ">{t(item.title)}</H3>
                <Text className="text-white border-0 leading-8 text-lg ">
                  {t(item.desc)}
                </Text>
                
                {/* Navigation buttons */}
                <View className="flex flex-row justify-between items-center mt-8">
                  <TouchableOpacity onPress={handleSkip}>
                    <Text className="text-white/70 text-base">
                      {t("skip")}
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    onPress={handleNextOrComplete}
                    className="bg-white/20 px-6 py-3 rounded-full"
                  >
                    <Text className="text-white font-semibold">
                      {currentPage < welcomeData.length - 1 ? t("Next") : t("Get Started")}
                    </Text>
                  </TouchableOpacity>
                </View>
                
                {/* Page indicators */}
                <View className="flex flex-row justify-center gap-2 mt-4">
                  {welcomeData.map((_, idx) => (
                    <View
                      key={idx}
                      className={`w-2 h-2 rounded-full ${
                        idx === currentPage ? 'bg-white' : 'bg-white/30'
                      }`}
                    />
                  ))}
                </View>
              </View>
            </View>
          );
        })}
      </PagerView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
});