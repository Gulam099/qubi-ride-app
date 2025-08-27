import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons"; // For icons (optional)
import { ExportCurve, Moneys } from "iconsax-react-native";
import colors from "@/utils/colors";

type ReportCardProps = {
  _id: string;
  title: string;
  doctorName: string;
  date: string;
  number: string;
  type: "previous" | "current";
  category: "plan" | "prescription";
};

const ReportCard = ({ title, doctorName, date, number,_id }: ReportCardProps) => {


   // Fix the handledownload function
    // const handledownload = async (_id: string) => {
    //   if (!_id) {
    //     toast.error(t("Treatment ID not found"));
    //     return;
    //   }
  
    //   try {
    //     // Show loading state
  
    //     const downloadUrl = `${apiNewUrl}/api/treatments/${_id}/pdf`;
    //     const fileUri = FileSystem.documentDirectory + `treatment_${_id}.pdf`;
  
    //     console.log("Download URL:", downloadUrl);
    //     console.log("File URI:", fileUri);
  
    //     const downloadResumable = FileSystem.createDownloadResumable(
    //       downloadUrl,
    //       fileUri
    //     );
  
    //     const result = await downloadResumable.downloadAsync();
  
    //     if (result?.uri) {
    //       console.log("Downloaded to:", result.uri);
    //       toast.success(t("Download completed successfully!"));
  
    //       // Share the PDF (opens with other apps like WhatsApp, Drive, etc.)
    //       if (await Sharing.isAvailableAsync()) {
    //         await Sharing.shareAsync(result.uri, {
    //           mimeType: "application/pdf",
    //           dialogTitle: t("Open PDF with..."),
    //         });
    //       } else {
    //         toast.error(t("Sharing not available on this device"));
    //       }
    //     } else {
    //       throw new Error("Download failed - no URI returned");
    //     }
    //   } catch (error) {
    //     console.error("Failed to download PDF:", error);
    //     toast.error(t("Failed to download PDF. Please try again."));
    //   }
    // };
  return (
    <View className="bg-background rounded-xl p-4 ">
      {/* Card Header */}
      <View className="flex-row justify-between ">
        <Text className="font-semibold text-lg text-blue-800">{title}</Text>
        <ExportCurve size={18} color={colors.primary[600]} />
      </View>

      {/* Doctor's Name */}
      <Text className="font-medium text-base text-neutral-600 my-4">
        <Text className="font-medium text-base text-blue-800">
          Doctor's name :{" "}
        </Text>
        {doctorName}
      </Text>

      {/* Footer: Date & Number */}
      <View className="flex-row justify-between border-t border-neutral-300 pt-4">
        <View className="flex-row items-center">
          <View className="p-1 bg-blue-50/20 aspect-square rounded-full w-8 flex justify-center items-center">
            <Moneys size="18" color={colors.primary[900]} />
          </View>
          <Text className="font-medium text-sm text-neutral-600 ">
            {" "}
            Date : {date}
          </Text>
        </View>
        <View className="flex-row items-center">
          <View className="p-1 bg-blue-50/20 aspect-square rounded-full w-8 flex justify-center items-center">
            <Moneys size="18" color={colors.primary[900]} />
          </View>
          <Text className="font-medium text-sm text-neutral-600 ">
            {" "}
            Number : {number}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default ReportCard;
