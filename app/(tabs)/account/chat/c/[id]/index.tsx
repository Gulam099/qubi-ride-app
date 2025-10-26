// import React, {
//   useEffect,
//   useState,
//   useCallback,
//   useRef,
//   useLayoutEffect,
// } from "react";
// import { io } from "socket.io-client";
// import { useLocalSearchParams, useNavigation, router } from "expo-router";
// import axios from "axios";
// import {
//   Alert,
//   KeyboardAvoidingView,
//   Platform,
//   TextInput,
//   TouchableOpacity,
//   View,
//   Image,
// } from "react-native";
// import { FlatList } from "react-native";
// import { Text } from "react-native";
// import { StyleSheet } from "react-native";
// import * as ImagePicker from "expo-image-picker";
// import { Ionicons } from "@expo/vector-icons";
// import useUserData from "@/hooks/userData";

// const socket = io(`${process.env}`, {
//   transports: ["websocket"],
//   jsonp: false,
// });

// function ChatScreen() {
//   const user = useUserData();
//   const { id, name, canChat } = useLocalSearchParams();
//   const [messages, setMessages] = useState([]);
//   const [inputText, setInputText] = useState("");
//   const [selectedImage, setSelectedImage] = useState(null);
//   const [isUploading, setIsUploading] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);
  
//   const userId = user?.publicMetadata?.dbPatientId as string;
//   const doctorId = id as string;
//   const navigation = useNavigation();

//   // Parse canChat more safely
//   const isChatAllowed = canChat === "true" || canChat === true;

//   console.log("canChat value:", canChat, "Type:", typeof canChat);
//   console.log("isChatAllowed:", isChatAllowed);

//   // Early validation to prevent crashes
//   useEffect(() => {
//     if (!userId || !doctorId) {
//       console.error("Missing required IDs:", { userId, doctorId });
//       setError("Missing user or doctor information");
//       // Navigate back if critical data is missing
//       setTimeout(() => {
//         if (router.canGoBack()) {
//           router.back();
//         }
//       }, 2000);
//       return;
//     }
//     setIsLoading(false);
//   }, [userId, doctorId]);

//   // Show message when chat is disabled
//   useEffect(() => {
//     if (!isLoading && !isChatAllowed) {
//       Alert.alert(
//         "Chat Disabled",
//         "Chat functionality is currently disabled for this conversation.",
//         [
//           {
//             text: "Go Back",
//             onPress: () => {
//               if (router.canGoBack()) {
//                 router.back();
//               }
//             },
//           },
//           {
//             text: "Stay",
//             style: "cancel",
//           },
//         ]
//       );
//     }
//   }, [isChatAllowed, isLoading]);

//   useLayoutEffect(() => {
//     if (name) {
//       navigation.setOptions({
//         headerTitle: () => (
//           <Text style={{ fontWeight: "600", fontSize: 18 }}>{name}</Text>
//         ),
//       });
//     }
//   }, [name, navigation]);

//   const currentUser = {
//     _id: userId,
//     name: "You",
//   };

//   // Helper function to get date string for grouping
//   const getDateString = (date) => {
//     try {
//       const messageDate = new Date(date);
//       const today = new Date();
//       const yesterday = new Date(today);
//       yesterday.setDate(yesterday.getDate() - 1);

//       if (messageDate.toDateString() === today.toDateString()) {
//         return "Today";
//       } else if (messageDate.toDateString() === yesterday.toDateString()) {
//         return "Yesterday";
//       } else {
//         return messageDate.toLocaleDateString("en-US", {
//           day: "numeric",
//           month: "long",
//           year:
//             messageDate.getFullYear() !== today.getFullYear()
//               ? "numeric"
//               : undefined,
//         });
//       }
//     } catch (error) {
//       console.error("Error formatting date:", error);
//       return "Unknown";
//     }
//   };

//   // Helper function to format time only
//   const formatTime = (date) => {
//     try {
//       return new Date(date).toLocaleTimeString([], {
//         hour: "2-digit",
//         minute: "2-digit",
//       });
//     } catch (error) {
//       console.error("Error formatting time:", error);
//       return "";
//     }
//   };

//   // Function to add date dividers to messages
//   const addDateDividers = (messages) => {
//     try {
//       const messagesWithDividers = [];
//       let currentDate = null;

//       messages.forEach((message, index) => {
//         const messageDate = getDateString(message.createdAt);

