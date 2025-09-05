import { View, Text, TouchableOpacity } from "react-native";
import YoutubePlayer from "react-native-youtube-iframe";
import { useState, useCallback } from "react";

export default function VideoCard({ video }) {
  const [playing, setPlaying] = useState(false);

  const onStateChange = useCallback((state) => {
    if (state === "ended") {
      setPlaying(false);
    }
  }, []);

  const togglePlaying = () => {
    setPlaying((prev) => !prev);
  };

  if (!video?.id) {
    return (
      <View className="bg-white p-4 rounded-2xl shadow mb-4">
        <Text className="text-red-500">Invalid video data</Text>
      </View>
    );
  }

  return (
    <View className="bg-white mb-8 rounded-2xl shadow p-2">
      {/* Embedded YouTube Player */}
      <YoutubePlayer
        height={220}
        play={playing}
        videoId={video.id}
        onChangeState={onStateChange}
      />

      {/* Title and Play Toggle */}
      <TouchableOpacity onPress={togglePlaying} activeOpacity={0.7}>
        <Text
          className="text-sm font-semibold underline text-gray-700 mt-2"
          numberOfLines={3}
          accessibilityLabel={`Video title: ${video.title}`}
        >
          Title: {video.title}
        </Text>
        <Text className="text-xs text-blue-500 mt-1">
          {playing ? "Tap to pause" : "Tap to play"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
