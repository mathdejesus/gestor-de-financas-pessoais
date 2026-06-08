import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    return null;
  }

  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    if (!projectId) {
      console.warn(
        "No EAS project ID configured. Push notifications will not work.",
      );
      return null;
    }

    const token = await Notifications.getExpoPushTokenAsync({ projectId });
    return token.data;
  } catch (error) {
    console.error("Failed to get push token:", error);
    return null;
  }
}

export async function scheduleGoalReminder(
  goalName: string,
  daysRemaining: number,
): Promise<void> {
  if (daysRemaining <= 7 && daysRemaining > 0) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Goal Deadline Approaching",
          body: `"${goalName}" has ${daysRemaining} days remaining. Keep going!`,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 60,
        },
      });
    } catch (error) {
      console.error("Failed to schedule goal reminder:", error);
    }
  }
}

export async function sendGoalCompletedNotification(
  goalName: string,
): Promise<void> {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Goal Completed!",
        body: `Congratulations! You've reached your "${goalName}" goal!`,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 2,
      },
    });
  } catch (error) {
    console.error("Failed to send goal completed notification:", error);
  }
}
