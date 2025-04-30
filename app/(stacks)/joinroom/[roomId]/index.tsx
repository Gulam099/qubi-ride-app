import { View, Text, ActivityIndicator } from "react-native";
import React from "react";
import { Stack, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import WebView from "react-native-webview";

const JoinRoom = () => {
  const { roomId } = useLocalSearchParams();
  const roomUrl = `https://baseerah.daily.co/${roomId}`; // Replace with your actual URL

  return (
    <>
      <Stack.Screen 
        options={{ 
          headerShown: true,
          headerTitle: `join Room`,
        }} 
      />
      <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
        <View style={{ flex: 1 }}>
          <WebView
            source={{ uri: roomUrl }}
            style={{ flex: 1, borderRadius: 12, overflow: 'hidden' }}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text style={{ marginTop: 10, color: '#64748b' }}>Loading Room...</Text>
              </View>
            )}
            allowsFullscreenVideo
            javaScriptEnabled
            domStorageEnabled
          />
          
          {/* Optional Footer */}
          <View style={{ paddingTop: 16 }}>
            <Text style={{ textAlign: 'center', color: '#64748b' }}>
              Room ID: {roomId} • Powered by Baseerah
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
};

export default JoinRoom;