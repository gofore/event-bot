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
  showAllGameScores,
  showSingleGamesScores
} = require("./scoreHandlingFunctions");
const { createAskForTeam, createAskForVote } = require("./modalDefinitions");

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
  
const sayTimeUntil = async (say, millisecondsUntil) => {
  const timeInDays = (millisecondsUntil / 1000 / 60 / 60 / 24).toFixed(2);
  await say(
    `Time until event is ${millisecondsUntil} milliseconds or ${timeInDays} days`
  );
};

const helpMentioned = async (say, events) => {
  let helpText =
    "My job is to inform you about event details and to allow participating in different event activities.\n";

  events.forEach(element => {
    if (element.help) {
      helpText += element.help + "\n";
    }
  });

  helpText +=
    "Currently I am configured to answer to @my-name commands only.\n";
  await say(helpText);
}


exports.getEventRegistrations = () => {
  const askForTeam = createAskForTeam();
  const askForVote = createAskForVote();

  console.log(askForTeam);
  const registereableMessageEvents = [
    {
      query: /eta|ETA/,
      lambda: async ({ say }) => {
        const timeUntil = timeUntilEvent(requestEventName()) - Date.now();
        await sayTimeUntil(say, timeUntil);
      },
      help: "[eta] to see how much time left for the event."
    },
    {
      heavy: true,
      query: /score .+ .+ \d+$/,
      lambda: async ({ message, say }) => {
        const params = splitMentionMessage(message);
        const gameName = params[1];
        const teamName = params[2];
        const score = parseInteger(params[3]);
        if (isNaN(score)) {
            await say(
            "The third parameter needs to be a number representing the score"
          );
          return;
        }
        if (saveScore(requestEventName(), gameName, teamName, score)) {
            await say(":+1:");
        } else {
            await say("Score saving failed");
        }
      },
      help:
        "[score _gameName_ _teamName_ _score_] to register scores for a game you participateed. Score should be in number format."
    },
    {
      heavy: true,
      query: /register .+/,
      lambda: async ({ message, say }) => {
        const params = splitMentionMessage(message);
        const teamName = params[1];
        if (registerTeam(teamName)) {
            await say("Team registered succesfully with name " + teamName);
        } else {
            await say(`Name ${teamName} was not available`);
        }
      },
      help: "[register _teamName_} to register a team"
    },
    {
      query: /loc[ation]{0,5}$/,
      lambda: async ({ say }) => {
        const locationLink = locationOfEvent(requestEventName());
        await say(`${locationLink}`);
      },
      help: "[location] shows where the event is located."
    },
    {
      heavy: true,
      query: /tops?$/,
      lambda: async ({ message, say }) => {
        showAllGameScores(say, 5);
      },
      help: "[top] or [tops] lists the top 5 teams of every game."
    },
    {
      heavy: true,
      query: /tops? [\d].*/,
      lambda: async ({ message, say }) => {
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
      lambda: async ({ message, say }) => {
        const params = splitMentionMessage(message);
        const categoryName = params[1];
        const imageNumber = parseInteger(params[2]);
        const { user } = message;
        if (voteImage(requestEventName(), categoryName, user, imageNumber)) {
            await say("You voted image succesfully");
        }
      },
      help:
        "[vote _number_] allows you to register your vote for a image. Number is the image you wish to vote for."
    },
    {
      heavy: true,
      query: /end/,
      lambda: async ({ message, say }) => {
        const params = splitMentionMessage(message);
        let location = null;
        if (params.length > 1) {
          location = params[1];
        }
        const timeUntil =
          timeUntilEventEnd(requestEventName(), location) - Date.now();
        await sayTimeUntil(say, timeUntil);
      },
      help:
        "[end] or [end _location_] can be used to showcase ending time of event for a certain travel destination if provided"
    },
    {
      query: /help/,
      lambda: async ({ say, events }) => {
        await helpMentioned(say, events);
      },
      help: "[help] informs user with all the possible commands available."
    },
    {
      heavy: true,
      query: /score$/,
      lambda: async ({ say, message, botToken }) => {
        await askForTeam(botToken, message);
      },
      help:
        "[score] starts dialog with the user to ask the necessary information for submitting score. USE THIS!"
    },
    {
      heavy: true,
      query: /vote$/,
      lambda: async ({ say, message, botToken }) => {
        await askForVote(botToken, message);
      },
      help: "[vote] starts dialog with user to define category and number to vote on."
    }
  ];
  return registereableMessageEvents;
}