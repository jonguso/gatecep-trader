import * as Notifications from "expo-notifications";

let notificationsReady = false;

try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false
    })
  });

  notificationsReady = true;
} catch (error) {
  console.log("Notifications disabled in Expo Go:", error.message);
}

export async function registerForPushNotifications() {
  console.log("Push registration skipped in Expo Go.");
  return null;
}

export async function sendLocalNotification(title, body) {
  if (!notificationsReady) {
    console.log("Notification:", title, body);
    return;
  }

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body
      },
      trigger: null
    });
  } catch (error) {
    console.log("Local notification fallback:", title, body);
  }
}