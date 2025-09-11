import {
  View,
  Text,
  Image,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { isAuthenticated } from "../api/firebaseauth";

export default function LandingScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLetsStart = async () => {
    setLoading(true);
    try {
      // Check if user is already authenticated
      const authResult = await isAuthenticated();
      
      if (authResult.isAuth) {
        router.push("/(tabs)/home");
      } else {
        router.push("/loginscreen");
      }
    } catch (error) {
      console.error("❌ Auth check failed:", error);
      router.push("/loginscreen");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#E6E6FA]">
      <StatusBar backgroundColor="#E6E6FA" barStyle="dark-content" />
      <SafeAreaView className="flex-1">
        <View className="flex-1 justify-evenly items-center">
          <View>
            <Text className="text-xl font-bold text-center text-[#151516]">
              Welcome to Study Buddy
            </Text>
            <Text className="text-xl font-bold text-center text-[#151516]">
              Your Partner for Learning
            </Text>
          </View>
          <View
            className="w-[380px] h-[350px] overflow-hidden"
            style={{ borderRadius: 40 }}
          >
            <Image
              source={require("../assets/images/studyb.png")}
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>

          <View className="mt-2 px-2 pb-5">
            <Text className="text-base font-medium text-center text-gray-500">
              Unlock Smarter Learning With AI {"\n"}
              Discover Explanations, Videos & Notes All in One Place, Without
              Distractions.
            </Text>
          </View>

          <View>
            <TouchableOpacity
              className={`py-3 px-12 rounded-full shadow ${
                loading ? "bg-gray-400" : "bg-blue-600"
              }`}
              onPress={handleLetsStart}
              disabled={loading}
            >
              {loading ? (
                <View className="flex-row items-center">
                  <ActivityIndicator size="small" color="white" />
                  <Text className="text-base font-medium text-white ml-2">
                    Starting...
                  </Text>
                </View>
              ) : (
                <Text className="text-base font-medium text-white">
                  Let's Start
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}