//index main screen
import {
  View,
  Text,
  Image,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import { useRouter, Link } from "expo-router";

export default function LandingScreen() {
  const router = useRouter();

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
              className="bg-blue-600 py-3 px-12 rounded-full shadow"
              onPress={() => router.push("/loginscreen")}
            >
              <Text className="text-base font-medium text-white">
                Let's Start
              </Text>
            </TouchableOpacity>
          </View>

          <Link
            href="/network-debug"
            style={{
              marginTop: 20,
              padding: 10,
              backgroundColor: "#f0f0f0",
              textAlign: "center",
              borderRadius: 5,
            }}
          >
            <Text>🔧 Network Debug</Text>
          </Link>
        </View>
      </SafeAreaView>
    </View>
  );
}
