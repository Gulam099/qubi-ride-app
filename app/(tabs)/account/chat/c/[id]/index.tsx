import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  useLayoutEffect,
} from "react";
import { io } from "socket.io-client";
import { useLocalSearchParams, useNavigation } from "expo-router";
import axios from "axios";
import { apiNewUrl } from "@/const";
import { useUser } from "@clerk/clerk-expo";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import { FlatList } from "react-native";
import { Text } from "react-native";
import { StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

const socket = io(`${apiNewUrl}`, {
  transports: ["websocket"],
  jsonp: false,
});

function ChatScreen() {
  const { user } = useUser();
  const { id, name, canChat } = useLocalSearchParams();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const userId = user?.publicMetadata?.dbPatientId as string;
  const doctorId = id as string;
  const navigation = useNavigation();

  const { t } = useTranslation();

  const isChatAllowed = canChat === "true";

  console.log("canChat", canChat);
  useLayoutEffect(() => {
    if (name) {
      navigation.setOptions({
        headerTitle: () => (
          <Text style={{ fontWeight: "600", fontSize: 18 }}>{name}</Text>
        ),
      });
    }
  }, [name]);

  const currentUser = {
    _id: userId,
    name: "You",
  };

  // Helper function to get date string for grouping
  const getDateString = (date) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return "Today";
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return messageDate.toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year:
          messageDate.getFullYear() !== today.getFullYear()
            ? "numeric"
            : undefined,
      });
    }
  };

  // Helper function to format time only
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Function to add date dividers to messages
  const addDateDividers = (messages) => {
    const messagesWithDividers = [];
    let currentDate = null;

    messages.forEach((message, index) => {
      const messageDate = getDateString(message.createdAt);

      // Add date divider if date changed
      if (currentDate !== messageDate) {
        messagesWithDividers.push({
          _id: `date-${messageDate}-${index}`,
          type: "date-divider",
          date: messageDate,
        });
        currentDate = messageDate;
      }

      messagesWithDividers.push(message);
    });

    return messagesWithDividers;
  };

  // Load existing chat history
  const fetchChats = async () => {
    try {
      if (!userId) {
        return;
      }
      const res = await axios.post(
        `${apiNewUrl}/api/doctor/chat/getUserChats`,
        {
          userId: userId, // Send the patient's own ID
        }
      );

      console.log('res',res)
      // Find the chat between this patient and the specific doctor
      const chat = res?.data?.chats?.find(
        (c) => c?.doctorId?._id === doctorId || c?.doctorId === doctorId
      );

      if (chat && chat.messages) {
        const formatted = chat.messages
          .map((msg: any, index: number) => ({
            _id: `${msg?._id || index}`,
            text: msg.text || "",
            createdAt: new Date(msg.timestamp || msg.createdAt || Date.now()),
            user: {
              _id: msg.senderId,
              name: msg.role === "doctor" ? "Doctor" : "Patient",
              avatar: msg.imageUrl || undefined,
            },
            image: msg.imageUrl || undefined,
          }))
          .sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );

        const messagesWithDividers = addDateDividers(formatted);
        setMessages(messagesWithDividers);
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
  };

  // Receive messages
  const roomId = [userId, doctorId].sort().join("_");

  useEffect(() => {
    // Register patient with server
    socket.emit("register_user", userId);

    // Join the room immediately if socket is already connected
    if (socket.connected) {
      socket.emit("join_room", { roomId });
    } else {
      socket.on("connect", () => {
        socket.emit("register_user", userId);
        socket.emit("join_room", { roomId });
      });
    }

    // Listen for new messages
    socket.on("new_message", (msg) => {
      console.log("NEW MESSAGE", msg);
      if (
        (msg.userId === userId && msg.doctorId === doctorId) ||
        (msg.userId === doctorId && msg.doctorId === userId)
      ) {
        // Don't add message if it's from the current user (avoid duplicates)
        if (msg.senderId !== userId) {
          const formatted = {
            _id: `${Date.now()}-${Math.random()}`,
            text: msg.text,
            createdAt: new Date(),
            user: {
              _id: msg.senderId,
              name: msg.role === "doctor" ? "Doctor" : "Patient",
              avatar: msg.imageUrl || undefined,
            },
          };

          setMessages((prev) => {
            const messagesOnly = prev.filter(
              (item) => item.type !== "date-divider"
            );
            const newMessages = [...messagesOnly, formatted];
            return addDateDividers(newMessages);
          });
        }
      }
    });

    // Cleanup
    return () => {
      socket.emit("leave_room", { roomId });
      socket.off("connect");
      socket.off("new_message");
    };
  }, [roomId, userId, doctorId]);

  useEffect(() => {
    fetchChats();
  }, [userId]);

  // Send messages - Modified to work with input text
  const onSend = useCallback(
    (messageText?: string) => {
      const textToSend = messageText || inputText.trim();

      if (!textToSend || !isChatAllowed) {
        console.warn("No text to send");
        return;
      }

      // Create message object
      const message = {
        _id: `${Date.now()}-${Math.random()}`,
        text: textToSend,
        createdAt: new Date(),
        user: {
          _id: userId,
          name: "You",
        },
      };

      setMessages((prev) => {
        const messagesOnly = prev.filter(
          (item) => item.type !== "date-divider"
        );
        const newMessages = [...messagesOnly, message];
        return addDateDividers(newMessages);
      });

      setInputText(""); // Clear input after sending

      // Send via socket
      socket.emit("new_message", {
        userId: userId, // Patient ID
        doctorId: doctorId, // Doctor ID
        senderId: userId, // Patient is sending
        text: textToSend,
        role: "patient",
      });

      // Save to database
      axios
        .post(`${apiNewUrl}/api/doctor/chat/addChat`, {
          userId: userId, // Patient ID
          doctorId: doctorId, // Doctor ID
          senderId: userId, // Patient is sending
          text: textToSend,
        })
        .catch((error) => {
          console.error("Error saving message:", error);
        });
    },
    [userId, doctorId, inputText]
  );

  // Handle send button press
  const handleSend = useCallback(() => {
    onSend();
  }, [onSend]);

  const flatListRef = useRef(null);

  const renderItem = ({ item }) => {
    // Render date divider
    if (item.type === "date-divider") {
      return (
        <View style={styles.dateDividerContainer}>
          <View style={styles.dateDividerLine} />
          <Text style={styles.dateDividerText}>{item.date}</Text>
          <View style={styles.dateDividerLine} />
        </View>
      );
    }
    const isMyMessage = item.user._id === userId;
    const hasImageOnly = item.image && !item.text;
    // Render message
    return (
      <View
        style={[
          styles.messageBubble,
          isMyMessage ? styles.myMessage : styles.otherMessage,
          hasImageOnly && styles.imageOnlyBubble,
        ]}
      >
        {item.image && (
          <Image
            source={{ uri: item.image }}
            style={styles.messageImage}
            resizeMode="cover"
          />
        )}
        {item.text && (
          <Text
            style={[
              styles.messageText,
              isMyMessage ? styles.myMessageText : styles.otherMessageText,
            ]}
          >
            {item.text}
          </Text>
        )}
        <Text
          style={[
             styles.timestamp,
          isMyMessage ? styles.myTimestamp : styles.otherTimestamp,
          ]}
        >
          {formatTime(item.createdAt)}
        </Text>
      </View>
    );
  };

  const handlePickImage = async () => {
    if (!isChatAllowed) {
      Alert.alert("Chat Disabled", "You cannot send images in this chat.");
      return;
    }

    try {
      // Request permissions
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Sorry, we need camera roll permissions to make this work!"
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const image = result.assets[0];
        const uri = image.uri;
        const name = uri.split("/").pop() || `image_${Date.now()}.jpg`;
        const match = /\.(\w+)$/.exec(name);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        const formData = new FormData();
        formData.append("userId", userId);
        formData.append("doctorId", doctorId);
        formData.append("senderId", userId);
        formData.append("image", {
          uri,
          name,
          type,
        } as any);

        setIsUploading(true);

        try {
          const res = await axios.post(
            `${apiNewUrl}/api/doctor/chat/addChat`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
              timeout: 30000, // 30 seconds timeout
            }
          );

          const msg = res.data?.chat?.messages?.slice(-1)[0];
          const uploadedUrl = res.data?.imageUrl;
          if (msg) {
            const formatted = {
              _id: `${Date.now()}-${Math.random()}`,
              text: msg.text || "",
              createdAt: new Date(msg.createdAt || Date.now()),
              user: {
                _id: msg.senderId,
                name: msg.role === "doctor" ? "Doctor" : "Patient",
                avatar: uploadedUrl,
              },
              image: uploadedUrl,
              isUploading: true,
            };

            setMessages((prev) => {
              const messagesOnly = prev.filter(
                (item) => item.type !== "date-divider"
              );
              const newMessages = [...messagesOnly, formatted];
              return addDateDividers(newMessages);
            });

            // Send via socket
            socket.emit("new_message", {
              userId,
              doctorId,
              senderId: userId,
              text: msg.text || "",
              imageUrl: msg.imageUrl,
              role: "patient",
            });
          }
        } catch (error) {
          console.error("Error uploading image:", error);
          Alert.alert(
            "Upload Error",
            "Failed to upload image. Please try again."
          );
        } finally {
          setIsUploading(false);
        }
      }
    } catch (error) {
      setIsUploading(false);
      console.error("Image picking error:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item, index) => item._id || index.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.chatContainer}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
      />

      <View style={styles.inputContainer}>
        <TouchableOpacity
          onPress={handlePickImage}
          style={styles.iconButton}
          disabled={isUploading || !isChatAllowed}
        >
          <Ionicons name="add" size={24} color="#666" />
        </TouchableOpacity>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder={t("typeMessage")}
          multiline
          onSubmitEditing={handleSend}
          returnKeyType={t("send")}
        />
        <TouchableOpacity
          onPress={handleSend}
          style={styles.sendIconWrapper}
          disabled={!inputText.trim() || !isChatAllowed}
        >
          <Ionicons
            name="send"
            size={22}
            color={
              inputText.trim() || selectedImage
                ? "#6B7280"
                : "rgba(107, 103, 103, 0.55)"
            }
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  chatContainer: {
    padding: 10,
    flexGrow: 1,
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 18,
    marginVertical: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  myMessage: {
    backgroundColor: "#9CA3AF",
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    backgroundColor: "#ECECEC",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  myMessageText: {
    color: "#fff",
  },
  otherMessageText: {
    color: "#000",
  },
  timestamp: {
    fontSize: 10,
    alignSelf: "flex-end",
    marginTop: 4,
  },
  myTimestamp: {
    color: "rgba(255, 255, 255, 0.7)",
  },
  otherTimestamp: {
    color: "#666",
  },
  dateDividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
    marginHorizontal: 20,
  },
  dateDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E0E0E0",
  },
  dateDividerText: {
    backgroundColor: "#F5F5F5",
    color: "#666",
    fontSize: 12,
    fontWeight: "500",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginHorizontal: 10,
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#E5E5E7",
    backgroundColor: "#fff",
  },
  textInput: {
    flex: 1,
    padding: 12,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    justifyContent: "center",
    marginLeft: 10,
    paddingHorizontal: 16,
    backgroundColor: "#0a84ff",
    borderRadius: 20,
    minHeight: 40,
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  iconButton: {
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    width: 36,
    height: 36,
  },
  sendIconWrapper: {
    borderRadius: 20,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 5,
  },
  imageOnlyBubble: {
  backgroundColor: "transparent",
  padding: 0,
  borderRadius: 0,
  shadowColor: "transparent",
  elevation: 0,
},
});

export default ChatScreen;