//         // Add date divider if date changed
//         if (currentDate !== messageDate) {
//           messagesWithDividers.push({
//             _id: `date-${messageDate}-${index}`,
//             type: "date-divider",
//             date: messageDate,
//           });
//           currentDate = messageDate;
//         }

//         messagesWithDividers.push(message);
//       });

//       return messagesWithDividers;
//     } catch (error) {
//       console.error("Error adding date dividers:", error);
//       return messages;
//     }
//   };

//   // Load existing chat history
//   const fetchChats = async () => {
//     try {
//       if (!userId || !doctorId) {
//         console.warn("Cannot fetch chats: missing userId or doctorId");
//         return;
//       }

//       const res = await axios.post(
//         `${process.env.API_BASE_URL}/api/doctor/chat/getUserChats`,
//         {
//           userId: userId,
//         },
//         {
//           timeout: 10000, // 10 seconds timeout
//         }
//       );

//       console.log("Chat fetch response:", res.data);
      
//       // Find the chat between this patient and the specific doctor
//       const chat = res?.data?.chats?.find(
//         (c) => c?.doctorId?._id === doctorId || c?.doctorId === doctorId
//       );

//       if (chat && chat.messages && Array.isArray(chat.messages)) {
//         const formatted = chat.messages
//           .map((msg: any, index: number) => ({
//             _id: `${msg?._id || index}`,
//             text: msg.text || "",
//             createdAt: new Date(msg.timestamp || msg.createdAt || Date.now()),
//             user: {
//               _id: msg.senderId,
//               name: msg.role === "doctor" ? "Doctor" : "Patient",
//               avatar: msg.imageUrl || undefined,
//             },
//             image: msg.imageUrl || undefined,
//           }))
//           .sort(
//             (a, b) =>
//               new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
//           );

//         const messagesWithDividers = addDateDividers(formatted);
//         setMessages(messagesWithDividers);
//       } else {
//         setMessages([]);
//       }
//     } catch (error) {
//       console.error("Error fetching chats:", error);
//       setError("Failed to load chat history");
//       // Don't crash the app, just show empty messages
//       setMessages([]);
//     }
//   };

//   // Socket connection and room management
//   const roomId = userId && doctorId ? [userId, doctorId].sort().join("_") : null;

//   useEffect(() => {
//     if (!roomId || !userId || !doctorId) {
//       console.warn("Cannot setup socket: missing required data");
//       return;
//     }

//     const handleConnect = () => {
//       console.log("Socket connected");
//       socket.emit("register_user", userId);
//       socket.emit("join_room", { roomId });
//     };

//     const handleDisconnect = () => {
//       console.log("Socket disconnected");
//     };

//     const handleNewMessage = (msg) => {
//       console.log("NEW MESSAGE received:", msg);
//       try {
//         if (
//           (msg.userId === userId && msg.doctorId === doctorId) ||
//           (msg.userId === doctorId && msg.doctorId === userId)
//         ) {
//           // Don't add message if it's from the current user (avoid duplicates)
//           if (msg.senderId !== userId) {
//             const formatted = {
//               _id: `${Date.now()}-${Math.random()}`,
//               text: msg.text || "",
//               createdAt: new Date(),
//               user: {
//                 _id: msg.senderId,
//                 name: msg.role === "doctor" ? "Doctor" : "Patient",
//                 avatar: msg.imageUrl || undefined,
//               },
//               image: msg.imageUrl || undefined,
//             };

//             setMessages((prev) => {
//               const messagesOnly = prev.filter(
//                 (item) => item.type !== "date-divider"
//               );
//               const newMessages = [...messagesOnly, formatted];
//               return addDateDividers(newMessages);
//             });
//           }
//         }
//       } catch (error) {
//         console.error("Error handling new message:", error);
//       }
//     };

//     // Register event listeners
//     socket.on("connect", handleConnect);
//     socket.on("disconnect", handleDisconnect);
//     socket.on("new_message", handleNewMessage);

//     // Register user and join room if already connected
//     if (socket.connected) {
//       handleConnect();
//     }

//     // Cleanup
//     return () => {
//       console.log("Cleaning up socket listeners");
//       socket.emit("leave_room", { roomId });
//       socket.off("connect", handleConnect);
//       socket.off("disconnect", handleDisconnect);
//       socket.off("new_message", handleNewMessage);
//     };
//   }, [roomId, userId, doctorId]);

//   useEffect(() => {
//     if (!isLoading && userId && doctorId) {
//       fetchChats();
//     }
//   }, [userId, doctorId, isLoading]);

