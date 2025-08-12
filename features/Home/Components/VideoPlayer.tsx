import { View, Dimensions, Text, TouchableOpacity, Linking, Image } from "react-native";
import React, { useState, useEffect } from "react";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEvent } from "expo";
import { WebView } from "react-native-webview";

interface VideoPlayerProps {
  VideoUri: string;
}

const getYouTubeVideoId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

const getYouTubeThumbnail = (videoId: string): string => {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
};

const isYouTubeUrl = (url: string): boolean => {
  return url.includes('youtube.com') || url.includes('youtu.be');
};

const getEmbeddedYoutubeUrl = (videoId: string): string => {
  return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`;
};

export default function VideoPlayer({ VideoUri }: VideoPlayerProps) {
  const [showPlayer, setShowPlayer] = useState(false);
  const [videoType, setVideoType] = useState<'youtube' | 'direct'>('direct');
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');
  const [videoId, setVideoId] = useState<string | null>(null);

  // Determine video type and thumbnail
  useEffect(() => {
    if (isYouTubeUrl(VideoUri)) {
      setVideoType('youtube');
      const id = getYouTubeVideoId(VideoUri);
      setVideoId(id);
      if (id) {
        setThumbnailUrl(getYouTubeThumbnail(id));
      }
    } else {
      setVideoType('direct');
      // For direct videos, you might want to generate a thumbnail
      // or use a default placeholder
      setThumbnailUrl(''); // We'll show a default play button
    }
  }, [VideoUri]);

  // Video player for direct URLs (non-YouTube)
  const player = videoType === 'direct' && showPlayer
    ? useVideoPlayer(VideoUri, (player) => {
        player.loop = false;
        player.staysActiveInBackground = false;
        player.showNowPlayingNotification = true;
        
        // Auto-play when player is ready
        player.play();
      })
    : null;

  const { isPlaying } = player ? useEvent(player, "playingChange", {
    isPlaying: player.playing,
  }) : { isPlaying: false };

  const handleThumbnailPress = () => {
    if (videoType === 'youtube') {
      // For YouTube, we can either embed or open externally
      setShowPlayer(true);
    } else {
      // For direct videos, show the native player
      setShowPlayer(true);
    }
  };

  const openInYouTubeApp = async () => {
    try {
      if (videoId) {
        const youtubeAppUrl = `youtube://watch?v=${videoId}`;
        const canOpenYouTubeApp = await Linking.canOpenURL(youtubeAppUrl);
        
        if (canOpenYouTubeApp) {
          await Linking.openURL(youtubeAppUrl);
        } else {
          await Linking.openURL(VideoUri);
        }
      }
    } catch (error) {
      console.error("Cannot open YouTube video", error);
    }
  };

  const screenWidth = Dimensions.get("window").width - 32;
  const videoHeight = screenWidth * (9 / 16);

  const styles = {
    container: {
      width: screenWidth,
      height: videoHeight,
      borderRadius: 12,
      overflow: "hidden" as const,
      backgroundColor: "#000",
      position: "relative" as const,
    },
    thumbnail: {
      width: "100%",
      height: "100%",
      resizeMode: "cover" as const,
    },
    overlay: {
      position: "absolute" as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.4)",
      justifyContent: "center" as const,
      alignItems: "center" as const,
    },
    playButton: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: "rgba(255,255,255,0.9)",
      justifyContent: "center" as const,
      alignItems: "center" as const,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
    },
    playIcon: {
      width: 0,
      height: 0,
      backgroundColor: "transparent",
      borderStyle: "solid" as const,
      borderLeftWidth: 25,
      borderRightWidth: 0,
      borderBottomWidth: 15,
      borderTopWidth: 15,
      borderLeftColor: "#000",
      borderRightColor: "transparent",
      borderBottomColor: "transparent",
      borderTopColor: "transparent",
      marginLeft: 5,
    },
    youtubeLabel: {
      position: "absolute" as const,
      top: 10,
      right: 10,
      backgroundColor: "rgba(255,0,0,0.9)",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
    },
    youtubeLabelText: {
      color: "white",
      fontSize: 12,
      fontWeight: "600" as const,
    },
    backButton: {
      position: "absolute" as const,
      top: 10,
      left: 10,
      backgroundColor: "rgba(0,0,0,0.7)",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
      zIndex: 10,
    },
    backButtonText: {
      color: "white",
      fontSize: 12,
      fontWeight: "600" as const,
    },
    defaultThumbnail: {
      width: "100%",
      height: "100%",
      backgroundColor: "#1a1a1a",
      justifyContent: "center" as const,
      alignItems: "center" as const,
    },
    externalButton: {
      position: "absolute" as const,
      bottom: 10,
      right: 10,
      backgroundColor: "rgba(255,0,0,0.9)",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
    },
    externalButtonText: {
      color: "white",
      fontSize: 10,
      fontWeight: "600" as const,
    },
  };

  // Show video player after thumbnail click
  if (showPlayer) {
    if (videoType === 'youtube') {
      const embedUrl = videoId ? getEmbeddedYoutubeUrl(videoId) : VideoUri;
      
      return (
        <View style={styles.container}>
          {/* Back to thumbnail button */}
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setShowPlayer(false)}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>

          <WebView
            style={{ flex: 1 }}
            source={{ uri: embedUrl }}
            javaScriptEnabled={true}
            allowsFullscreenVideo={true}
            mediaPlaybackRequiresUserAction={false}
            onError={() => {
              // If embedding fails, offer to open externally
              setShowPlayer(false);
            }}
          />

          {/* External app option */}
          <TouchableOpacity 
            style={styles.externalButton}
            onPress={openInYouTubeApp}
          >
            <Text style={styles.externalButtonText}>Open in App</Text>
          </TouchableOpacity>
        </View>
      );
    } else {
      // Direct video player
      return (
        <View style={styles.container}>
          {/* Back to thumbnail button */}
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setShowPlayer(false)}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>

          {player && (
            <VideoView
              style={{ flex: 1 }}
              player={player}
              allowsFullscreen
              allowsPictureInPicture
              contentFit="contain"
              onError={(error) => {
                console.error('VideoView error:', error);
                setShowPlayer(false); // Go back to thumbnail on error
              }}
            />
          )}
        </View>
      );
    }
  }

  // Show thumbnail initially
  return (
    <TouchableOpacity style={styles.container} onPress={handleThumbnailPress}>
      {/* Thumbnail Image */}
      {thumbnailUrl ? (
        <Image source={{ uri: thumbnailUrl }} style={styles.thumbnail} />
      ) : (
        <View style={styles.defaultThumbnail}>
          <Text style={{ color: '#666', marginBottom: 10 }}>Video</Text>
        </View>
      )}
      
      {/* Play Overlay */}
      <View style={styles.overlay}>
        <View style={styles.playButton}>
          <View style={styles.playIcon} />
        </View>
      </View>
      
      {/* YouTube Label */}
      {videoType === 'youtube' && (
        <>
          <View style={styles.youtubeLabel}>
            <Text style={styles.youtubeLabelText}>YouTube</Text>
          </View>
          
          {/* Alternative: Direct YouTube app button */}
          <TouchableOpacity 
            style={[styles.externalButton, { bottom: 10, left: 10 }]}
            onPress={openInYouTubeApp}
            onPressIn={(e) => e.stopPropagation()} // Prevent thumbnail click
          >
            <Text style={styles.externalButtonText}>Open in App</Text>
          </TouchableOpacity>
        </>
      )}
    </TouchableOpacity>
  );
}