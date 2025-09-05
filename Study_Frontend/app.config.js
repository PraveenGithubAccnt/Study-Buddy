import "dotenv/config";

export default {
  expo: {
    name: "Study_Buddy",
    slug: "Study_Buddy",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "studybuddy",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/icon.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
      package: "com.praveen_26.Study_Buddy",
      usesCleartextTraffic: true,
      permissions: ["INTERNET"],
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/icon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
        },
      ],
      "expo-font",
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {},
      eas: {
        projectId: "81c538bb-2671-49a8-af7f-f4d669965988",
      },
      authCall: process.env.AUTH_CALL,
      scheduleCall: process.env.SCHEDULE_CALL,
      googleaiCall: process.env.GOOGLEAI_CALL,
      youtubeCall: process.env.YOUTUBE_CALL,
      pdfCall: process.env.PDF_CALL,
      rerankCall: process.env.RERANK_CALL,
    },
  },
};
