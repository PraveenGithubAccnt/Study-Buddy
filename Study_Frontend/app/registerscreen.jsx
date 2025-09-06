import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  Image,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { registerUser } from "../api/firebaseauth";
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from "@env"; // Keep this import

const RegisterScreen = () => {
  const router = useRouter();
  const [name, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // 🔥 NEW: Loading state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  // 📌 Pick image from gallery (keep existing function)
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  // 🔥 NEW: Handle Register with Backend API
  const handleRegister = async () => {
    // Clear previous errors
    setError("");

    // Basic validation
    if (!name || !email || !password || !confirmPassword) {
      return setError("Please fill in all fields.");
    }
    if (password !== confirmPassword) {
      return setError("Passwords don't match.");
    }
    if (password.length < 6) {
      return setError("Password should be at least 6 characters.");
    }

    setLoading(true);

    try {
      // Call our backend API
      const response = await registerUser({
        fullname: name,
        email: email,
        password: password,
        profileImage: profileImage,
        cloudinaryConfig: {
          cloudName: CLOUDINARY_CLOUD_NAME,
          uploadPreset: CLOUDINARY_UPLOAD_PRESET,
        },
      });

      console.log("✅ Registration successful:", response.data.user);

      // Show success message
      Alert.alert(
        "Success! 🎉",
        "Account created successfully! You can now login.",
        [
          {
            text: "OK",
            onPress: () => router.replace("/loginscreen"),
          },
        ]
      );
    } catch (err) {
      console.error("❌ Registration failed:", err);
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1 bg-white justify-center px-6"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            paddingHorizontal: 25,
            paddingBottom: 150,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {/* App Header */}
          <View className="items-center mb-8">
            <Text className="text-4xl font-extrabold text-blue-600">
              Study Buddy
            </Text>
            <Text className="text-lg text-gray-500 mt-2">
              Create a new account
            </Text>
          </View>

          {error ? (
            <Text className="text-red-600 text-center mb-4 bg-red-50 p-3 rounded-lg">
              {error}
            </Text>
          ) : null}

          {/* 📌 Profile Picture Picker */}
          <TouchableOpacity onPress={pickImage} className="items-center mb-6">
            <Image
              source={{
                uri:
                  profileImage ||
                  "https://www.pngkey.com/png/full/73-730477_first-name-profile-image-placeholder-png.png",
              }}
              style={{ width: 100, height: 100, borderRadius: 50 }}
            />
            <Text className="text-blue-600 mt-2">Choose Profile Picture</Text>
          </TouchableOpacity>

          {/* Full Name */}
          <TextInput
            placeholder="Full Name"
            placeholderTextColor="#9CA3AF"
            value={name}
            onChangeText={setFullname}
            className="bg-gray-100 text-gray-800 rounded-xl px-4 py-3 mb-4 border border-gray-300"
            editable={!loading}
          />

          {/* Email */}
          <TextInput
            placeholder="Email"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            className="bg-gray-100 text-gray-800 rounded-xl px-4 py-3 mb-4 border border-gray-300"
            editable={!loading}
          />

          {/* Password */}
          <View className="relative mb-4">
            <TextInput
              placeholder="Password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              className="bg-gray-100 text-gray-800 rounded-xl px-4 py-3 border border-gray-300 pr-12"
              editable={!loading}
            />
            <TouchableOpacity
              className="absolute right-4 top-3"
              onPress={() => setShowPassword(!showPassword)}
            >
              <Feather
                name={showPassword ? "eye" : "eye-off"}
                size={22}
                color="gray"
              />
            </TouchableOpacity>
          </View>

          {/* Confirm Password */}
          <View className="relative mb-6">
            <TextInput
              placeholder="Confirm Password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!showConfirm}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              className="bg-gray-100 text-gray-800 rounded-xl px-4 py-3 border border-gray-300 pr-12"
              editable={!loading}
            />
            <TouchableOpacity
              className="absolute right-4 top-3"
              onPress={() => setShowConfirm(!showConfirm)}
            >
              <Feather
                name={showConfirm ? "eye" : "eye-off"}
                size={22}
                color="gray"
              />
            </TouchableOpacity>
          </View>

          {/* Register Button */}
          <TouchableOpacity
            onPress={handleRegister}
            disabled={loading}
            className={`py-3 rounded-xl shadow-md mb-4 ${
              loading ? "bg-gray-400" : "bg-blue-600"
            }`}
          >
            <Text className="text-white font-semibold text-center text-lg">
              {loading ? "⏳ Creating Account..." : "Register"}
            </Text>
          </TouchableOpacity>

          {/* Already have account */}
          <TouchableOpacity
            onPress={() => router.push("/loginscreen")}
            disabled={loading}
          >
            <Text className="text-center text-blue-600 underline">
              Already have an account? Login
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RegisterScreen;
