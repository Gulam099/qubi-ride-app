import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  StatusBar,
} from "react-native";
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
import { useTranslation } from "react-i18next";

export default function AccountPage() {
  const { user } = useUser();
  const userId = user?.publicMetadata?.dbPatientId as string;
  const router = useRouter();
  const { t } = useTranslation();

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
        {
          link: "/(stacks)/call/1234/videocall",
          label: "Video Call",
          icon: Video,
        },
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
      title: t("Medicalfile"),
      shadowColor: colors.blue[100],
      className: "",
      backgroundColor: "white",
      iconColor: colors.gray[700],
      items: [
        {
          link: "/account/appointment",
          label: t("Mybooking"),
          icon: ClipboardText,
        },
        { link: "/account/report", label: t("My reports"), icon: Book },
        { link: "/account/calendar", label: t("My calendar"), icon: MenuBoard },
        { link: "/account/scale", label: t("Mymetrics"), icon: Clipboard },
      ],
    },
    {
      title: t("Myinformation"),
      shadowColor: colors.blue[100],
      className: "",
      backgroundColor: "white",
      iconColor: colors.gray[700],
      items: [
        // { link: "/account/payment", label: "Payment", icon: EmptyWalletTime },
        { link: "/account/favorite", label: t("Myfavorites"), icon: Like1 },
        { link: "/account/chat", label: t("Mychats"), icon: Message },
        { link: "/account/invoice", label: t("Mybills"), icon: Receipt },
        { link: "/account/family", label: t("Myfamily"), icon: Profile2User },
        { link: "/account/setting", label: t("Mysetting"), icon: Setting2 },
        {
          link: "/contact", // link used for routing
          label: t("Contactus"),
          icon: Messages,
          customPress: () => contactUsBottomSheetRef.current?.expand(),
        },
      ],
    },
  ]);

  // const ContactUsCard = {
  //   shadowColor: colors.blue[100],
  //   className: "",
  //   backgroundColor: "white",
  //   iconColor: colors.gray[700],
  //   item: { link: "/contact", label: "Contact us", icon: Messages },
  // };

  const handleCall = (phoneNumber: string) => {
    const phoneUrl = `tel:${phoneNumber}`;
    Linking.openURL(phoneUrl).catch((err) =>
      console.error("Failed to open dialer:", err)
    );
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
    <View style={{ flex: 1, backgroundColor: "#000F8F" }}>
      <StatusBar barStyle="light-content" backgroundColor="#000F8F" />
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View
            className="flex-row justify-start items-center gap-5 bg-primary-800 w-full px-4 py-8"
            style={{ backgroundColor: "#000F8F" }}
          >
            <ProfileImage imageUrl={user?.imageUrl!} name={user?.id!} />
            <View className="flex-1">
              <Text className="text-lg font-semibold text-white ">
                {user?.fullName ?? "User"}
              </Text>
              <Link href={"/account/profile"}>
                <Text className="text-blue-100 text-sm underline">
                  {t("ViewProfile")}
                </Text>
              </Link>
            </View>
            <View className={"absolute -top-4 -right-6"}>
              <CustomImages.TextureCircle.image />
            </View>

            <Button
              className="p-2 rounded-2xl aspect-square"
              style={{ backgroundColor: "#000F8F" }}
              onPress={() => router.push("/account/profile")}
            >
              <Edit size="24" color={colors.gray[100]} />
            </Button>
          </View>

          {/* Content Section */}
          <View className="flex-1 bg-neutral-200">
            <View className="flex justify-center items-center h-full w-full flex-1 p-6 pt-6">
              <View className="flex justify-center items-center flex-row flex-wrap gap-4">
                {/* Interests section - uncomment if needed */}
              </View>

              <View className="flex w-full pb-4">
                {sections.map((section) => (
                  <View
                    key={section.title}
                    className="flex flex-col gap-4 py-4"
                  >
                    <H4 className="font-semibold text-gray-800">
                      {section.title}
                    </H4>
                    <View className="flex flex-row flex-wrap gap-4">
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
                          onPress={item.customPress}
                        />
                      ))}
                    </View>
                  </View>
                ))}

                {/* <TouchableOpacity
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
                </TouchableOpacity> */}
              </View>

              <SignOutButton sheetRef={signOutRef} />
              <DeleteAccountButton sheetRef={deleteAccountRef} />
            </View>
          </View>
        </ScrollView>

        <SignOutSheet ref={signOutRef} />
        <DeleteAccountSheet ref={deleteAccountRef} />

        <BottomSheet
          ref={contactUsBottomSheetRef}
          index={-1}
          enablePanDownToClose={true}
          style={{ zIndex: 500 }}
        >
          <BottomSheetView className="w-full flex-1 bg-white">
            <View className="flex flex-col justify-center items-center w-full gap-4 p-6 mx-auto">
              <Button
                size={"icon"}
                variant={"ghost"}
                className="absolute top-2 right-2 rounded-full p-0 text-neutral-800"
                onPress={() => contactUsBottomSheetRef.current?.close()}
              >
                <X size={20} color={"#262626"} />
              </Button>

              <View className="flex flex-col justify-center items-center w-full gap-4 py-8">
                <H3 className="border-none text-lg text-neutral-700 text-center">
                  {t("contactUsTitle")}
                </H3>
                <Text className="text-base text-neutral-500">
                  {t("contactUsSubtitle")}
                </Text>

                <Button
                  onPress={() => {
                    contactUsBottomSheetRef.current?.close();
                    router.push(
                      "https://baseerah.zohodesk.in/portal/en/newticket"
                    );
                  }}
                  className="w-full"
                >
                  <Text className="text-white font-semibold">
                    {t("addTicket")}
                  </Text>
                </Button>
                <Text className="text-base text-neutral-500">{t("or")}</Text>
                <View className="mt-4 w-full">
                  <Button className="w-full">
                    <TouchableOpacity
                      onPress={() => handleCall("+9665555550100")}
                    >
                      <Text className="text-white font-semibold">
                        Call +966 5555550100
                      </Text>
                    </TouchableOpacity>
                  </Button>
                </View>
              </View>
            </View>
          </BottomSheetView>
        </BottomSheet>
      </SafeAreaView>
    </View>
  );
}
