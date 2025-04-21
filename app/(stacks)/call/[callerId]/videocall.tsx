// import { View, Text } from "react-native";
// import React from "react";
// import { Stack } from "expo-router";
// import BackButton from "@/features/Home/Components/BackButton";
// import NotificationIconButton from "@/features/Home/Components/NotificationIconButton";

// export default function VideoCallPage() {
//   return (
//     <View>
//       <Stack.Screen
//         options={{
//           headerShown: true,
//           headerLeft: () => <BackButton className="" />,
//           headerRight: () => <NotificationIconButton className="mr-4" />,
//           headerTitle: () => (
//             <Text className="font-semibold text-lg ">Video Call</Text>
//           ),
//         }}
//       />
//       <Text>VideoCallPage</Text>
//     </View>
//   );
// }


import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Image,
  Platform
} from "react-native";
import { WebView } from "react-native-webview";
import { Camera } from "expo-camera";
import { Audio } from "expo-av";
import { Ionicons } from '@expo/vector-icons';
// Add this type declaration at the top of your file
type WebViewPermissionRequest = {
  resources: ('camera' | 'microphone' | 'geolocation' | 'midi')[];
  grant: () => void;
  deny: () => void;
  origin: string;
};


const VideoCallPage = () => {
  // Add default image URL
  const defaultAvatar = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';
  const recordingRef = useRef<Audio.Recording | null>(null);

  const [isInCall, setIsInCall] = useState(false);
  const [callUrl, setCallUrl] = useState("");
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const webViewRef = useRef(null);

  const patientId = "67f007eebb0b7fdfb6bd9b42";

  useEffect(() => {
    const initialize = async () => {
      await requestPermissions();
      await fetchRooms();
    };
    initialize();
  }, []);

  const requestPermissions = async () => {
    try {
      const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
      const { status: audioStatus } = await Audio.requestPermissionsAsync();

      if (cameraStatus === "granted" && audioStatus === "granted") {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
        });
        setPermissionsGranted(true);
      } else {
        Alert.alert(
          "Permissions Required",
          "Camera and Microphone permissions are required for video calls."
        );
      }
    } catch (error) {
      console.error("Permission request error:", error);
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await fetch(                                                                                                                                                                     
        `https://monkfish-app-6ahnd.ondigitalocean.app/api/doctors/${patientId}/patientrooms`
      );
      const data = await response.json();
      
      if (data.success) {
        setRooms(data.data);
      } else {
        Alert.alert("Error", "Failed to video fetch appointments");
      }
    } catch (error) {
      console.error("Error fetching rooms:", error);
      Alert.alert("Error", "Could not fetch appointments. Try again later.");
    } finally {
      setIsLoadingRooms(false);
    }
  };

  const createRoom = async (type, doctorId) => {
    if (!permissionsGranted) {
      Alert.alert("Error", "Please allow camera and microphone permissions.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("https://monkfish-app-6ahnd.ondigitalocean.app/api/room/create-room", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          doctorId,
          patientId,
        }),
      });

      const data = await response.json();
      console.log("data is",data)
      if (response.ok && data?.url) {
        joinRoom(data.url);
      } else {
        Alert.alert("Error", data.error || "Failed to create room");
      }
    } catch (error) {
      console.error("Error creating room:", error);
      Alert.alert("Error", "Could not create room. Try again later.");
    }
    setLoading(false);
  };

  const joinRoom = (url) => {
    if (!url) {
      Alert.alert("Error", "Invalid room URL");
      return;
    }
    setCallUrl(url);
    setIsInCall(true);
  };

  // Modified toggleMute function for Android
const toggleMute = async () => {
  try {
    // For iOS and general audio control
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: !isMuted,
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
    });

    // Android-specific microphone control
    if (Platform.OS === 'android') {
      if (isMuted) {
        // Start a dummy recording to enable microphone
        const { recording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        recordingRef.current = recording;
      } else {
        // Stop and cleanup existing recording
        if (recordingRef.current) {
          await recordingRef.current.stopAndUnloadAsync();
          recordingRef.current = null;
        }
      }
    }

    setIsMuted(!isMuted);
  } catch (error) {
    console.error('Error toggling mic:', error);
  }
};

