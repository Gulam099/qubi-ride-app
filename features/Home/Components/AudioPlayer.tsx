import React, { useEffect, useState } from "react";
import { View, Text, Image } from "react-native";
import { Audio } from "expo-av";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import {
  Play,
  Pause,
  ArrowRotateRight,
  ArrowRotateLeft,
} from "iconsax-react-native";
import { cn } from "@/lib/utils";

export default function AudioPlayer({
  AudioUri,
  thumbnail,
}: {
  AudioUri: string;
  thumbnail?: {
    url: string;
    type?: "full" | "mini";
  };
}) {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  async function loadAndPlayAudio() {
    try {
      console.log("Loading Sound...");
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: AudioUri },
        { shouldPlay: true }
      );
      newSound.setOnPlaybackStatusUpdate(updateProgress);
      setSound(newSound);
      setIsPlaying(true);
      setIsCompleted(false);
      setHasError(false);
    } catch (error) {
      console.error("Error loading audio:", error);
      setHasError(true);
    }
  }

  async function togglePlayPause() {
    if (hasError || isCompleted) {
      loadAndPlayAudio();
      return;
    }

    if (sound) {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
      setIsPlaying(!isPlaying);
    } else {
      loadAndPlayAudio();
    }
  }

  const updateProgress = (status: any) => {
    if (status.isLoaded) {
      setDuration(status.durationMillis);
      setCurrentTime(status.positionMillis);
      setProgress((status.positionMillis / status.durationMillis) * 100);

      if (status.didJustFinish) {
        setIsCompleted(true);
        setIsPlaying(false);
      }
    } else if (status.error) {
      console.error("Audio Error:", status.error);
      setHasError(true);
    }
  };

  const seek = async (seconds: number) => {
    if (sound) {
      const newPosition = Math.max(
        0,
        Math.min(currentTime + seconds * 1000, duration)
      );
      await sound.setPositionAsync(newPosition);
      setCurrentTime(newPosition);
    }
  };

  const formatTime = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <View className="gap-2 bg-white border border-neutral-300 rounded-2xl px-4 py-6">
      {thumbnail && thumbnail.url && thumbnail.type === "full" && (
        <Image
          source={{ uri: thumbnail.url }}
          className="w-full aspect-video rounded-lg"
          resizeMode="cover"
        />
      )}

      <View className="flex-row gap-4 justify-start items-center">
        {thumbnail && thumbnail.url && thumbnail.type === "mini" && (
          <Image
            source={{ uri: thumbnail.url }}
            className="w-28 aspect-square rounded-lg"
            resizeMode="cover"
          />
        )}
        <View className="flex-1">
          <View className="flex flex-col gap-2">
            {/* Progress Bar */}
            <View className="flex-row gap-2 justify-start items-end">
              <View className="flex-1 gap-2 pt-2">
                <Progress value={progress} className="bg-neutral-300" />
                {/* Time Display */}
                <View className="flex-row justify-between">
                  <Text className="text-xs text-neutral-700">
                    {formatTime(currentTime)}
                  </Text>
                  <Text className="text-xs text-neutral-700">
                    {formatTime(duration)}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View className="flex-row gap-2 justify-center items-center">
            {/* 5 sec back seek Button */}
            <Button
              size="icon"
              variant="outline"
              className="p-2 size-14 rounded-full flex-col gap-1"
              onPress={() => seek(-5)}
              disabled={isCompleted || hasError}
            >
              <ArrowRotateLeft size="14" color="#525252" />
              <Text className="text-neutral-600 text-xs">5 sec</Text>
            </Button>

            {/* Play/Pause Button */}
            <Button
              size="icon"
              className={cn(
                "p-2  rounded-full gap-1 relative",
                thumbnail?.type === "mini" ? "size-16" : "size-24"
              )}
              onPress={togglePlayPause}
            >
              {hasError || isCompleted ? (
                <ArrowRotateLeft size="24" color="#fff" />
              ) : isPlaying ? (
                <Pause size="24" color="#fff" />
              ) : (
                <Play size="24" color="#fff" />
              )}
              {thumbnail?.type !== "mini" && (
                <Text className="text-white text-xs absolute bottom-3">
                  {hasError
                    ? "Reload"
                    : isCompleted
                    ? "Replay"
                    : isPlaying
                    ? "Pause"
                    : "Play"}
                </Text>
              )}
            </Button>

            {/* 15 sec forward seek Button */}
            <Button
              size="icon"
              variant="outline"
              className="p-2 size-14 rounded-full flex-col gap-1"
              onPress={() => seek(15)}
              disabled={isCompleted || hasError}
            >
              <ArrowRotateRight size="14" color="#525252" />
              <Text className="text-neutral-600 text-xs">15 sec</Text>
            </Button>
          </View>
        </View>
      </View>
    </View>
  );
}