require("dotenv").config();
const { ETwitterStreamEvent, TwitterApi } = require("twitter-api-v2");

const client = new TwitterApi({
  appKey: process.env.TWITTER_CONSUMER_KEY,
  appSecret: process.env.TWITTER_CONSUMER_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

async function twitterStream(discordClient) {
  const newsChannel = await discordClient.channels.cache.find(
    (channel) => channel.id === process.env.AVTNEWSCHANNELID
  );

  const stream = await client.v1.stream.getStream("statuses/filter.json", {
    follow: process.env.TWITTERIDS.split(","),
  });

  // Emitted on Tweet
  stream.on(ETwitterStreamEvent.Data, async (tweet) => {
    if (
      tweet.user &&
      process.env.TWITTERIDS.split(",").some((id) => tweet.user.id_str === id)
    ) {
      if (tweet.retweeted_status) {
        newsChannel.send(
          `${tweet.user.screen_name} retweeted: https://twitter.com/${tweet.retweeted_status.user.screen_name}/status/${tweet.retweeted_status.id_str}`
        );
      } else {
        newsChannel
          .send(
            `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`
          )
          .then((message) => {
            if (tweet.quoted_status) {
              message.reply(
                `${tweet.user.name} quoted this: \n https://twitter.com/${tweet.quoted_status.user.screen_name}/status/${tweet.quoted_status.id_str}`
              );
            }
          });
      }
    }
  });

  stream.on(ETwitterStreamEvent.ConnectionLost, async () => {
    console.log("Twitter connection lost.");
  });

  stream.on(ETwitterStreamEvent.ReconnectError, (number) => {
    console.log("Twitter could not reconnect. ", number);

    // PM2 will restart Node when this happens.
    throw new Error("Twitter could not reconnect. ", number);
  });

  stream.on(ETwitterStreamEvent.ConnectionClosed, async () => {
    console.log("Twitter connection closed!");
  });

  stream.on(ETwitterStreamEvent.Reconnected, () =>
    console.log("Twitter stream has connected.")
  );

  stream.on(ETwitterStreamEvent.ConnectionError, async (err) => {
    console.log("Twitter connection error!", err);
  });

  // Start stream!
  await stream.connect({ autoReconnect: true, autoReconnectRetries: Infinity });
}
exports.twitterStream = twitterStream;
