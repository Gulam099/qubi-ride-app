import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Link, RelativePathString } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { H3, H4 } from "@/components/ui/Typography";
import {
  Add,
  Book,
  Clipboard,
  ClipboardText,
  Copy,
  Edit,
  EmptyWalletTime,
  Like1,
  MenuBoard,
  Message,
  Messages,
  Profile2User,
  Receipt,
  Setting2,
  Video,
} from "iconsax-react-native";
import colors from "@/utils/colors";
import AccountCard from "@/features/account/components/AccountCard";
import { useRouter } from "expo-router";
import CopyToClipboard from "@/features/Home/Components/CopyToClipboard";
import AccountCard2 from "@/features/account/components/AccountCard2";
import ProfileImage from "@/features/account/components/ProfileImage";
import { useUser } from "@clerk/clerk-expo";
import {
  SignOutButton,
  SignOutSheet,
} from "@/features/account/components/SignOutButton";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { DoorOpen, X } from "lucide-react-native";
import { CustomImages } from "@/const";
import {
  DeleteAccountButton,
  DeleteAccountSheet,
} from "@/features/account/components/AccountDeleteButton";

export default function AccountPage() {
  const { user } = useUser();
  const userId = user?.publicMetadata?.dbPatientId as string;
  const router = useRouter();

  const contactUsBottomSheetRef = useRef<BottomSheet>(null);
  const signOutRef = useRef(null);
  const deleteAccountRef = useRef(null);

  const [Interests, setInterests] = useState([
    {
      title: "My Interests",
      shadowColor: colors.blue[100],
      backgroundColor: colors.primary[800],
      iconColor: "white",
      items: [
        { link: "/account/calendar", label: "My calendar", icon: MenuBoard },
        { link: "/account/scale", label: "Metrics", icon: Clipboard },
        { link: "/account/chat", label: "My chats", icon: Message },
        // {
        //   link: "/(stacks)/call/1234/videocall",
        //   label: "Video Call",
        //   icon: Video,
        // },
        // {
        //   link: "/(stacks)/joinroom/1234",
        //   label: "Join Room with Id",
        //   icon: DoorOpen,
        // },
        // { link: "/(stacks)/payment/1234", label: "Payment", icon: DoorOpen },
      ],
    },
  ]);

  const [sections, setSections] = useState([
    {
      title: "Medical file",
      shadowColor: colors.blue[100],
      className: "",
      backgroundColor: "white",
      iconColor: colors.gray[700],
      items: [
        {
          link: "/account/appointment",
          label: "My bookings",
          icon: ClipboardText,
        },
        { link: "/account/report", label: "My reports", icon: Book },
        { link: "/account/calendar", label: "My calendar", icon: MenuBoard },
        { link: "/account/scale", label: "Metrics", icon: Clipboard },
      ],
    },
    {
      title: "My information",
      shadowColor: colors.blue[100],
      className: "",
      backgroundColor: "white",
      iconColor: colors.gray[700],
      items: [
        { link: "/account/payment", label: "Payment", icon: EmptyWalletTime },
        { link: "/account/favorite", label: "My favorites", icon: Like1 },
        { link: "/account/chat", label: "My chats", icon: Message },
        { link: "/account/invoice", label: "My bills", icon: Receipt },
        { link: "/account/family", label: "My family", icon: Profile2User },
        { link: "/account/setting", label: "My settings", icon: Setting2 },
      ],
    },
  ]);

  const ContactUsCard = {
    shadowColor: colors.blue[100],
    className: "",
    backgroundColor: "white",
    iconColor: colors.gray[700],
    item: { link: "/contact", label: "Contact us", icon: Messages },
  };

  const handleAccountCardPress = (link: string) => {
    console.log(`Card pressed: ${link}`);
    return router.push(`${link}` as RelativePathString);
    // Perform state updates or navigation if needed
  };

  const [value, setValue] = React.useState("");

  function onLabelPress(label: string) {
    return () => {
      setValue(label);
    };
  }

  return (
    <SafeAreaView>
      <View className="h-full bg-neutral-200">
        <ScrollView
          showsVerticalScrollIndicator={false} // Optional: hides the scroll bar
        >
          <View className="flex-row justify-start items-center gap-5 bg-primary-800 w-full px-4 py-16 relative">
            <ProfileImage imageUrl={user?.imageUrl!} name={user?.id!} />
            <View className="flex-1">
              <Text className="text-lg font-semibold text-white ">
                {user?.fullName ?? "User"}
              </Text>
              <CopyToClipboard
                data={userId ?? "User id not found"}
                variant={"ghost"}
                className="flex-row gap-2 justify-start items-start p-0"
              >
                <Text className="text-base  text-gray-200 ">
                  {userId ?? "User id not found"}
                </Text>
                <Copy size="16" color={colors.gray[200]} />
              </CopyToClipboard>
              <Link href={"/account/profile"}>
                <Text className="text-blue-100 text-sm underline">
                  View Profile
                </Text>
              </Link>
            </View>
            <View className={"absolute -top-4 -right-6"}>
              <CustomImages.TextureCircle.image />
            </View>

            <Button
              className="bg-primary-700 p-2 rounded-2xl aspect-square"
              onPress={() => router.push("/account/profile")}
            >
              <Edit size="24" color={colors.gray[100]} />
            </Button>
          </View>
          <View className="flex justify-center items-center h-full w-full flex-1 p-6 pt-2">
            <View className="flex justify-center items-center flex-row flex-wrap  gap-4">
              {Interests.map((section) => (
                <View
                  key={section.title}
                  className="flex flex-col  gap-4 py-4 w-full"
                >
                  <View className="flex flex-row flex-wrap justify-between  gap-4">
                    {section.items.map((item) => (
                      <AccountCard
                        key={item.link + section.title}
                        className="basis-[29%]"
                        iconColor={section.iconColor}
                        iconSize={28}
                        shadowColor={section.shadowColor}
                        backgroundColor={section.backgroundColor}
                        icon={item.icon}
                        label={item.label}
                        link={item.link}
                      />
                    ))}
                  </View>
                </View>
              ))}

              {/* <AccountCard
                className=""
                iconColor={colors.gray[700]}
                iconSize={28}
                shadowColor={colors.blue[100]}
                backgroundColor={"white"}
                icon={Add}
                label={"Select my interests"}
                link={"/"}
              /> */}
            </View>
            <View className="flex  w-full pb-4">
              {sections.map((section) => (
                <View key={section.title} className="flex flex-col gap-4 py-4">
                  <H4 className=" font-semibold text-gray-800 ">
                    {section.title}
                  </H4>
                  <View className="flex flex-row flex-wrap justify-between  gap-4">
                    {section.items.map((item) => (
                      <AccountCard
                        key={item.link + section.title}
                        className={"basis-[29%]"}
                        iconColor={section.iconColor}
                        iconSize={28}
                        shadowColor={section.shadowColor}
                        backgroundColor={section.backgroundColor}
                        icon={item.icon}
                        label={item.label}
                        link={item.link}
                      />
                    ))}
                  </View>
                </View>
              ))}

              <TouchableOpacity
                onPress={() => contactUsBottomSheetRef.current?.expand()}
              >
                <AccountCard2
                  className={"basis-[29%]"}
                  iconColor={ContactUsCard.iconColor}
                  iconSize={28}
                  shadowColor={ContactUsCard.shadowColor}
                  backgroundColor={ContactUsCard.backgroundColor}
                  icon={ContactUsCard.item.icon}
                  label={ContactUsCard.item.label}
                  link={ContactUsCard.item.link}
                />
              </TouchableOpacity>
            </View>

            <SignOutButton sheetRef={signOutRef} />
            <DeleteAccountButton sheetRef={deleteAccountRef} />
            <SignOutSheet ref={signOutRef} />
            <DeleteAccountSheet ref={deleteAccountRef} />

            <BottomSheet
              ref={contactUsBottomSheetRef}
              index={-1} // Start fully hidden
              enablePanDownToClose={true}
              style={{ zIndex: 500 }}
            >
              <BottomSheetView className="w-full flex-1 bg-white ">
                <View className="flex flex-col justify-center items-center w-full gap-4 p-6 mx-auto">
                  <Button
                    size={"icon"}
                    variant={"ghost"}
                    className="absolute top-2 right-2 rounded-full p-0 text-neutral-800"
                    onPress={() => contactUsBottomSheetRef.current?.close()}
                  >
                    <X size={20} color={"#262626"} />
                  </Button>

                  <View className="flex flex-col  justify-center items-center w-full gap-4 py-8">
                    <H3 className="border-none text-lg text-neutral-700 text-center">
                      Welcome! Baserah team is here to serve you
                    </H3>
                    <Text className="text-base text-neutral-500">
                      The usual response time for us is a few minutes
                    </Text>

                    <Button
                      onPress={() => {
                        contactUsBottomSheetRef.current?.close();
                        router.push("/help/ticket");
                      }}
                      className="w-full"
                    >
                      <Text className="text-white font-semibold">
                        Add a ticket directly
                      </Text>
                    </Button>
                    <Text className="text-base text-neutral-500">or</Text>
                    <Button
                      onPress={() => {
                        contactUsBottomSheetRef.current?.close();
                        router.push("/account/chat/support");
                      }}
                      className="w-full"
                      variant={"secondary"}
                    >
                      <Text className="text-neutral-500 font-semibold">
                        Contact Technical Support
                      </Text>
                    </Button>
                  </View>
                </View>
              </BottomSheetView>
            </BottomSheet>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
