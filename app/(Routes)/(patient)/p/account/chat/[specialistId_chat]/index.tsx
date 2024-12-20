import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
} from "react-native";
import React, { useState, useEffect } from "react";
import { Stack, useLocalSearchParams } from "expo-router";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import Drawer from "@/components/ui/Drawer";

import * as ImagePicker from "expo-image-picker";
import { Add, Camera, Gallery, Subtitle } from "iconsax-react-native";
import { Separator } from "@/components/ui/Separator";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";

export default function ChatScreenSpecialist() {
  
  const [attachment, setAttachment] = useState(null);
  const { specialistId_chat } = useLocalSearchParams();
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "specialist",
      text: "Hello! How can I assist you today?",
      timestamp: "2024-12-19T13:00:00Z",
    },
    {
      id: 2,
      sender: "user",
      text: "I need help with my appointment.",
      timestamp: "2024-12-19T13:01:00Z",
    },
    {
      id: 3,
      sender: "specialist",
      text: "Sure, let me check that for you.",
      timestamp: "2024-12-19T13:02:00Z",
    },
    {
      id: 4,
      sender: "user",
      text: "Thank you!",
      timestamp: "2024-12-19T13:03:00Z",
    },
    {
      id: 5,
      sender: "specialist",
      text: "You're welcome. Anything else?",
      timestamp: "2024-12-19T13:04:00Z",
    },
    {
      id: 6,
      sender: "specialist",
      text: "How can I help you?",
      timestamp: "2024-12-19T13:05:00Z",
    },
    {
      id: 7,
      sender: "user",
      text: "I have a question about my medication.",
      timestamp: "2024-12-19T13:06:00Z",
    },
    {
      id: 8,
      sender: "specialist",
      text: "Sure, what's your question?",
      timestamp: "2024-12-19T13:07:00Z",
    },
    {
      id: 9,
      sender: "user",
      text: "I'm experiencing some side effects.",
      timestamp: "2024-12-19T13:08:00Z",
    },
    {
      id: 10,
      sender: "specialist",
      text: "Let me check your medication details.",
      timestamp: "2024-12-19T13:09:00Z",
    },
    {
      id: 11,
      sender: "user",
      text: "Thank you for your help.",
      timestamp: "2024-12-19T13:10:00Z",
    },
    {
      id: 12,
      sender: "specialist",
      text: "You're welcome. Feel free to ask if you have any more questions.",
      timestamp: "2024-12-19T13:11:00Z",
    },
    {
      id: 13,
      sender: "user",
      text: "I will. Have a great day!",
      timestamp: "2024-12-19T13:12:00Z",
    },
    {
      id: 14,
      sender: "specialist",
      text: "You too!",
      timestamp: "2024-12-19T13:13:00Z",
    },
    {
      id: 15,
      sender: "specialist",
      text: "Hello! How can I assist you today?",
      timestamp: "2024-12-19T13:14:00Z",
    },
    {
      id: 16,
      sender: "user",
      text: "I need help with my appointment.",
      timestamp: "2024-12-19T13:15:00Z",
    },
    {
      id: 17,
      sender: "specialist",
      text: "Sure, let me check that for you.",
      timestamp: "2024-12-19T13:16:00Z",
    },
    {
      id: 18,
      sender: "user",
      text: "Thank you!",
      timestamp: "2024-12-19T13:17:00Z",
    },
    {
      id: 19,
      sender: "specialist",
      text: "You're welcome. Anything else?",
      timestamp: "2024-12-19T13:18:00Z",
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [isAttachmentVisible, setIsAttachmentVisible] = useState(false);

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const newMessageData = {
      id: messages.length + 1,
      sender: "user",
      text: newMessage,
      timestamp: new Date().toISOString(),
    };
    setMessages((prevMessages) => [...prevMessages, newMessageData]);
    setNewMessage("");
  };

  const renderMessage = ({ item }: { item: any }) => (
    <View
      className={cn(
        `my-2 p-3 rounded-2xl max-w-[80%]`,
        item.sender === "specialist"
          ? "self-start bg-blue-50/50 rounded-bl-none"
          : "self-end bg-white rounded-br-none"
      )}
    >
      <Text className="text-neutral-800">{item.text}</Text>
      <Text className="text-neutral-500 text-xs mt-1 self-end">
        {format(new Date(item.timestamp), "h:mm a")}
      </Text>
    </View>
  );

  const [image, setImage] = useState<string | null>(null);

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos", "livePhotos"],
      allowsEditing: true,
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View>
        <Text>We need your permission to show the camera</Text>
        <Button onPress={requestPermission}>Grant Permission</Button>
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  return (
    <View className="flex-1 bg-blue-50/10 p-4">
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id.toString()}
        contentContainerClassName="p-2"
        showsVerticalScrollIndicator={false}
      />
      <View className="flex-row items-center mt-4 border-t border-gray-200 pt-2">
        <Button
          className="aspect-square rounded-full"
          onPress={() => setIsAttachmentVisible(true)}
          variant={"ghost"}
        >
          <Add size="24" color="#000" />
        </Button>

        {image && <Image source={{ uri: image }} className="w-48 h-48" />}
        <TextInput
          className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-neutral-900"
          placeholder="Type a message..."
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <TouchableOpacity onPress={sendMessage} className="ml-2">
          <Button className="h-8 ">
            <Text className="text-white font-medium">Send</Text>
          </Button>
        </TouchableOpacity>
      </View>

      {/* <CameraView className="flex-1" facing={facing}>
        <View className="flex-row">
          <TouchableOpacity  onPress={toggleCameraFacing}>
            <Text >Flip Camera</Text>
          </TouchableOpacity>
        </View>
      </CameraView> */}

      <Drawer
        visible={isAttachmentVisible}
        onClose={() => {
          setIsAttachmentVisible(false);
        }}
        title="Cancel the session"
        height="50%"
        className="max-h-[30%]"
      >
        <View className="flex flex-1 justify-center items-start w-full gap-4 ">
          <Button
            className="h-10 px-4 w-full flex flex-row items-center justify-start gap-2"
            onPress={pickImage}
            variant={"ghost"}
          >
            <Camera size="28" color="#000" />
            <Text className=" ">Camera</Text>
          </Button>
          <Separator />
          <Button
            className="h-10 px-4 w-full flex flex-row items-center justify-start gap-2"
            onPress={pickImage}
            variant={"ghost"}
          >
            <Gallery size="28" color="#000" />
            <Text className=" ">Studio / Photos & Videos </Text>
          </Button>
          <Separator />
          <Button
            className="h-10 px-4 w-full flex flex-row items-center justify-start gap-2"
            onPress={pickImage}
            variant={"ghost"}
          >
            <Subtitle size="28" color="#000" />
            <Text className=" ">Document </Text>
          </Button>
        </View>
      </Drawer>
    </View>
  );
}
