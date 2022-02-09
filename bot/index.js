// index.js is used to setup and configure your bot

// Import required packages
const restify = require("restify");

// Import required bot services.
// See https://aka.ms/bot-services to learn more about the different parts of a bot.
const { BotFrameworkAdapter } = require("botbuilder");
const { TeamsBot } = require("./teamsBot");

// Create adapter.
// See https://aka.ms/about-bot-adapter to learn more about adapters.
const adapter = new BotFrameworkAdapter({
  appId: process.env.BOT_ID,
  appPassword: process.env.BOT_PASSWORD,
});

adapter.onTurnError = async (context, error) => {
  // This check writes out errors to console log .vs. app insights.
  // NOTE: In production environment, you should consider logging this to Azure
  //       application insights. See https://aka.ms/bottelemetry for telemetry
  //       configuration instructions.
  console.error(`\n [onTurnError] unhandled error: ${error}`);

  // Send a message to the user
  await context.sendActivity(`The bot encountered an unhandled error:\n ${error.message}`);
  await context.sendActivity("To continue to run this bot, please fix the bot source code.");
};

// Create the bot that will handle incoming messages.
const bot = new TeamsBot();

// Create HTTP server.
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
  console.log(`\nBot started, ${server.name} listening to ${server.url}`);
});

// Listen for incoming requests.
server.post("/api/messages", async (req, res) => {
  console.log("Clicked")
  await adapter.processActivity(req, res, async (context) => {
    await bot.run(context);
  });
});

// Gracefully shutdown HTTP server
["exit", "uncaughtException", "SIGINT", "SIGTERM", "SIGUSR1", "SIGUSR2"].forEach((event) => {
  process.on(event, () => {
    server.close();
  });
});


// const options = {
// 	authProvider,
// };

// const client = Client.init(options);

// const call = {
//   '@odata.type': '#microsoft.graph.call',
//   callbackUri: 'https://bot.contoso.com/callback',
//   targets: [
//     {
//       '@odata.type': '#microsoft.graph.invitationParticipantInfo',
//       identity: {
//         '@odata.type': '#microsoft.graph.identitySet',
//         user: {
//           '@odata.type': '#microsoft.graph.identity',
//           displayName: 'John',
//           id: '112f7296-5fa4-42ca-bae8-6a692b15d4b8'
//         }
//       }
//     }
//   ],
//   requestedModalities: [
//     'audio'
//   ],
//   mediaConfig: {
//     '@odata.type': '#microsoft.graph.serviceHostedMediaConfig'
//   }
// };

// await client.api('/communications/calls')
// 	.post(call);
