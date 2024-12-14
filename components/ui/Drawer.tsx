// components/ui/Drawer.tsx
import { cn } from "@/lib/utils";
import { X } from "lucide-react-native";
import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";

type DrawerProps = {
  visible: boolean; // Controls visibility of the Drawer
  onClose: () => void; // Function to close the Drawer
  title?: string; // Optional Drawer title
  children: React.ReactNode; // Content of the Drawer
  className?: string; // For Tailwind-style custom styling
  height?: string;
};

export default function Drawer({
  visible,
  onClose,
  title,
  children,
  className,
  height,
}: DrawerProps) {
  const dynamicHeight = height ? `max-h-[${height}]` : "max-h-[70%]";
  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onClose} // Close on Android back button
    >
      <View style={styles.overlay}>
        <View
          className={cn(
            "flex flex-1 p-4  bg-background w-full h-full  rounded-t-2xl relative",
            dynamicHeight , className
          )}
        >
          {/* Header */}
          <View className="w-full flex flex-row justify-end fixed top-0 left-0">
            <TouchableOpacity onPress={onClose}>
              <X size="24" color="black" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View className="flex flex-1 w-full h-full">{children}</View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end", // Positions the modal at the bottom like a drawer
    backgroundColor: "rgba(0,0,0,0.5)", // Semi-transparent background
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  
});