// Updated cleanup effect
useEffect(() => {
  return () => {
    const cleanup = async () => {
      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync();
        recordingRef.current = null;
      }
    };
    cleanup();
  };
}, []);
  return (
    <View style={styles.container}>
      {!isInCall ? (
        <View style={styles.listContainer}>
          <Text style={styles.title}>Video Calls </Text>
          {isLoadingRooms ? (
            <ActivityIndicator size="large" color="#3498db" style={styles.loader} />
          ) : rooms.length === 0 ? (
            <Text style={styles.noRecords}>No upcoming appointments found</Text>
          ) : (

            <FlatList
              data={rooms}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View style={styles.customerCard}>
                  <View style={styles.customerHeader}>
                    <Image
                      style={styles.avatar}
                      source={{ uri: item.doctor?.imageUrl || defaultAvatar }}
                    />
                    <View style={styles.textContainer}>
                      <Text style={styles.customerName}>{item.doctor.name}</Text>
                      <Text style={styles.scheduledTime}>
                        {item.scheduledAt 
                          ? new Date(item.scheduledAt).toLocaleString()
                          : "No schedule time"}
                      </Text>
                    </View>
                    <View style={styles.iconContainer}>
                      <TouchableOpacity
                        style={styles.voiceIcon}
                        onPress={() => createRoom("voice", item.doctorId)}
                      >
                        <Ionicons name="call-outline" size={26} color="#2ecc71" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.videoIcon}
                        onPress={() => createRoom("video", item.doctorId)}
                      >
                        <Ionicons name="videocam-outline" size={26} color="#e74c3c" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}
            />
          )}
          {loading && <ActivityIndicator size="large" color="#3498db" />}
        </View>
      ) : (
        <View style={styles.webviewContainer}>
         <WebView
  ref={webViewRef}
  source={{ uri: callUrl }}
  style={styles.webview}
  allowsInlineMediaPlayback
  mediaPlaybackRequiresUserAction={false}
  onPermissionRequest={(request: WebViewPermissionRequest) => {
    if (
      request.resources.includes('camera') ||
      request.resources.includes('microphone')
    ) {
      request.grant();
    }
  }}
  userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36"
  javaScriptEnabled
  mediaCapturePermissionGrantType="grant"
/>
          <View style={styles.controls}>
            <TouchableOpacity style={styles.muteButton} onPress={toggleMute}>
              <Ionicons 
                name={isMuted ? "mic-off-outline" : "mic-outline"} 
                size={24} 
                color="white" 
              />
              <Text style={styles.controlText}>{isMuted ? "Unmute" : "Mute"}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.endCallButton}
              onPress={() => setIsInCall(false)}
            >
              <Ionicons name="call-outline" size={24} color="white" />
              <Text style={styles.controlText}>End Call</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 25,
    marginTop: 20,
    textAlign: "center",
    color: "#2c3e50",
    letterSpacing: 0.5,
  },
  listContainer: {
    flex: 1,
  },
  customerCard: {
    backgroundColor: "#ffffff",
    padding: 18,
    borderRadius: 14,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  customerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  textContainer: {
    flex: 1,
    marginRight: 10,
  },
  customerName: {
    fontSize: 15,
    fontWeight: "500",
    color: "#34495e",
    letterSpacing: 0.3,
  },
  scheduledTime: {
    fontSize: 12,
    color: '#95a5a6',
    marginTop: 4,
  },
  iconContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  voiceIcon: {
    backgroundColor: "rgba(46, 204, 113, 0.1)",
    borderWidth: 1.5,
    borderColor: "#2ecc71",
    padding: 12,
    borderRadius: 30,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoIcon: {
    backgroundColor: "rgba(231, 76, 60, 0.1)",
    borderWidth: 1.5,
    borderColor: "#e74c3c",
    padding: 12,
    borderRadius: 30,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  webviewContainer: {
    flex: 1,
    width: "100%",
    backgroundColor: "#000",
  },
  webview: {
    flex: 1,
  },
  controls: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 25,
    paddingVertical: 20,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  muteButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  endCallButton: {
    backgroundColor: "#e74c3c",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  controlText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
    letterSpacing: 0.3,
  },
  loader: {
    marginTop: 40,
  },
  noRecords: {
    textAlign: 'center',
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 20,
  },
});

export default VideoCallPage;
