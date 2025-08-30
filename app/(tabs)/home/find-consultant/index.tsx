import { Button } from "@/components/ui/Button";
import { consultPageHomeImage } from "@/features/patient/constPatient";
import i18n from "@/lib/i18n";
import { router } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { Image, StyleSheet, Text, View } from "react-native";

const ConsultationScreen = () => {
  const { t } = useTranslation();
  const currentLanguage = i18n.language;

  return (
    <View style={styles.mainContainer}>
      {/* Image section */}
      <View style={styles.imageContainer}>
        <Image
          source={consultPageHomeImage}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      {/* Bottom section with text and button */}
      <View
        style={[
          styles.bottomSection,
          currentLanguage === "ar" && styles.bottomSectionArabic,
        ]}
      >
        <Text style={styles.description}>{t("suggestionMessage")}</Text>
        <Button
          style={styles.button}
          onPress={() => router.push("/home/find-consultant/step1")}
        >
          <Text style={styles.buttonText}>{t("Start Now")}</Text>
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  imageContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    transform: [{ scaleX: 1.01 }],
  },
  bottomSection: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: 50,
  },
  bottomSectionArabic: {
    paddingBottom: 55, // Arabic padding
  },
  description: {
    fontSize: 22,
    color: "#000",
    textAlign: "center",
    marginBottom: 65,
  },
  button: {
    backgroundColor: "#7c3aed",
    paddingVertical: 16,
    borderRadius: 12,
    marginHorizontal: 8,
    marginBottom: 42,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 18,
    textAlign: "center",
  },
});

export default ConsultationScreen;
