require("dotenv").config();
const { Client, Intents } = require("discord.js");
const { twitterStream } = require("./twitterStream");

const myIntents = new Intents();
myIntents.add(Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILDS);
const client = new Client({
  intents: myIntents,
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
