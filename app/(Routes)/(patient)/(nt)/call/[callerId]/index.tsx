import { View, Text} from "react-native";
import React, { useEffect, useRef } from "react";
import { useLocalSearchParams } from "expo-router/build/hooks";
import Video from 'twilio-video';

import { WebView } from "react-native-webview";

export default function VideoCallPage() {
  const { callerId } = useLocalSearchParams();

  const videoContainer = useRef();

  useEffect(() => {
    Video.connect('<Your Twilio Token>', {
      name: 'room-name',
    }).then((room) => {
      console.log(`Connected to Room: ${room.name}`);
    });
  }, []);
  
  // return (
  //   <View className="flex-1">
  //     <Text>VideoCallPage</Text>
  //     <WebView
  //       source={{ uri: "https://meet.jit.si/zahid2014gg" }}
  //       style={{ flex: 1 }}
  //     />
  //   </View>
  // );
  return <View ref={videoContainer} style={{ flex: 1 }} />;
}