//   // Send messages - Modified to work with input text
//   const onSend = useCallback(
//     (messageText?: string) => {
//       try {
//         const textToSend = messageText || inputText.trim();

//         if (!textToSend || !isChatAllowed || !userId || !doctorId) {
//           console.warn("Cannot send message:", { 
//             textToSend: !!textToSend, 
//             isChatAllowed, 
//             userId: !!userId, 
//             doctorId: !!doctorId 
//           });
//           return;
//         }

//         // Create message object
//         const message = {
//           _id: `${Date.now()}-${Math.random()}`,
//           text: textToSend,
//           createdAt: new Date(),
//           user: {
//             _id: userId,
//             name: "You",
//           },
//         };

//         setMessages((prev) => {
//           const messagesOnly = prev.filter(
//             (item) => item.type !== "date-divider"
//           );
//           const newMessages = [...messagesOnly, message];
//           return addDateDividers(newMessages);
//         });

//         setInputText(""); // Clear input after sending

//         // Send via socket
//         socket.emit("new_message", {
//           userId: userId,
//           doctorId: doctorId,
//           senderId: userId,
//           text: textToSend,
//           role: "patient",
//         });

//         // Save to database
//         axios
//           .post(`${process.env.API_BASE_URL}/api/doctor/chat/addChat`, {
//             userId: userId,
//             doctorId: doctorId,
//             senderId: userId,
//             text: textToSend,
//           })
//           .catch((error) => {
//             console.error("Error saving message:", error);
//             // Could show a retry option here
//           });
//       } catch (error) {
//         console.error("Error in onSend:", error);
//       }
//     },
//     [userId, doctorId, inputText, isChatAllowed]
//   );

//   // Handle send button press
//   const handleSend = useCallback(() => {
//     onSend();
//   }, [onSend]);

//   const flatListRef = useRef(null);

//   const renderItem = ({ item }) => {
//     try {
//       // Render date divider
//       if (item.type === "date-divider") {
//         return (
//           <View style={styles.dateDividerContainer}>
//             <View style={styles.dateDividerLine} />
//             <Text style={styles.dateDividerText}>{item.date}</Text>
//             <View style={styles.dateDividerLine} />
//           </View>
//         );
//       }

//       const isMyMessage = item.user._id === userId;
//       const hasImageOnly = item.image && !item.text;

//       // Render message
//       return (
//         <View
//           style={[
//             styles.messageBubble,
//             isMyMessage ? styles.myMessage : styles.otherMessage,
//             hasImageOnly && styles.imageOnlyBubble,
//           ]}
//         >
//           {item.image && (
//             <Image
//               source={{ uri: item.image }}
//               style={styles.messageImage}
//               resizeMode="cover"
//               onError={(error) => {
//                 console.log("Image load error:", error);
//               }}
//             />
//           )}
//           {item.text && (
//             <Text
//               style={[
//                 styles.messageText,
//                 isMyMessage ? styles.myMessageText : styles.otherMessageText,
//               ]}
//             >
//               {item.text}
//             </Text>
//           )}
//           <Text
//             style={[
//               styles.timestamp,
//               isMyMessage ? styles.myTimestamp : styles.otherTimestamp,
//             ]}
//           >
//             {formatTime(item.createdAt)}
//           </Text>
//         </View>
//       );
//     } catch (error) {
//       console.error("Error rendering message item:", error);
//       return null;
//     }
//   };

//   const handlePickImage = async () => {
//     if (!isChatAllowed) {
//       Alert.alert("Chat Disabled", "You cannot send images in this chat.");
//       return;
//     }

//     if (!userId || !doctorId) {
//       Alert.alert("Error", "Cannot send image: missing user information.");
//       return;
//     }

//     try {
//       // Request permissions
//       const { status } =
//         await ImagePicker.requestMediaLibraryPermissionsAsync();
//       if (status !== "granted") {
//         Alert.alert(
//           "Permission Required",
//           "Sorry, we need camera roll permissions to make this work!"
//         );
//         return;
//       }

//       const result = await ImagePicker.launchImageLibraryAsync({
//         mediaTypes: ImagePicker.MediaTypeOptions.Images,
//         allowsEditing: true,
//         aspect: [4, 3],
//         quality: 0.7,
//       });

//       if (!result.canceled && result.assets?.length > 0) {
//         const image = result.assets[0];
//         const uri = image.uri;
//         const name = uri.split("/").pop() || `image_${Date.now()}.jpg`;
//         const match = /\.(\w+)$/.exec(name);
//         const type = match ? `image/${match[1]}` : `image/jpeg`;

