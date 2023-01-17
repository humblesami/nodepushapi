const { Expo } = require("expo-server-sdk");

const sendPushNotification = async (targetExpoPushToken, alert_id, message) => {
    const expo = new Expo();
    const chunks = expo.chunkPushNotifications([
        {
            to: targetExpoPushToken,
            sound: "default",
            categoryId: alert_id,
            channelId: 'down_alerts',
            body: message
        }
    ]);

    const sendChunks = async () => {
        // This code runs synchronously. We're waiting for each chunk to be send.
        // A better approach is to use Promise.all() and send multiple chunks in parallel.
        chunks.forEach(async chunk => {
            try {
                const tickets = await expo.sendPushNotificationsAsync(chunk);
            } catch (error) {
                console.log("Error sending chunk", error);
            }
        });
    };
    await sendChunks();
};

module.exports = sendPushNotification;
