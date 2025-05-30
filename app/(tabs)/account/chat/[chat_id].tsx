// import React, { useState, useCallback, useEffect } from "react";
// import { Image, TouchableOpacity, View } from "react-native";
// import { Text } from "@/components/ui/Text";
// import ProfileImage from "@/features/account/components/ProfileImage";
// import { useUser } from "@clerk/clerk-expo";
// import { Stack } from "expo-router";
// import * as ImagePicker from "expo-image-picker";
// import * as DocumentPicker from "expo-document-picker";
// import {
//   ArrowCircleDown2,
//   Paperclip2,
//   Send as SendIcon,
//   Image as ImageIcon,
// } from "iconsax-react-native";
// import { Bubble, GiftedChat, Send } from "react-native-gifted-chat";

// interface Reply {
//   title: string;
//   value: string;
//   messageId?: number | string;
// }

// interface QuickReplies {
//   type: "radio" | "checkbox";
//   values: Reply[];
//   keepIt?: boolean;
// }

// export interface IMessage {
//   _id: string | number;
//   text: string;
//   createdAt: Date | number;
//   user: User;
//   image?: string;
//   video?: string;
//   audio?: string;
//   system?: boolean;
//   sent?: boolean;
//   received?: boolean;
//   pending?: boolean;
//   quickReplies?: QuickReplies;
// }

// export default function ChatIdMessagePage() {
//   const { user } = useUser();
//   const [messages, setMessages] = useState<IMessage[]>([]);
//   const [imagePath, setImagePath] = useState("");
//   const [filePath, setFilePath] = useState("");
//   const [isAttachImage, setIsAttachImage] = useState(false);
//   const [isAttachFile, setIsAttachFile] = useState(false);

//   useEffect(() => {
//     setMessages([
//       {
//         _id: 1,
//         text: "Welcome !",
//         createdAt: new Date(),
//         user: {
//           _id: 2,
//           name: "React Native",
//           avatar:
//             "https://huggingface.co/datasets/huggingfacejs/tasks/resolve/main/zero-shot-image-classification/image-classification-input.jpeg",
//         },
//         image:
//           "https://i0.wp.com/plopdo.com/wp-content/uploads/2021/11/feature-pic.jpg?fit=537%2C322&ssl=1",
//       },
//     ]);
//   }, []);

//   // 📷 Image Picker
//   const pickImage = async () => {
//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ["images", "videos"],
//       allowsEditing: true,
//       quality: 1,
//       base64: true,
//     });

//     if (!result.canceled && result.assets[0].base64) {
//       const base64 = result.assets[0].base64;
//       const mimeType = result.assets[0].mimeType;

//       const image = `data:${mimeType};base64,${base64}`;
//       setImagePath(image);
//       setIsAttachImage(true);
//     }
//   };

//   // 📄 File Picker
//   const pickFile = async () => {
//     const result = await DocumentPicker.getDocumentAsync({
//       type: "*/*",
//     });

//     if (result.type !== "cancel") {
//       setFilePath(result.uri);
//       setIsAttachFile(true);
//     }
//   };

//   // 📨 Send Message
//   const onSend = useCallback(
//     (messages = []) => {
//       let newMessage = {
//         _id: messages[0]._id + 1,
//         text: messages[0].text,
//         createdAt: new Date(),
//         user: {
//           _id: user?.id!,
//           avatar: user?.imageUrl!,
//         },
//         image: isAttachImage ? imagePath : "",
//         file: isAttachFile ? { url: filePath } : null,
//       };

//       setMessages((prevMessages) =>
//         GiftedChat.append(prevMessages, [newMessage])
//       );
//       setImagePath("");
//       setFilePath("");
//       setIsAttachImage(false);
//       setIsAttachFile(false);
//     },
//     [filePath, imagePath, isAttachFile, isAttachImage]
//   );

//   // ✉️ Custom Send Button
//   const renderSend = (props: any) => (
//     <Send {...props}>
//       <View className="flex-row ">
//         <TouchableOpacity onPress={pickFile}>
//           <Paperclip2 size="24" />
//         </TouchableOpacity>
//         <TouchableOpacity onPress={pickImage} style={{ marginHorizontal: 8 }}>
//           <ImageIcon size="24" />
//         </TouchableOpacity>
//         <SendIcon size="24" />
//       </View>
//     </Send>
//   );

//   // 🏞️ Render Selected Image/File
//   const renderChatFooter = () => {
//     if (imagePath) {
//       return (
//         <View style={{ alignItems: "center", padding: 10 }}>
//           <Image
//             source={{ uri: imagePath }}
//             style={{ width: 100, height: 100, borderRadius: 10 }}
//           />
//           <TouchableOpacity onPress={() => setImagePath("")}>
//             <Text style={{ color: "red", marginTop: 5 }}>Remove Image</Text>
//           </TouchableOpacity>
//         </View>
//       );
//     }
//     if (filePath) {
//       return (
//         <View style={{ alignItems: "center", padding: 10 }}>
//           <Text style={{ color: "blue" }}>
//             Selected File: {filePath.split("/").pop()}
//           </Text>
//           <TouchableOpacity onPress={() => setFilePath("")}>
//             <Text style={{ color: "red", marginTop: 5 }}>Remove File</Text>
//           </TouchableOpacity>
//         </View>
//       );
//     }
//     return null;
//   };

//   return (
//     <>
//       <Stack.Screen
//         options={{
//           headerTitle: () => (
//             <View className="flex-row gap-2 items-center ">
//               <ProfileImage
//                 imageUrl={
//                   messages[0]?.user.avatar ||
//                   "https://avatar.iran.liara.run/public"
//                 }
//                 name={messages[0]?.user.name || "User"}
//                 className="size-12 border"
//               />
//               <Text className="font-semibold text-lg">
//                 {messages[0]?.user.name || "User"}
//               </Text>
//             </View>
//           ),
//         }}
//       />

//       <GiftedChat
//         messages={messages}
//         onSend={(messages) => onSend(messages)}
//         user={{
//           _id: user?.id!,
//           name: user?.fullName!,
//           avatar: user?.imageUrl!,
//         }}
//         renderBubble={(props) => (
//           <Bubble
//             {...props}
//             wrapperStyle={{
//               right: { backgroundColor: "#2e64e5" },
//             }}
//             textStyle={{
//               right: { color: "#fff" },
//             }}
//           />
//         )}
//         alwaysShowSend
//         renderSend={renderSend}
//         scrollToBottom
//         scrollToBottomComponent={() => (
//           <ArrowCircleDown2 size="32" color="#FF8A65" />
//         )}
//         renderChatFooter={renderChatFooter}
//       />
//     </>
//   );
// }
