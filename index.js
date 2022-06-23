require("dotenv").config();
const { Client, Intents } = require("discord.js");
const { twitterStream } = require("./twitterStream");

const myIntents = new Intents();
myIntents.add(
  Intents.FLAGS.GUILDS,
  Intents.FLAGS.GUILD_MESSAGES,
  Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  Intents.FLAGS.GUILD_MEMBERS,
  Intents.FLAGS.GUILD_PRESENCES
);
const client = new Client({
  intents: myIntents,
  partials: ["MESSAGE", "CHANNEL", "REACTION"],
});

// When we are ready, emit this.
client.on("ready", async () => {
  console.log(`Logged in as ${client.user.tag}!`);

  function presence() {
    client.user.setPresence({
      status: "idle",
      activities: [
        {
          name: "News",
          type: "WATCHING",
        },
      ],
    });
  }

  presence();
  twitterStream(client);

  setInterval(presence, 1000 * 60 * 60);
});

client.login(process.env.TOKEN); // Login bot using token.
