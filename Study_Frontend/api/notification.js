import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,    // Shows the banner at the top
    shouldShowList: true,      // Shows in notification list
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Request permission to send notifications
export async function registerForPushNotificationsAsync() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Study Reminders",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#4F46E5",
    });
  }

  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") {
    console.warn("❌ Notification permissions not granted");
  }
  return status === "granted";
}

// Schedule a local notification for a study task
export async function scheduleTaskNotification(task) {
  try {
    const { subjectName, topic, date, time } = task;
    
    console.log("📅 Scheduling notification for:", { subjectName, topic, date, time });

    // Combine date and time into a single Date object
    const taskDateTime = createTaskDateTime(date, time);
    
    if (!taskDateTime) {
      console.error("❌ Invalid date/time for notification");
      return;
    }

    // Schedule notification 5 minutes before the task
    const notificationTime = new Date(taskDateTime.getTime() - 5 * 60 * 1000); // 5 minutes earlier
    
    // Don't schedule notifications for past times
    if (notificationTime <= new Date()) {
      console.log("⏰ Task time is in the past, skipping notification");
      return;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "📚 Study Reminder",
        body: `Time to study ${subjectName}${topic ? ` - ${topic}` : ''}! Starting in 5 minutes.`,
        sound: true,
        data: {
          taskId: task.id || `${subjectName}_${date}_${time}`,
          subject: subjectName,
          topic: topic,
          originalTime: taskDateTime.toISOString(),
        },
      },
      trigger: notificationTime,
    });

    // console.log("✅ Notification scheduled with ID:", notificationId);
    // console.log("🔔 Will trigger at:", notificationTime.toLocaleString());
    
    return notificationId;
    
  } catch (error) {
    console.error("❌ Error scheduling notification:", error);
  }
}

// Helper function to create a proper DateTime object from date and time strings
function createTaskDateTime(dateString, timeString) {
  try {
    // Handle different date formats
    let taskDate;
    
    if (dateString instanceof Date) {
      taskDate = new Date(dateString);
    } else if (dateString?.toDate) {
      // Firestore Timestamp
      taskDate = dateString.toDate();
    } else {
      // String format (YYYY-MM-DD)
      taskDate = new Date(dateString);
    }

    // Parse time string (HH:MM format)
    const [hours, minutes] = timeString.split(':').map(num => parseInt(num));
    
    // Set the time on the date
    taskDate.setHours(hours);
    taskDate.setMinutes(minutes);
    taskDate.setSeconds(0);
    taskDate.setMilliseconds(0);
    
    return taskDate;
    
  } catch (error) {
    console.error("❌ Error creating task DateTime:", error);
    return null;
  }
}

// Cancel a specific notification
export async function cancelTaskNotification(notificationId) {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    console.log("✅ Cancelled notification:", notificationId);
  } catch (error) {
    console.error("❌ Error cancelling notification:", error);
  }
}

// Cancel all scheduled notifications
export async function cancelAllNotifications() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log("✅ Cancelled all notifications");
  } catch (error) {
    console.error("❌ Error cancelling all notifications:", error);
  }
}

// Get all scheduled notifications (useful for debugging)
export async function getScheduledNotifications() {
  try {
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
    console.log("📋 Scheduled notifications:", notifications.length);
    return notifications;
  } catch (error) {
    console.error("❌ Error getting scheduled notifications:", error);
    return [];
  }
}