import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getUserProfile,
  logoutUser,
  isAuthenticated,
  updateUserProfile,
} from "../../api/firebaseauth";
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from "@env";
import { Ionicons } from "@expo/vector-icons";

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const CLOUD_NAME = CLOUDINARY_CLOUD_NAME;
  const UPLOAD_PRESET = CLOUDINARY_UPLOAD_PRESET;

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authResult = await isAuthenticated();
        if (!authResult.isAuth) {
          router.replace("/loginscreen");
          return;
        }

        const profileResponse = await getUserProfile();
        setUser(profileResponse.data.user);
      } catch (error) {
        console.error("Auth check error:", error);
        router.replace("/loginscreen");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const uploadToCloudinary = async (imageUri) => {
    const formData = new FormData();
    formData.append("file", {
      uri: imageUri,
      type: "image/jpeg",
      name: `${user.uid}.jpg`,
    });
    formData.append("upload_preset", UPLOAD_PRESET);
    formData.append("folder", "ProfilePictures");

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();
    return data.secure_url;
  };

  const pickImage = async () => {
    if (!user?.uid) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setUploading(true);
        const imageUri = result.assets[0].uri;

        const uploadedImageUrl = await uploadToCloudinary(imageUri);

        const response = await updateUserProfile({
          profilePhotoURL: uploadedImageUrl,
        });

        setUser(response.data.user);
        Alert.alert("✅ Success", "Profile picture updated!");
      }
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert("❌ Error", "Failed to update profile picture.");
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            setLoading(true);
            await logoutUser();
            router.replace("/loginscreen");
          } catch (error) {
            console.error("Logout error:", error);
            await AsyncStorage.removeItem("userToken");
            await AsyncStorage.removeItem("userData");
            router.replace("/loginscreen");
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="mt-4 text-gray-500 text-base">Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white px-6 pt-16">
      <View className="items-center">
        {/* Profile Image with overlay + camera icon */}
        <TouchableOpacity onPress={pickImage} disabled={uploading}>
          <View className="relative w-32 h-32">
            {/* Profile Image */}
            <Image
              source={{
                uri:
                  user?.profilePhotoURL ||
                  "https://www.pngkey.com/png/full/73-730477_first-name-profile-image-placeholder-png.png",
              }}
              className="w-32 h-32 rounded-full border-4 border-blue-600"
            />

            {/* Loader strictly inside circle */}
            {uploading && (
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: 128, // match w-32 (32*4)
                  height: 128,
                  borderRadius: 64, // make it perfectly round
                  overflow: "hidden", // clip children
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "rgba(0,0,0,0.4)", // dim overlay
                }}
              >
                <ActivityIndicator size="large" color="#fff" />
              </View>
            )}

            {/* Camera Icon for edit */}
            <View className="absolute bottom-2 right-2 bg-white p-2 rounded-full border border-gray-300 shadow-md">
              <Ionicons name="camera-outline" size={18} color="black" />
            </View>
          </View>
        </TouchableOpacity>

        <Text className="text-2xl font-bold mt-4 text-gray-900">
          {user?.fullname || "User Name"}
        </Text>
        <Text className="text-gray-500 text-base">{user?.email}</Text>
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        onPress={handleLogout}
        disabled={loading}
        className={`flex-row items-center justify-center py-3 rounded-xl mt-80 shadow-md ${
          loading ? "bg-gray-400" : "bg-red-600"
        }`}
      >
        <Ionicons name="log-out-outline" size={20} color="white" />
        <Text className="text-white text-center font-semibold text-lg ml-2">
          {loading ? "⏳ Logging out..." : "Logout"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
