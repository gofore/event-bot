const {
  timeUntilEvent,
  timeUntilEventEnd,
  saveScore,
  requestEventName,
  registerTeam,
  locationOfEvent,
  requestSoonestEvent,
  voteImage
} = require("./databaseInterface");
const {
  homePageRegistering
} = require("./registerHomePage");
const {
  registerSaga,
  showAllGameScores,
  showSingleGamesScores
} = require("./scoreHandlingFunctions");
const { registerVotingSaga } = require("./voteHandlingFunctions");
const { createAskForTeam, createAskForVote } = require("./modalDefinitions");
const { directMessage } = require("./helpers");
const fetch = require('node-fetch');

const eventName = requestSoonestEvent(Date.now());

const splitMentionMessage = message => {
  let split = message.text.split(" ");
  if (split[0].includes("@")) {
    split = split.slice(1);
  }
  return split;
};

const parseInteger = stringFormattedNumber => {
  //TODO: safeguards
  return parseInt(stringFormattedNumber);
};

const sayTimeUntil = (say, millisecondsUntil) => {
  const timeInDays = millisecondsUntil / 1000 / 60 / 60 / 24;
  say(
    `Time until event is ${millisecondsUntil} milliseconds or ${timeInDays.toFixed(
      2
    )} days`
  );
};

exports.registerEvents = (app, finish) => {
  registerSaga(app);
  registerVotingSaga(app);
  const askForTeam = createAskForTeam(app);
  const askForVote = createAskForVote(app);

  //This is a bit unreadable but will in the future allow using the same lambdas for multiple different event listeners
  const registereableMessageEvents = [
    {
      query: /eta|ETA/,
      lambda:  ({ message, say, context }) => {
        const timeUntil = timeUntilEvent(requestEventName()) - Date.now();
        sayTimeUntil(say, timeUntil);
      },
      help: "[eta] to see how much time left for the event."
    },
    {
      heavy: true,
      query: /score .+ .+ \d+$/,
      lambda:  ({ message, say, context }) => {
        const params = splitMentionMessage(message);
        const gameName = params[1];
        const teamName = params[2];
        const score = parseInteger(params[3]);
        if (isNaN(score)) {
          say(
            "The third parameter needs to be a number representing the score"
          );
          return;
        }
        if (saveScore(requestEventName(), gameName, teamName, score)) {
          say(":+1:");
        } else {
          say("Score saving failed");
        }
      },
      help:
        "[score _gameName_ _teamName_ _score_] to register scores for a game you participateed. Score should be in number format."
    },
    {
      heavy: true,
      query: /score .+$/,
      lambda:  ({ message, say, context }) => {
        say("Nice to meet you my old fiend. Let's score! :)");
        try {
        } catch (error) {
          console.error(error);
        }
      }
    },
    {
      heavy: true,
      query: /register .+/,
      lambda:  ({ message, say, context }) => {
        const params = splitMentionMessage(message);
        const teamName = params[1];
        if (registerTeam(teamName)) {
          say("Team registered succesfully with name " + teamName);
        } else {
          say(`Name ${teamName} was not available`);
        }
      },
      help: "[register _teamName_} to register a team"
    },
    {
      query: /loc[ation]{0,5}$/,
      lambda:  ({ say, context }) => {
        const locationLink = locationOfEvent(requestEventName());
        say(`${locationLink}`);
      },
      help: "[location] shows where the event is located."
    },
    {
      heavy: true,
      query: /tops?$/,
      lambda:  ({ message, say, context }) => {
        showAllGameScores(say, 5);
      },
      help: "[top] or [tops] lists the top 5 teams of every game."
    },
    {
      heavy: true,
      query: /tops? [\d].*/,
      lambda:  ({ message, say, context }) => {
        //Message should always be '@bot top number'
        const params = splitMentionMessage(message);
        const topsRequested = parseInteger(params[1]);
        const gameRequestedSpliceParameters = params.splice(2);
        if (gameRequestedSpliceParameters.length > 0) {
          showSingleGamesScores(
            say,
            gameRequestedSpliceParameters.join(" "),
            topsRequested
          );
        } else {
          showAllGameScores(say, topsRequested);
        }
      },
      help: `[top _number_] or [tops _number_ _gameName_]. Shows top scores for all the matching games.`
    },
    {
      heavy: true,
      query: /vote .+ \d+/,
      lambda:  ({ message, say, context }) => {
        const params = splitMentionMessage(message);
        const categoryName = params[1];
        const imageNumber = parseInteger(params[2]);
        const { user } = message;
        if (voteImage(requestEventName(), categoryName, user, imageNumber)) {
          say("You voted image succesfully");
        }
      },
      help:
        "[vote _number_] allows you to register your vote for a image. Number is the image you wish to vote for."
    },
    {
      heavy: true,
      query: /end/,
      lambda:  ({ message, say, context }) => {
        const params = splitMentionMessage(message);
        let location = null;
        if (params.length > 1) {
          location = params[1];
        }
        const timeUntil =
          timeUntilEventEnd(requestEventName(), location) - Date.now();
        sayTimeUntil(say, timeUntil);
      },
      help:
        "[end] or [end _location_] can be used to showcase ending time of event for a certain travel destination if provided"
    },
    {
      query: /help/,
      lambda:  ({ message, say, context }) => {
        helpMentioned(app, say, this.registereableMessageEvents);
      },
      help: "[help] informs user with all the possible commands available."
    },
    {
      heavy: true,
      query: /score$/,
      lambda:  ({ say, message, context }) => {
        const { botToken } = context;
        const { channel } = message;
         askForTeam(botToken, channel);
      },
      help:
        "[score] starts dialog with the user to ask the necessary information for submitting score. USE THIS!"
    },
    {
      heavy: true,
      query: /vote$/,
      lambda:  ({ say, message, context }) => {
        const { botToken } = context;
        const { channel } = message;
         askForVote(botToken, channel);
      },
      help: "[vote] starts dialog with user to define category and number to vote on."
    }
  ];
  this.registereableMessageEvents = registereableMessageEvents;

  const handleRegistreables =  (message, context) => {
    const sayFunc =  msg => {
      let body = {
        channel: message.channel,
        text: msg
      };
      console.log(body);
       fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + context.botToken
        },
        body: JSON.stringify(body)
      });
      finish(null, 200);
    };

    registereableMessageEvents.forEach( command => {
      if (message.text.match(command.query)) {
        if(command.heavy){
           sayFunc("Processing request...");
        }

        command.lambda({ message, say: sayFunc, context });
      }
    });
  }

  app.event("app_mention",  ({ event, context, say }) => {
    const message = {
      text: event.text,
      channel: event.channel,
      user: event.user
    };

    handleRegistreables(message, context);
    
  });

  app.message(directMessage,  ({ message, context, say }) => {
    handleRegistreables(message, context);
  });

  homePageRegistering(app);
};

function helpMentioned(app, say, events) {
  let helpText =
    "My job is to inform you about event details and to allow participating in different event activities.\n";

  events.forEach(element => {
    if (element.help) {
      helpText += element.help + "\n";
    }
  });

  helpText +=
    "Currently I am configured to answer to @my-name commands only.\n";
  say(helpText);
}
