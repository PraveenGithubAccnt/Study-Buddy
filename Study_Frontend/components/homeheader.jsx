import { View, Text, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Header({ user }) {
  return (
    <SafeAreaView className="bg-white">
      <View className="flex-row items-center px-4 py-3">
        
        {/* Profile Picture */}
        <Image
          source={{
            uri:
              user?.profilePhotoURL ||
              "https://www.pngkey.com/png/full/73-730477_first-name-profile-image-placeholder-png.png",
          }}
          className="w-14 h-14 rounded-full border-2 border-blue-500"
        />

        {/* Welcome Text */}
        <View className="ml-4">
          <Text className="text-gray-600 text-base">Welcome</Text>
          <Text className="text-2xl font-bold text-black">
            {user?.fullname || "User"}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
