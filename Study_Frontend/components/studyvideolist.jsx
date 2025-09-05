import { View, Text } from "react-native";
import VideoCard from "./studyvideocard";
import { Ionicons } from "@expo/vector-icons";

export default function VideoList({ videos }) {
  if (!videos || videos.length === 0) {
    return (
      <View className="items-center justify-center p-4">
        <Ionicons name="videocam-outline" size={40} color="#9ca3af" />
        <Text className="text-gray-500 mt-2 text-center">
          Enter a topic to get related videos.
        </Text>
      </View>
    );
  }

  return (
    <View className="px-2">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </View>
  );
}
