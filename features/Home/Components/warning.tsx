import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Warning2, CloseSquare, Add } from "iconsax-react-native";
import colors from "@/utils/colors";
import { Button } from "@/components/ui/Button";

export default function WarningToast({
  heading,
  description,
  onClose,
}: {
  heading: string;
  description: string;
  onClose?: () => void;
}) {
  const [visible, setVisible] = useState(true);

  const handleClose = () => {
    setVisible(false);
    if (onClose) onClose(); // Call the optional onClose callback
  };

  if (!visible) return null;

  return (
    <View className="w-full flex flex-row items-center bg-orange-50 border border-orange-200 rounded-lg p-4 ">
      {/* Icon */}
      <View style={styles.iconContainer}>
        <Warning2 variant="Bold" size={24} color={colors.orange[50]} />
      </View>

      {/* Text Content */}
      <View style={styles.textContainer}>
        <Text style={styles.heading}>{heading}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>

      {/* Close Button */}
      <Button
        onPress={handleClose}
        className="rotate-[45deg] aspect-square w-4"
        variant={"ghost"}
      >
        <Add className="rotate-[45deg]" size={24} color="#000" />
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF7E6",
    borderWidth: 1,
    borderColor: "#FFD396",
    borderRadius: 8,
    padding: 10,
    marginHorizontal: 16,
    marginTop: 16,
    elevation: 2,
  },
  iconContainer: {
    marginRight: 10,
    backgroundColor: "#F57C00",
    borderRadius: 8,
    padding: 6,
  },
  textContainer: {
    flex: 1,
  },
  heading: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#4A4A4A",
  },
  description: {
    fontSize: 13,
    color: "#4A4A4A",
  },
  closeButton: {
    marginLeft: 10,
  },
});
