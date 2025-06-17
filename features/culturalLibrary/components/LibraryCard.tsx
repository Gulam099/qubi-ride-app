import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import colors from "@/utils/colors";
import {
  AudioSquare,
  ExportCurve,
  Heart,
  Message,
  Moneys,
  Notepad,
  People,
  VideoHorizontal,
} from "iconsax-react-native";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ImageSourcePropType,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Alert,
  Share,
} from "react-native";
import { RelativePathString, useRouter } from "expo-router";
import { createLibraryDeepLink } from "@/utils/deeplink";

type Comment = {
  id: string;
  user?: string;
  userId?: {
    name: string;
  };
  text?: string;
  comment?: string;
  timestamp: Date;
};

import { apiNewUrl, ApiUrl } from "@/const";
import { useUser } from "@clerk/clerk-expo";
import { toast } from "sonner-native";

type LibraryCardProps = {
  contentId: string;
  title: string;
  category: string;
  type: string;
  seenCount:Number;
  rating: number;
  image: string;
  link: string;
  comments?: Comment[];
  shareCount?: number;
  onAddComment?: (comment: string) => void;
  onShare?: () => void;
};

export default function LibraryCard(props: LibraryCardProps) {
  const router = useRouter();
  const { user } = useUser();
  const userId = user?.publicMetadata?.dbPatientId as string;
  const {
    title,
    category,
    type,
    link,
    seenCount,
    image,
    contentId,
    comments = [],
    shareCount = 0,
    onAddComment,
    onShare,
  } = props;

  // State management
  const [isCommentModalVisible, setCommentModalVisible] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [localComments, setLocalComments] = useState<Comment[]>(comments);
  const [localShareCount, setLocalShareCount] = useState(shareCount);
  const [isSharing, setIsSharing] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  // Define icons based on type
  const IconList: Record<string, React.ElementType> = {
    video: VideoHorizontal,
    article: Notepad,
    audio: AudioSquare,
  };
  const Icon = IconList[type.toLowerCase()] || Notepad;

  useEffect(() => {
    const checkFavorites = async () => {
      try {
        const res = await fetch(
          `${ApiUrl}/api/favorites/culturalContent/${userId}`
        );
        const data = await res.json();
        console.log("data??", data);

        if (res.ok && data?.data) {
          // Fixed: Check if contentId exists in the data array directly
          const isInFavorites = data.data.some(
            (item) => item._id?.toString() === contentId?.toString()
          );
          console.log("isInFavorites", isInFavorites);

          setIsFavorited(isInFavorites);
        } else {
          setIsFavorited(false);
        }
      } catch (e) {
        console.error("Error checking favorites:", e);
        setIsFavorited(false);
      }
    };

    if (userId && contentId) {
      checkFavorites();
    }
  }, [userId, contentId]);

  const handleAddToFavorites = async () => {
    try {
      const response = await fetch(`${ApiUrl}/api/favorites/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          itemId: contentId,
          type: "culturalContent",
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Failed to add");
      toast.success("Added to favorites!");
      setIsFavorited(true);
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  const handleRemoveFromFavorites = async () => {
    try {
      const response = await fetch(`${ApiUrl}/api/favorites/remove`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          itemId: contentId,
          type: "culturalContent",
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Failed to remove");
      toast.success("Removed from favorites!");
      setIsFavorited(false);
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  const onComment = () => {
    setCommentModalVisible(true);
  };

  const handleAddComment = async () => {
    if (commentText.trim()) {
      const newComment: Comment = {
        id: Date.now().toString(),
        user: user?.fullName || "Anonymous",
        text: commentText.trim(),
        comment: commentText.trim(),
        timestamp: new Date(),
      };

      try {
        const res = await fetch(`${apiNewUrl}/api/library/addComment`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contentId: contentId,
            userId,
            comment: commentText.trim(),
          }),
        });

        const result = await res.json();

        if (res.ok) {
          setLocalComments([...localComments, newComment]);
        } else {
          console.error("Failed to post comment:", result.message || result);
        }
      } catch (err) {
        console.error("Error commenting:", err);
      }

      if (onAddComment) {
        onAddComment(commentText.trim());
      }

      setCommentText("");
      setCommentModalVisible(false);
    }
  };

  const handleShare = async () => {
    if (isSharing) return;

    setIsSharing(true);

    try {
      const res = await fetch(`${apiNewUrl}/api/library/incrementShareCount`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentId: contentId,
        }),
      });

      const result = await res.json();

      if (res.ok) {
        // Update local share count immediately for better UX
        setLocalShareCount((prev) => prev + 1);

        const deepLink = createLibraryDeepLink(contentId);

        // Prepare share content
        const shareOptions = {
          message: `Check out this ${type}: ${title} in ${category} category\n\n${deepLink}`,
          title: title,
        };

        // Share the content with deep link
        const shareResult = await Share.share(shareOptions);

        if (shareResult.action === Share.sharedAction) {
          console.log(`Shared ${title} with deep link: ${deepLink}`);
        }

        // Call parent callback if provided
        if (onShare) {
          onShare();
        }
      } else {
        console.error(
          "Failed to update share count:",
          result.message || result
        );
        Alert.alert("Error", "Unable to update share count.");
      }
    } catch (error) {
      console.error("Error sharing:", error);
      Alert.alert("Error", "Unable to share at this time");
    } finally {
      setIsSharing(false);
    }
  };

  const formatTimeAgo = (date: Date | string | undefined) => {
    if (!date) return "Just now";

    try {
      const timestamp = typeof date === "string" ? new Date(date) : date;

      // Check if the date is valid
      if (isNaN(timestamp.getTime())) {
        return "Just now";
      }

      const now = new Date();
      const diffInMinutes = Math.floor(
        (now.getTime() - timestamp.getTime()) / (1000 * 60)
      );

      if (diffInMinutes < 1) return "Just now";
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    } catch (error) {
      console.error("Error formatting time:", error);
      return "Just now";
    }
  };

  return (
    <>
      <Card className="w-full">
        {/* Header with clickable title */}
        <TouchableOpacity
          onPress={() => router.push(link as RelativePathString)}
        >
          <CardHeader className="flex flex-row justify-between items-start">
            <View className="flex-1 pr-4">
              <CardTitle className="text-lg font-semibold">{title}</CardTitle>
              <CardDescription className="text-sm text-gray-500 capitalize">
                {category}
              </CardDescription>
            </View>
          </CardHeader>
        </TouchableOpacity>

        {/* Content with clickable image */}
        <TouchableOpacity
          onPress={() => router.push(link as RelativePathString)}
        >
          <CardContent className="p-0">
            <Image
              source={{ uri: image }}
              className="w-full h-64"
              resizeMode="cover"
            />
          </CardContent>
        </TouchableOpacity>

        {/* Footer with type, seen count, and action buttons */}
        <CardFooter className="flex-row flex-wrap gap-3 mt-2">
          <View className="flex-row gap-6">
            {/* Favorite/Heart */}
            <View className="items-center">
              <TouchableOpacity
                onPress={
                  isFavorited ? handleRemoveFromFavorites : handleAddToFavorites
                }
                className="w-11 h-11 rounded-full bg-purple-100 justify-center items-center"
              >
                <Heart
                  size="24"
                  color={isFavorited ? "red" : colors.primary[500]}
                  variant={isFavorited ? "Bold" : "Linear"}
                />
              </TouchableOpacity>
            </View>

            {/* Comment */}
            <View className="items-center">
              <TouchableOpacity
                onPress={onComment}
                className="w-11 h-11 rounded-full bg-purple-100 justify-center items-center"
              >
                <Message size="24" color={colors.primary[500]} />
              </TouchableOpacity>
              <Text className="text-xs mt-1 text-center">
                {localComments.length}
              </Text>
            </View>

            {/* Share */}
            <View className="items-center">
              <TouchableOpacity
                onPress={handleShare}
                className="w-11 h-11 rounded-full bg-purple-100 justify-center items-center"
                disabled={isSharing}
              >
                <ExportCurve size="22" color={colors.primary[500]} />
              </TouchableOpacity>
              <Text className="text-xs mt-1 capitalize text-center">
                {localShareCount} share
              </Text>
            </View>

            {/* Type */}
            <View className="items-center">
              <View className="w-11 h-11 rounded-full bg-purple-100 justify-center items-center">
                <Icon size="22" color={colors.primary[500]} />
              </View>
              <Text className="text-xs mt-1 capitalize text-center">
                {type}
              </Text>
            </View>

            {/* Seen Count */}
            <View className="items-center">
              <View className="w-11 h-11 rounded-full bg-purple-100 justify-center items-center">
                <People size="22" color={colors.primary[500]} />
              </View>
              <Text className="text-xs mt-1">{seenCount} seen</Text>
            </View>
          </View>
        </CardFooter>
      </Card>

      {/* Comment Modal */}
      <Modal
        visible={isCommentModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setCommentModalVisible(false)}
      >
        <View className="flex-1 bg-white">
          {/* Modal Header */}
          <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
            <TouchableOpacity onPress={() => setCommentModalVisible(false)}>
              <Text className="text-purple-600 text-lg">Cancel</Text>
            </TouchableOpacity>
            <Text className="text-lg font-semibold">Comments</Text>
            <TouchableOpacity onPress={handleAddComment}>
              <Text className="text-purple-600 text-lg font-semibold">
                Post
              </Text>
            </TouchableOpacity>
          </View>

          {/* Comments List */}
          <ScrollView className="flex-1 p-4">
            {localComments.length === 0 ? (
              <View className="items-center justify-center py-8">
                <Text className="text-gray-500 text-center">
                  No comments yet. Be the first to comment!
                </Text>
              </View>
            ) : (
              localComments.map((comment) => (
                <View
                  key={comment.id}
                  className="mb-4 p-3 bg-gray-50 rounded-lg"
                >
                  <View className="flex-row justify-between items-start mb-2">
                    <Text className="font-semibold text-gray-800">
                      {comment?.userId?.name || comment?.user || "Anonymous"}
                    </Text>
                    <Text className="text-xs text-gray-500">
                      {formatTimeAgo(comment.timestamp)}
                    </Text>
                  </View>
                  <Text className="text-gray-700">
                    {comment.comment || comment.text}
                  </Text>
                </View>
              ))
            )}
          </ScrollView>

          {/* Comment Input */}
          <View className="p-4 border-t border-gray-200">
            <TextInput
              value={commentText}
              onChangeText={setCommentText}
              placeholder="Add a comment..."
              multiline
              className="border border-gray-300 rounded-lg p-3 max-h-24"
              style={{ textAlignVertical: "top" }}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}
