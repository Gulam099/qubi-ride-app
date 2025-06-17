import React, { useEffect, useState, useCallback, useRef } from "react";
import { io } from "socket.io-client";
import { useLocalSearchParams } from "expo-router";
import axios from "axios";
import { apiNewUrl } from "@/const";
import { useUser } from "@clerk/clerk-expo";
import {
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { FlatList } from "react-native";
import { Text } from "react-native";
import { StyleSheet } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

const socket = io(`${apiNewUrl}`, {
  transports: ["websocket"],
  jsonp: false,
});

function ChatScreen() {
  const { user } = useUser();
  const { id } = useLocalSearchParams();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState(""); 
  const [isUploading, setIsUploading] = useState(false);
  const userId = user?.publicMetadata?.dbPatientId as string;
  const doctorId = id as string;

  console.log("doctorId", doctorId);
  console.log("userId", userId);

  const currentUser = {
    _id: userId,
    name: "You",
  };

  // Load existing chat history
  const fetchChats = async () => {
    try {
      const res = await axios.post(
        `${apiNewUrl}/api/doctor/chat/getUserChats`,
        {
          userId: userId, // Send the patient's own ID
        }
      );

      // Find the chat between this patient and the specific doctor
      const chat = res.data.chats.find(
        (c) => c.doctorId._id === doctorId || c.doctorId === doctorId
      );

      if (chat && chat.messages) {
        const formatted = chat.messages
          .reverse()
          .map((msg: any, index: number) => ({
            _id: `${msg._id || index}`,
            text: msg.text || "",
            createdAt: new Date(msg.timestamp || msg.createdAt || Date.now()),
            user: {
              _id: msg.senderId,
              name: msg.role === "doctor" ? "Doctor" : "Patient",
              avatar: msg.imageUrl || undefined,
            },
          }));
        setMessages(formatted);
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
  };

  // Receive messages
  useEffect(() => {
    socket.on("connect", () => {
      // Join both patient and doctor rooms
      socket.emit("join", { userId: userId });
      socket.emit("join", { userId: doctorId });
    });

    socket.on("new_message", (msg) => {
      // Check if this message is for this chat (between this patient and doctor)
      if (
        (msg.userId === userId && msg.doctorId === doctorId) ||
        (msg.userId === doctorId && msg.doctorId === userId)
      ) {
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
        setMessages((prev) => [...prev, formatted]);
      }
    });

    return () => {
      socket.off("connect");
      socket.off("new_message");
    };
  }, [userId, doctorId]);

  useEffect(() => {
    fetchChats();
  }, []);

  // Send messages - Modified to work with input text
  const onSend = useCallback(
    (messageText?: string) => {
      const textToSend = messageText || inputText.trim();
      
      if (!textToSend) {
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

      setMessages((previousMessages) => [...previousMessages, message]);
      setInputText(""); // Clear input after sending

      // Send via socket
      socket.emit("new_message", {
        userId: userId, // Patient ID
        doctorId: doctorId, // Doctor ID
        senderId: userId, // Patient is sending
        text: textToSend,
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

  const renderItem = ({ item }) => (
    <View
      style={[
        styles.messageBubble,
        item.user._id === userId ? styles.myMessage : styles.otherMessage,
      ]}
    >
      <Text style={styles.messageText}>{item.text}</Text>
      <Text style={styles.timestamp}>
        {new Date(item.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Text>
    </View>
  );

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
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message"
          multiline
          onSubmitEditing={handleSend}
          returnKeyType="send"
        />
        <TouchableOpacity 
          onPress={handleSend} 
          style={[
            styles.sendButton, 
            { opacity: inputText.trim() ? 1 : 0.5 }
          ]}
          disabled={!inputText.trim()}
        >
          <Text style={styles.sendButtonText}>Send</Text>
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
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 10,
    borderRadius: 10,
    marginVertical: 4,
  },
  myMessage: {
    backgroundColor: "#0a84ff",
    alignSelf: "flex-end",
  },
  otherMessage: {
    backgroundColor: "#ECECEC",
    alignSelf: "flex-start",
  },
  messageText: {
    fontSize: 16,
  },
  timestamp: {
    fontSize: 10,
    color: "#555",
    alignSelf: "flex-end",
    marginTop: 2,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#ccc",
  },
  textInput: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
  },
  sendButton: {
    justifyContent: "center",
    marginLeft: 10,
    paddingHorizontal: 12,
    backgroundColor: "#0a84ff",
    borderRadius: 20,
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default ChatScreen;