//         const formData = new FormData();
//         formData.append("userId", userId);
//         formData.append("doctorId", doctorId);
//         formData.append("senderId", userId);
//         formData.append("image", {
//           uri,
//           name,
//           type,
//         } as any);

//         setIsUploading(true);

//         try {
//           const res = await axios.post(
//             `${process.env.API_BASE_URL}/api/doctor/chat/addChat`,
//             formData,
//             {
//               headers: {
//                 "Content-Type": "multipart/form-data",
//               },
//               timeout: 30000, // 30 seconds timeout
//             }
//           );

//           const msg = res.data?.chat?.messages?.slice(-1)[0];
//           const uploadedUrl = res.data?.imageUrl;
//           if (msg) {
//             const formatted = {
//               _id: `${Date.now()}-${Math.random()}`,
//               text: msg.text || "",
//               createdAt: new Date(msg.createdAt || Date.now()),
//               user: {
//                 _id: msg.senderId,
//                 name: msg.role === "doctor" ? "Doctor" : "Patient",
//                 avatar: uploadedUrl,
//               },
//               image: uploadedUrl,
//               isUploading: true,
//             };

//             setMessages((prev) => {
//               const messagesOnly = prev.filter(
//                 (item) => item.type !== "date-divider"
//               );
//               const newMessages = [...messagesOnly, formatted];
//               return addDateDividers(newMessages);
//             });

//             // Send via socket
//             socket.emit("new_message", {
//               userId,
//               doctorId,
//               senderId: userId,
//               text: msg.text || "",
//               imageUrl: msg.imageUrl,
//               role: "patient",
//             });
//           }
//         } catch (error) {
//           console.error("Error uploading image:", error);
//           Alert.alert(
//             "Upload Error",
//             "Failed to upload image. Please try again."
//           );
//         } finally {
//           setIsUploading(false);
//         }
//       }
//     } catch (error) {
//       setIsUploading(false);
//       console.error("Image picking error:", error);
//       Alert.alert("Error", "Failed to pick image. Please try again.");
//     }
//   };

//   // Show loading state
//   if (isLoading) {
//     return (
//       <View style={[styles.container, styles.centerContent]}>
//         <Text>Loading chat...</Text>
//       </View>
//     );
//   }

//   // Show error state
//   if (error) {
//     return (
//       <View style={[styles.container, styles.centerContent]}>
//         <Text style={styles.errorText}>{error}</Text>
//         <TouchableOpacity
//           style={styles.retryButton}
//           onPress={() => {
//             setError(null);
//             fetchChats();
//           }}
//         >
//           <Text style={styles.retryButtonText}>Retry</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   return (
//     <KeyboardAvoidingView
//       style={styles.container}
//       behavior={Platform.OS === "ios" ? "padding" : undefined}
//       keyboardVerticalOffset={90}
//     >
//       <FlatList
//         ref={flatListRef}
//         data={messages}
//         keyExtractor={(item, index) => item._id || index.toString()}
//         renderItem={renderItem}
//         contentContainerStyle={styles.chatContainer}
//         onContentSizeChange={() =>
//           flatListRef.current?.scrollToEnd({ animated: true })
//         }
//         onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
//       />

//       {!isChatAllowed && (
//         <View style={styles.disabledChatBanner}>
//           <Text style={styles.disabledChatText}>
//             Chat is currently disabled for this conversation
//           </Text>
//         </View>
//       )}

