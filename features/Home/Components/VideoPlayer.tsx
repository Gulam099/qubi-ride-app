import { View, Text, Dimensions, Image } from "react-native";
import React, { useEffect, useState } from "react";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEvent } from "expo";
import * as VideoThumbnails from "expo-video-thumbnails";

export default function VideoPlayer(props: { VideoUri: string }) {
  const { VideoUri } = props;
  const [image, setImage] = useState<any>(null);
  useEffect(() => {
    // generateThumbnail();
  }, [VideoUri]);

  const player = useVideoPlayer(VideoUri, (player) => {
    player.loop = true;
    player.staysActiveInBackground = false;
    player.showNowPlayingNotification = true;

    // player.play();
  });
  const { isPlaying } = useEvent(player, "playingChange", {
    isPlaying: player.playing,
  });

  const generateThumbnail = async () => {
    try {
      const { uri } = await VideoThumbnails.getThumbnailAsync(VideoUri, {
        time: 15000,
      });
      setImage(uri);
    } catch (e) {
      console.warn(e);
    }
  };

  return (
    <View className="flex-1 items-center justify-center rounded-lg overflow-hidden">
      <VideoView
        style={{
          width: Dimensions.get("window").width - 20,
          height: (Dimensions.get("window").width - 20) * (9 / 16),
        }}
        className="p-2"
        player={player}
        allowsFullscreen
        allowsPictureInPicture
        startsPictureInPictureAutomatically
      />
      {/* {image && (
        <Image
          source={{ uri: image }}
          style={{
            width: Dimensions.get("window").width - 20,
            height: (Dimensions.get("window").width - 20) * (9 / 16),
          }}
        />
      )} */}
      {/* <Text>{image}</Text> */}
    </View>
  );
}