const { Botkit } = require("botkit");
const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");

const controller = new Botkit({
  debug: true,
});

const CREDENTIALS_PATH = path.join(__dirname, "credentials.json");
const TOKEN_PATH = path.join(__dirname, "token.json");
const SCOPES = ["https://www.googleapis.com/auth/calendar"];

const { client_secret, client_id, redirect_uris } = JSON.parse(
  fs.readFileSync(CREDENTIALS_PATH)
).installed;
const oAuth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirect_uris[0]
);

if (fs.existsSync(TOKEN_PATH)) {
  const token = fs.readFileSync(TOKEN_PATH);
  oAuth2Client.setCredentials(JSON.parse(token));
} else {
  // getAccessToken(oAuth2Client);
}

const bot = controller.spawn({
  token: "YOUR_SLACK_BOT_TOKEN",
});

bot.startRTM();

controller.hears(
  ["book (.*)"],
  "direct_message,direct_mention",
  async (bot, message) => {
    const roomName = message.match[1].trim();
    const roomAvailable = true; // Replace with actual availability check

    if (roomAvailable) {
      await bot.reply(
        message,
        `Room ${roomName} is available. Sending booking confirmation.`
      );
      const meetingDetails = {
        room: roomName,
      };
      await bot.reply(
        message,
        `Meeting details: ${JSON.stringify(meetingDetails)}`
      );

      const calendar = google.calendar({ version: "v3", auth: oAuth2Client });
      const event = {
        summary: `Meeting in ${roomName}`,
        start: {
          dateTime: "2024-06-01T10:00:00-07:00",
          timeZone: "America/Los_Angeles",
        },
        end: {
          dateTime: "2024-06-01T11:00:00-07:00",
          timeZone: "America/Los_Angeles",
        },
      };
      calendar.events.insert(
        {
          calendarId: "primary",
          resource: event,
        },
        (err, event) => {
          if (err) {
            console.log(
              "There was an error contacting the Calendar service: " + err
            );
            return;
          }
          console.log("Event created: %s", event.htmlLink);
        }
      );
    } else {
      await bot.reply(message, `Sorry, ${roomName} is not available.`);
    }
  }
);

controller.hears(
  ["upcoming meetings"],
  "direct_message,direct_mention",
  async (bot, message) => {
    const calendar = google.calendar({ version: "v3", auth: oAuth2Client });
    calendar.events.list(
      {
        calendarId: "primary",
        timeMin: new Date().toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: "startTime",
      },
      (err, res) => {
        if (err) {
          console.log("The API returned an error: " + err);
          return;
        }
        const events = res.data.items;
        if (events.length) {
          let reply = "Upcoming meetings:\n";
          events.map((event, i) => {
            const start = event.start.dateTime || event.start.date;
            reply += `${start} - ${event.summary}\n`;
          });
          bot.reply(message, reply);
        } else {
          bot.reply(message, "No upcoming meetings found.");
        }
      }
    );
  }
);
