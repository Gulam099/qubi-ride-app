import React, { useEffect, useState, useCallback } from "react";
import { GiftedChat, IMessage } from "react-native-gifted-chat";
import { io } from "socket.io-client";
import { useLocalSearchParams } from "expo-router";
import axios from "axios";
import { apiNewUrl } from "@/const";
import { useUser } from "@clerk/clerk-expo";


const socket = io(`${apiNewUrl}`, {
  transports: ["websocket"],
  jsonp: false,
});

function ChatScreen() {
  const { user } = useUser();
  const { id } = useLocalSearchParams();
  const [messages, setMessages] = useState<IMessage[]>([]);
  const userId = user?.publicMetadata?.dbPatientId as string;
  const doctorId = id as string;

  console.log('doctorId',doctorId)
  console.log('userId',userId)

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
      const chat = res.data.chats.find((c) => 
        c.doctorId._id === doctorId || c.doctorId === doctorId
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
              name: msg.role === 'doctor' ? 'Doctor' : 'Patient',
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
      if ((msg.userId === userId && msg.doctorId === doctorId) || 
          (msg.userId === doctorId && msg.doctorId === userId)) {
        const formatted: IMessage = {
          _id: `${Date.now()}-${Math.random()}`,
          text: msg.text,
          createdAt: new Date(),
          user: {
            _id: msg.senderId,
            name: msg.role === 'doctor' ? 'Doctor' : 'Patient',
            avatar: msg.imageUrl || undefined,
          },
        };
        setMessages((prev) => GiftedChat.append(prev, [formatted]));
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

  // Send messages
  const onSend = useCallback(
    (msgs = []) => {
      const [message] = msgs;
      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, [message])
      );

      // Send via socket
      socket.emit("new_message", {
        userId: userId, // Patient ID
        doctorId: doctorId, // Doctor ID
        senderId: userId, // Patient is sending
        text: message.text,
      });

      // Save to database
      axios
        .post(`${apiNewUrl}/api/doctor/chat/addChat`, {
          userId: userId, // Patient ID
          doctorId: doctorId, // Doctor ID
          senderId: userId, // Patient is sending
          text: message.text,
        })
        .catch((error) => {
          console.error("Error saving message:", error);
        });
    },
    [userId, doctorId]
  );

  return (
    <GiftedChat
      messages={messages}
      onSend={onSend}
      user={currentUser}
      showUserAvatar={true}
      alwaysShowSend={true}
      keyboardShouldPersistTaps="never"
      renderAvatar={null} 
      isKeyboardInternallyHandled={false}
    />
  );
}

export default ChatScreen;
