var jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { window } = new JSDOM();
const { document } = (new JSDOM('')).window;
global.document = document;

var $ = jQuery = require('jquery')(window);
const { TeamsActivityHandler, CardFactory, TurnContext} = require("botbuilder");
const rawWelcomeCard = require("./adaptiveCards/welcome.json");
const rawLearnCard = require("./adaptiveCards/learn.json");
const rawQuestionCard = require("./adaptiveCards/question.json");

const rawCheckCard = require("./adaptiveCards/check.json");

const cardTools = require("@microsoft/adaptivecards-tools");
const jquery = require("jquery");
{/* <script src="https://ajax.googleapis.com/ajax/libs/prototype/1.7.3.0/prototype.js"></script> */}

const axios = require('axios');
const https = require("https");

class TeamsBot extends TeamsActivityHandler {
  constructor() {
    super();

    // record the likeCount
    this.likeCountObj = { likeCount: 0 };

    this.onMessage(async (context, next) => {
      console.log("Running with Message Activity.");
      let txt = context.activity.text;
      const removedMentionText = TurnContext.removeRecipientMention(
        context.activity
      );
      if (removedMentionText) {
        // Remove the line break
        txt = removedMentionText.toLowerCase().replace(/\n|\r/g, "").trim();
      }

      // Trigger command by IM text
      switch (txt) {
        case "welcome": {
          const card = cardTools.AdaptiveCards.declareWithoutData(rawWelcomeCard).render();
          var su ="";
          var fa = "";
        const agent = new https.Agent({  
          rejectUnauthorized: false
        });
        axios.get('https://localhost:44341/api/app/teams-bots/cancel-subscription', { httpsAgent: agent })
            .then(response => {
              su = "This is Success";
              console.log(su,"This is Success");
            })
            .catch(error => {
              console.log(error);
              fa ="This is failure";
              console.log(fa,"This is  a failure");
            });
          await context.sendActivity({ attachments: [CardFactory.adaptiveCard(card)] });
          break;
        }
        case "learn": {
          this.likeCountObj.likeCount = 0;
          const card = cardTools.AdaptiveCards.declare(rawLearnCard).render(this.likeCountObj);
          // https://localhost:44341/api/app/teams-bots/cancel-subscription
          await context.sendActivity({ attachments: [CardFactory.adaptiveCard(card)] });
          break;
        }
        case "question": {
        const agent = new https.Agent({  
          rejectUnauthorized: false
        });

        const card = cardTools.AdaptiveCards.declare(rawQuestionCard).render();

        await context.sendActivity({ attachments: [CardFactory.adaptiveCard(card)] });

          break;
        }
        case "check": {
          const card = cardTools.AdaptiveCards.declare(rawCheckCard).render();
          await context.sendActivity({ attachments: [CardFactory.adaptiveCard(card)] });
          break;
        }
        /**
         * case "yourCommand": {
         *   await context.sendActivity(`Add your response here!`);
         *   break;
         * }
         */
      }

// var template = new ACData.Template({ 
//   // Card Template JSON
// });

// var card = template.expand({
//   $root: {
//       // Data Fields
//   }
// });
      // By calling next() you ensure that the next BotHandler is run.
      await next();
    });

    // Listen to MembersAdded event, view https://docs.microsoft.com/en-us/microsoftteams/platform/resources/bot-v3/bots-notifications for more events
    this.onMembersAdded(async (context, next) => {
      const membersAdded = context.activity.membersAdded;
      for (let cnt = 0; cnt < membersAdded.length; cnt++) {
        if (membersAdded[cnt].id) {
          const card = cardTools.AdaptiveCards.declareWithoutData(rawWelcomeCard).render();
          await context.sendActivity({ attachments: [CardFactory.adaptiveCard(card)] });
          break;
        }
      }
      await next();
    });
  }

  // Invoked when an action is taken on an Adaptive Card. The Adaptive Card sends an event to the Bot and this
  // method handles that event.
  async onAdaptiveCardInvoke(context, invokeValue) {
    // The verb "userlike" is sent from the Adaptive Card defined in adaptiveCards/learn.json
    if (invokeValue.action.verb === "userlike") {
      this.likeCountObj.likeCount++;
      const card = cardTools.AdaptiveCards.declare(rawLearnCard).render(this.likeCountObj);
      await context.updateActivity({
        type: "message",
        id: context.activity.replyToId,
        attachments: [CardFactory.adaptiveCard(card)],
      });
      return { statusCode: 200 };
    }
  }

}


module.exports.TeamsBot = TeamsBot;
