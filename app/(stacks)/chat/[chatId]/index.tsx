import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  Pressable,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import Drawer from "@/components/ui/Drawer";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { Add, Gallery, Send, Subtitle } from "iconsax-react-native";
import { Camera as CameraIcon } from "iconsax-react-native";
import {
  CameraType,
  Camera,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import { Separator } from "@/components/ui/Separator";
import { Stack } from "expo-router";
import BackButton from "@/features/Home/Components/BackButton";
import NotificationIconButton from "@/features/Home/Components/NotificationIconButton";
import { Input } from "@/components/ui/Input";

export default function ChatScreen() {
  const [attachment, setAttachment] = useState<any>(null); // { type: 'image' | 'document', uri: string, name?: string }
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isAttachmentVisible, setIsAttachmentVisible] = useState(false);
  const [isCameraViewVisible, setIsCameraViewVisible] = useState(false);
  const [cameraType, setCameraType] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<null>(null);

  // Simulate fetching initial messages
  useEffect(() => {
    fetchInitialMessages();
  }, []);

  const fetchInitialMessages = async () => {
    // Simulate API call
    const initialMessages = [
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
    ];
    setMessages(initialMessages);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() && !attachment) return;

    const newMessageData = {
      id: messages.length + 1,
      sender: "user",
      text: newMessage,
      attachment,
      timestamp: new Date().toISOString(),
    };

    setMessages((prevMessages) => [...prevMessages, newMessageData]);
    setNewMessage("");
    setAttachment(null);

    // Simulate sending the message to the server
    await sendToServer(newMessageData);
  };

  const sendToServer = async (message: any) => {
    console.log("Sending message to server:", message);
    // Integrate API call here
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      let photo = await cameraRef.current.takePictureAsync();
      console.log(photo);
    }
  };
  const toggleCameraType = () => {
    setCameraType((current) => (current === "back" ? "front" : "back"));
  };

  const pickImageFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setAttachment({
        type: "image",
        uri: result.assets[0].uri,
      });
      setIsAttachmentVisible(false);
    }
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "*/*",
    });

    if (!result.canceled) {
      setAttachment({
        type: "document",
        uri: result.assets[0].uri,
        name: result.assets[0].name,
      });
      setIsAttachmentVisible(false);
    }
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
      {item.attachment?.type === "image" && (
        <Image
          source={{ uri: item.attachment.uri }}
          className="w-40 h-40 rounded-md mb-2"
        />
      )}
      {item.attachment?.type === "document" && (
        <TouchableOpacity
          onPress={() => console.log("Open document:", item.attachment.uri)}
          className="flex-row items-center bg-gray-100 p-2 rounded-md mb-2"
        >
          <Subtitle size="20" color="#000" />
          <Text className="ml-2 text-sm">{item.attachment.name}</Text>
        </TouchableOpacity>
      )}
      <Text className="text-neutral-800">{item.text}</Text>
      <Text className="text-neutral-500 text-xs mt-1 self-end">
        {format(new Date(item.timestamp), "h:mm a")}
      </Text>
    </View>
  );

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View>
        <Text>We need your permission to use the camera</Text>
        <Button onPress={requestPermission}>Grant Permission</Button>
      </View>
    );
  }

  return (
    <>
      {/* Dynamic Header */}
      <Stack.Screen
        options={{
          headerShown: true,
          headerBackButtonDisplayMode: "generic",
          headerShadowVisible: false,
          headerTitle: () => (
            <Text className="font-semibold text-lg ">Chat with Specialist</Text>
          ),
          headerLeft: () => <BackButton />,
          headerRight: () => <NotificationIconButton className="mr-4" />,
        }}
      />

      <View className="flex-1 bg-blue-50/10 p-4">
        {isCameraViewVisible && (
          <Camera className="flex-1" type={cameraType} ref={cameraRef}>
            <View
              style={{
                flex: 1,
                backgroundColor: "transparent",
                justifyContent: "flex-end",
                alignItems: "center",
              }}
            >
              <Pressable onPress={takePicture}>
                <Text
                  style={{ fontSize: 18, marginBottom: 10, color: "white" }}
                >
                  Take Picture
                </Text>
              </Pressable>
              <Pressable onPress={toggleCameraType}>
                <Text
                  style={{ fontSize: 18, marginBottom: 10, color: "white" }}
                >
                  Flip Camera
                </Text>
              </Pressable>
            </View>
          </Camera>
        )}

        {!isCameraViewVisible && (
          <>
            <FlatList
              data={messages}
              renderItem={renderMessage}
              keyExtractor={(item) => item.id.toString()}
              contentContainerClassName="p-2"
              showsVerticalScrollIndicator={false}
            />

            <View className="flex-col gap-2 ">
              <Separator className="my-2" />
              {attachment && (
                <View className="flex-row items-center gap-2 p-4 bg-neutral-200 rounded-2xl ">
                  {attachment.type === "image" && (
                    <Image
                      source={{ uri: attachment.uri }}
                      className="w-36 h-36 rounded-md"
                    />
                  )}
                  {attachment.type === "document" && (
                    <TouchableOpacity
                      onPress={() =>
                        console.log("Preview document:", attachment.uri)
                      }
                      className="flex-row items-center bg-primary-100 p-2 rounded-xl"
                    >
                      <Subtitle size="20" color="#000" />
                      <Text className="ml-2 text-sm">{attachment.name}</Text>
                    </TouchableOpacity>
                  )}
                  <Button
                    className="ml-auto aspect-square rounded-full rotate-45"
                    variant={"ghost"}
                    onPress={() => setAttachment(null)}
                  >
                    <Add size="22" color="#000" />
                  </Button>
                </View>
              )}

              <View className="flex-row items-center ">
                <Button
                  className="aspect-square rounded-full"
                  onPress={() => setIsAttachmentVisible(true)}
                  variant={"ghost"}
                >
                  <Add size="24" color="#000" />
                </Button>
                <Input
                  className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-neutral-900"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChangeText={setNewMessage}
                />
                <TouchableOpacity onPress={sendMessage} className="ml-2">
                  <Button className="w-20 " size={"icon"}>
                    <Send size="18" color="#fff" />
                  </Button>
                </TouchableOpacity>
              </View>
            </View>

            <Drawer
              visible={isAttachmentVisible}
              onClose={() => setIsAttachmentVisible(false)}
              title="Attachments"
              height="50%"
              className="max-h-[30%]"
            >
              <View className="flex flex-1 justify-center items-start w-full gap-4 ">
                <Button
                  className="h-10 px-4 w-full flex flex-row items-center justify-start gap-2"
                  onPress={() => setIsCameraViewVisible(true)}
                  variant={"ghost"}
                >
                  <CameraIcon size="28" color="#000" />
                  <Text className=" ">Camera</Text>
                </Button>
                <Separator />
                <Button
                  className="h-10 px-4 w-full flex flex-row items-center justify-start gap-2"
                  onPress={pickImageFromGallery}
                  variant={"ghost"}
                >
                  <Gallery size="28" color="#000" />
                  <Text className=" ">Gallery</Text>
                </Button>
                <Separator />
                <Button
                  className="h-10 px-4 w-full flex flex-row items-center justify-start gap-2"
                  onPress={pickDocument}
                  variant={"ghost"}
                >
                  <Subtitle size="28" color="#000" />
                  <Text className=" ">Document</Text>
                </Button>
              </View>
            </Drawer>
          </>
        )}
      </View>
    </>
  );
}
