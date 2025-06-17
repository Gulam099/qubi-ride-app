// import React, { useEffect, useState } from "react";
// import { View, ScrollView, Image, FlatList } from "react-native";
// import { Stack, useLocalSearchParams } from "expo-router";
// import { Button } from "@/components/ui/Button";
// import { toast } from "sonner-native";
// import ScheduleSelector from "@/features/Home/Components/ScheduleSelector";
// import { useSelector } from "react-redux";
// import { UserType } from "@/features/user/types/user.type";
// import BackButton from "@/features/Home/Components/BackButton";
// import NotificationIconButton from "@/features/Home/Components/NotificationIconButton";
// import {
//   ChartCircle,
//   ExportCurve,
//   Heart,
//   MessageText,
//   Messages1,
//   People,
//   Profile2User,
//   Star1,
// } from "iconsax-react-native";
// import { Text } from "@/components/ui/Text";
// import ProfileImage from "@/features/account/components/ProfileImage";
// import {
//   Accordion,
//   AccordionContent,
//   AccordionItem,
//   AccordionTrigger,
// } from "@/components/ui/Accordion";
// import { currencyFormatter } from "@/utils/currencyFormatter.utils";
// import { apiNewUrl } from "@/const";
// import { useUser } from "@clerk/clerk-expo";

// export default function SupportDetailPage() {
//   const { support } = useLocalSearchParams(); // Get groupId from route params
//   const {user} = useUser();
//   const userId = user?.publicMetadata.dbPatientId as string

//   const [groupDetails, setGroupDetails] = useState<any | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [selectedDateTime, setSelectedDateTime] = useState("");
//   const [showScheduleSelector, setShowScheduleSelector] = useState(false);

//   useEffect(() => {
//     // Fetch group details dynamically
//     const fetchGroupDetails = async () => {
//       try {
//         setLoading(true);
//         const response = await fetch(
//           `${apiNewUrl}/group/get_group_by_id?groupId=${support}`
//         );
//         const result = await response.json();

//         if (response.ok && result.success) {
//           setGroupDetails(result.data);
//         } else {
//           throw new Error(result.message || "Failed to fetch group details");
//         }
//       } catch (error) {
//         console.error("Error fetching group details:", error);
//         toast.error("Error fetching support group details");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchGroupDetails();
//   }, [support]);

//   const handleBuy = () => {
//     setShowScheduleSelector(true);
//   };

//   const finalSubmit = async () => {
//     if (!selectedDateTime) {
//       toast.error("Please select a date and time.");
//       return;
//     }

//     const payload = {
//       groupId: groupDetails._id,
//       userId: userId,
//       dateTime: selectedDateTime,
//     };

//     try {
//       const response = await fetch(`${apiNewUrl}/group/book`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(payload),
//       });

//       if (response.ok) {
//         toast.success("Schedule confirmed successfully!");
//       } else {
//         toast.error("Failed to book the schedule.");
//       }
//     } catch (error) {
//       console.error("Error submitting schedule:", error);
//       toast.error("An error occurred while booking.");
//     }
//   };

//   if (loading) {
//     return (
//       <View className="flex-1 justify-center items-center">
//         <Text className="text-gray-500">Loading...</Text>
//       </View>
//     );
//   }

//   if (!groupDetails) {
//     return (
//       <View className="flex-1 justify-center items-center">
//         <Text className="text-red-500">Support Group Not Found</Text>
//       </View>
//     );
//   }

//   return (
//     <>
//       <Stack.Screen
//         options={{
//           headerShown: true,
//           headerShadowVisible: false,
//           headerTitle: () => (
//             <Text className="font-semibold text-lg leading-8">
//               {groupDetails.title}
//             </Text>
//           ),
//           headerLeft: () => <BackButton />,
//           headerRight: () => <NotificationIconButton className="mr-4" />,
//         }}
//       />

//       <ScrollView className=" bg-blue-50/10 flex-1">
//         {!showScheduleSelector ? (
//           <View className="px-4 py-4 gap-4">
//             {/* Group Header */}
//             <View className="bg-white py-6 rounded-2xl">
//               <View className="flex-row justify-between pb-4">
//                 <View className="gap-2 px-4">
//                   <Text className="font-semibold text-xl">
//                     {groupDetails.title}
//                   </Text>
//                   <Text className="text-gray-500 capitalize">
//                     {groupDetails.category}
//                   </Text>
//                 </View>
//                 <View className="gap-3 px-4 flex-row items-center justify-center">
//                   <View className="p-2 bg-blue-50/20 aspect-square rounded-full items-center justify-center">
//                     <ExportCurve size="20" color="#000" />
//                   </View>
//                   <Text className="text-gray-500 leading-8">
//                     {groupDetails.shares}
//                   </Text>
//                   <View className="p-2 bg-blue-50/20 aspect-square rounded-full items-center justify-center">
//                     <Heart size="20" color="#000" />
//                   </View>
//                   <Text className="text-gray-500 leading-8 ">
//                     {groupDetails.likes}
//                   </Text>
//                 </View>
//               </View>
//               <Image
//                 source={{ uri: groupDetails.image }}
//                 className="w-full h-64"
//                 resizeMode="cover"
//               />
//               <View className="px-4 py-6 gap-4">
//                 <View className="gap-3 flex-row items-center justify-start">
//                   <View className="p-2 bg-blue-50/20 aspect-square rounded-full items-center justify-center">
//                     <People size="20" color="#000" />
//                   </View>
//                   <Text className="text-gray-500 leading-8">
//                     {groupDetails.recordedCount} Recorded
//                   </Text>
//                   <View className="p-2 bg-blue-50/20 aspect-square rounded-full items-center justify-center">
//                     <Star1 size="20" color="#000" />
//                   </View>
//                   <Text className="text-gray-500 leading-8 ">
//                     {groupDetails.rating} Rate
//                   </Text>
//                 </View>
//                 <Text className="text-gray-600 mt-4">
//                   {groupDetails.description}
//                 </Text>
//               </View>
//             </View>

