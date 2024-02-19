const { Notification } = require("node-notifier");

async function notifyIrrigation(duration) {
  try {
    new Notification({
      title: "Irrigation Alert",
      message: `Irrigation started for ${duration} hours.`,
      sound: true,
    }).show();
  } catch (error) {
    console.error("Error sending irrigation notification:", error);
    throw error;
  }
}

module.exports = { notifyIrrigation };