//       <View style={styles.inputContainer}>
//         <TouchableOpacity
//           onPress={handlePickImage}
//           style={[
//             styles.iconButton,
//             (!isChatAllowed || isUploading) && styles.disabledButton,
//           ]}
//           disabled={isUploading || !isChatAllowed}
//         >
//           <Ionicons name="add" size={24} color={!isChatAllowed ? "#ccc" : "#666"} />
//         </TouchableOpacity>
//         <TextInput
//           style={[
//             styles.textInput,
//             !isChatAllowed && styles.disabledTextInput,
//           ]}
//           value={inputText}
//           onChangeText={setInputText}
//           placeholder={isChatAllowed ? "Type a message..." : "Chat disabled"}
//           placeholderTextColor={!isChatAllowed ? "#ccc" : "#000"}
//           multiline
//           onSubmitEditing={handleSend}
//           returnKeyType="send"
//           editable={isChatAllowed}
//         />
//         <TouchableOpacity
//           onPress={handleSend}
//           style={[
//             styles.sendIconWrapper,
//             (!inputText.trim() || !isChatAllowed) && styles.sendIconDisabled,
//           ]}
//           disabled={!inputText.trim() || !isChatAllowed}
//         >
//           <Ionicons name="send" size={22} color="#fff" />
//         </TouchableOpacity>
//       </View>
//     </KeyboardAvoidingView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//   },
//   centerContent: {
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   errorText: {
//     color: "red",
//     fontSize: 16,
//     textAlign: "center",
//     marginBottom: 20,
//   },
//   retryButton: {
//     backgroundColor: "#007AFF",
//     paddingHorizontal: 20,
//     paddingVertical: 10,
//     borderRadius: 8,
//   },
//   retryButtonText: {
//     color: "white",
//     fontSize: 16,
//     fontWeight: "500",
//   },
//   chatContainer: {
//     padding: 10,
//     flexGrow: 1,
//   },
//   messageBubble: {
//     maxWidth: "80%",
//     padding: 12,
//     borderRadius: 18,
//     marginVertical: 2,
//     shadowColor: "#000",
//     shadowOffset: {
//       width: 0,
//       height: 1,
//     },
//     shadowOpacity: 0.1,
//     shadowRadius: 1,
//     elevation: 1,
//   },
//   myMessage: {
//     backgroundColor: "#E5E5E7",
//     alignSelf: "flex-end",
//     borderBottomRightRadius: 4,
//   },
//   otherMessage: {
//     backgroundColor: "#C1EFFF",
//     alignSelf: "flex-start",
//     borderBottomLeftRadius: 4,
//   },
//   messageText: {
//     fontSize: 16,
//     lineHeight: 20,
//   },
//   myMessageText: {
//     color: "#000",
//   },
//   otherMessageText: {
//     color: "#000",
//   },
//   timestamp: {
//     fontSize: 10,
//     alignSelf: "flex-end",
//     marginTop: 4,
//   },
//   myTimestamp: {
//     color: "#000",
//   },
//   otherTimestamp: {
//     color: "#000",
//   },
//   dateDividerContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginVertical: 20,
//     marginHorizontal: 20,
//   },
//   dateDividerLine: {
//     flex: 1,
//     height: 1,
//     backgroundColor: "#E0E0E0",
//   },
//   dateDividerText: {
//     backgroundColor: "#F5F5F5",
//     color: "#666",
//     fontSize: 12,
//     fontWeight: "500",
//     paddingHorizontal: 12,
//     paddingVertical: 4,
//     borderRadius: 12,
//     marginHorizontal: 10,
//     textAlign: "center",
//   },
//   disabledChatBanner: {
//     backgroundColor: "#FFF3CD",
//     paddingHorizontal: 15,
//     paddingVertical: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: "#E0E0E0",
//   },
//   disabledChatText: {
//     color: "#856404",
//     fontSize: 14,
//     textAlign: "center",
//   },
//   inputContainer: {
//     flexDirection: "row",
//     padding: 10,
//     borderTopWidth: 1,
//     borderColor: "#E5E5E7",
//     backgroundColor: "#fff",
//   },
//   textInput: {
//     flex: 1,
//     padding: 12,
//     backgroundColor: "#f0f0f0",
//     borderRadius: 20,
//     maxHeight: 100,
//     fontSize: 16,
//   },
//   disabledTextInput: {
//     backgroundColor: "#f5f5f5",
//     color: "#ccc",
//   },
//   iconButton: {
//     justifyContent: "center",
//     alignItems: "center",
//     marginRight: 8,
//     width: 36,
//     height: 36,
//   },
//   disabledButton: {
//     opacity: 0.5,
//   },
//   sendIconWrapper: {
//     backgroundColor: "#007AFF",
//     borderRadius: 20,
//     padding: 10,
//     justifyContent: "center",
//     alignItems: "center",
//     marginLeft: 8,
//   },
//   sendIconDisabled: {
//     backgroundColor: "#ccc",
//   },
//   messageImage: {
//     width: 200,
//     height: 200,
//     borderRadius: 10,
//     marginBottom: 5,
//   },
//   imageOnlyBubble: {
//     backgroundColor: "transparent",
//     padding: 0,
//     borderRadius: 0,
//     shadowColor: "transparent",
//     elevation: 0,
//   },
// });

// export default ChatScreen;