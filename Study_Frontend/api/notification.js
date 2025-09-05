
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Request permission to send notifications
export async function registerForPushNotificationsAsync() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

// Schedule a local notification
export async function scheduleTaskNotification(task) {
  const { subjectName, date } = task;

  // Handle Firestore Timestamp or JS Date
  let triggerDate = date?.toDate ? date.toDate() : new Date(date);

  // Fire 5 minutes earlier
  triggerDate.setMinutes(triggerDate.getMinutes() - 1);

  if (triggerDate <= new Date()) return; // only future notifications

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Upcoming Study Task 📌",
      body: `Your task "${subjectName}" is scheduled for today at ${triggerDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`,
      sound: true,
    },
    trigger: triggerDate,
  });
}