//             {/* Group Goals */}
//             <View className="gap-2">
//               <View className="gap-2 flex-row items-center justify-start">
//                 <View className="bg-white rounded-full p-2">
//                   <ChartCircle size="24" color="#000" />
//                 </View>
//                 <Text className="font-semibold text-xl leading-10">
//                   Support Group Goals
//                 </Text>
//               </View>
//               {groupDetails.groupGoals.map((goal: string, index: number) => (
//                 <Text key={`goal-${index}`} className="text-gray-700 pl-6 ">
//                   • {goal}
//                 </Text>
//               ))}
//             </View>

//             {/* Program Content */}
//             <View className="gap-2">
//               <View className="gap-2 flex-row items-center justify-start">
//                 <View className="bg-white rounded-full p-2">
//                   <MessageText size="24" color="#000" />
//                 </View>
//                 <Text className="font-semibold text-xl leading-10">
//                   Program Content
//                 </Text>
//               </View>
//               {groupDetails.programContent.map(
//                 (content: any, index: number) => (
//                   <Text key={`content-${index}`} className="text-gray-700 pl-6">
//                     • {content.title}: {content.description}
//                   </Text>
//                 )
//               )}
//             </View>
            
//               {/* Consultants */}
//               <View className="gap-2">
//               <View className="gap-2 flex-row items-center justify-start">
//                 <View className="bg-white rounded-full p-2">
//                   <Profile2User size="24" color="#000" />
//                 </View>
//                 <Text className="font-semibold text-xl leading-10">
//                   Consultants
//                 </Text>
//               </View>
//               <FlatList
//                 data={groupDetails.consultants}
//                 horizontal={true}
//                 showsHorizontalScrollIndicator={false}
//                 keyExtractor={(item) => item._id.toString()}
//                 renderItem={({ item }) => (
//                   <View className="items-center bg-white flex-row gap-2 py-4 px-6 rounded-2xl">
//                     <ProfileImage
//                       className="size-16"
//                       imageUrl={item.image}
//                       name={item.name}
//                     />
//                     <View className="flex-col gap-1">
//                       <Text className="text-gray-800 mt-2 text-center font-medium text-lg">
//                         {item.name}
//                       </Text>
//                       <Text className="text-gray-500 text-sm">
//                         {item.specialization}
//                       </Text>
//                     </View>
//                   </View>
//                 )}
//                 contentContainerClassName="gap-2 py-6"
//               />
//             </View>

//             {/* FAQ */}
//             <View className="gap-2">
//               <Accordion type="multiple" collapsible>
//                 {groupDetails.faq.map((faq: any, index: number) => (
//                   <AccordionItem value={`faq-${index}`} key={`faq-${index}`}>
//                     <AccordionTrigger>
//                       <Text>{faq.question}</Text>
//                     </AccordionTrigger>
//                     <AccordionContent>
//                       <Text>{faq.answer}</Text>
//                     </AccordionContent>
//                   </AccordionItem>
//                 ))}
//               </Accordion>
//             </View>

//             <Button
//               className="w-full bg-purple-600 py-4 rounded-md my-6"
//               onPress={handleBuy}
//             >
//               <Text className="text-white font-semibold">
//                 Pay {currencyFormatter(groupDetails.price)}
//               </Text>
//             </Button>
//           </View>
//         ) : (
//           <View className="p-4 gap-4">
//             {/* Schedule Selector */}
//             <ScheduleSelector
//               selectedDateTime={selectedDateTime}
//               setSelectedDateTime={setSelectedDateTime}
//               availableTimes={groupDetails.availableDates}
//             />
//             <Button className="w-full " onPress={finalSubmit}>
//               <Text className="text-white font-semibold">Confirm Schedule</Text>
//             </Button>
//             <Button
//               className="w-full "
//               variant={"ghost"}
//               onPress={() => {
//                 setShowScheduleSelector(false);
//               }}
//             >
//               <Text className="text-neutral-700 font-semibold">Back</Text>
//             </Button>
//           </View>
//         )}
//       </ScrollView>
//     </>
//   );
// }
