const {
  timeUntilEvent,
  timeUntilEventEnd,
  saveScore,
  requestEventName,
  registerTeam,
  locationOfEvent,
  voteImage,
  requestAllTeams,
  requestAllGames,
  requestAllVotes
} = require("./databaseInterface");
const {
  showAllGameScores,
  showSingleGamesScores
} = require("./scoreHandlingFunctions");
const { createAskForTeam, createAskForVote } = require("./modalDefinitions");

const splitMentionMessage = message => {
  let split = message.text.match(/("[^"]+"|[^"\s]+)/g);
  if (split[0].includes("@")) {
    split = split.slice(1);
  }
  for (let index = 0; index < split.length; index++) {
    split[index] = split[index].replace(/"/g, '');
    split[index] = split[index].replace(/'/g, '');
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
    "Currently I am configured to answer to @my-name commands only.\nYou can use quotes to give parameters with space!";
  await say(helpText);
}


const checkDBConnectionSuccess = (resultPackage) => {
  if (!resultPackage.message) {
    return false;
  }
  if (resultPackage.affectedRows) {
    return true;
  }

  return false;
}


const dblistIntoString = (array, intro, fieldName) => {
  let answer = intro;
  array.forEach(element => {
    answer += `\n    ${element[fieldName]}`;
  });
  return answer;
}


exports.getEventRegistrations = () => {
  const askForTeam = createAskForTeam();
  const askForVote = createAskForVote();

  const registereableMessageEvents = [
    {
      heavy: false,
      query: /eta|ETA/,
      lambda: async ({ say }) => {
        const timeUntil = await timeUntilEvent(requestEventName()) - Date.now();
        await sayTimeUntil(say, timeUntil);
      },
      help: "[eta] to see how much time left for the event."
    },
    {
      heavy: true,
      query: /score .+ .+ \d+$/,
      lambda: async ({ message, say, sayEphemeral }) => {
        const params = splitMentionMessage(message);
        const gameName = params[1];
        const teamName = params[2];
        const score = parseInteger(params[3]);
        if (isNaN(score)) {
          await sayEphemeral(
            "The third parameter needs to be a number representing the score"
          );
          return;
        }
        const resultPackage = await saveScore(requestEventName(), gameName, teamName, score);
        if (checkDBConnectionSuccess(resultPackage)) {
          await say(":+1:");
        } else {
          await sayEphemeral("Score saving failed");
        }
      },
      help:
        "[score _gameName_ _teamName_ _score_] to register scores for a game you participateed. Score should be in number format."
    },
    {
      heavy: true,
      query: /register .+/,
      lambda: async ({ message, say, sayEphemeral }) => {
        const params = splitMentionMessage(message);
        const teamName = params[1];
        const resultPackage = await registerTeam(requestEventName(), teamName);
        if (checkDBConnectionSuccess(resultPackage)) {
          await say("Team registered succesfully with name " + teamName);
        } else {
          await sayEphemeral(`Name ${teamName} was not available`);
        }
      },
      help: "[register _teamName_} to register a team"
    },
    {
      query: /loc[ation]{0,5}$/,
      lambda: async ({ say }) => {
        const locationLink = await locationOfEvent(requestEventName());
        if (locationLink) {
          await say(`${locationLink}`);
        } else {
          await say('No location found with given event');
        }

      },
      help: "[location] shows where the event is located."
    },
    {
      heavy: true,
      query: /tops?$/,
      lambda: async ({ message, say }) => {
        await showAllGameScores(say, 5);
      },
      help: "[top] or [tops] lists the top 5 teams of every game."
    },
    {
      heavy: true,
      query: /tops? .*/,
      lambda: async ({ message, say }) => {
        const params = splitMentionMessage(message);
        let topsRequested;
        let gameRequested;
        if (params.length > 2) {
          topsRequested = parseInteger(params[1]);
          gameRequested = params[2];
        }
        else {
          gameRequested = params[1];
        }
        await showSingleGamesScores(
          say,
          gameRequested,
          topsRequested
        );
      },
      help: `[top _number_] or [tops _number_ _gameName_]. Shows top scores for all the matching games.`
    },
    {
      heavy: true,
      query: /vote .+ \d+/,
      lambda: async ({ message, say, sayEphemeral }) => {
        const params = splitMentionMessage(message);
        const categoryName = params[1];
        const imageNumber = parseInteger(params[2]);
        const { user } = message;
        const resultPackage = await voteImage(requestEventName(), categoryName, user, imageNumber);
        if (checkDBConnectionSuccess(resultPackage)) {
          await say(`Image ${imageNumber} voted succesfully`);
        }
        else {
          await sayEphemeral("Vote couldn't be processed succesfully");
        }
      },
      help:
        "[vote _categoryName_ _number_] allows you to register your vote for a image. Number is the image you wish to vote for."
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
          await timeUntilEventEnd(requestEventName(), location) - Date.now();
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
    },
    {
      heavy: true,
      query: /teams$/,
      lambda: async ({ say }) => {
        const teams = await requestAllTeams(requestEventName());
        if (teams.length > 0) {
          await say(dblistIntoString(teams, 'Teams registered:', 'team_name'));
        } else {
          await say('No teams registered yet in the event');
        }
      },
      help: "[teams] allows you to check all the registered teams."
    },
    {
      heavy: true,
      query: /games$/,
      lambda: async ({ say }) => {
        //Slightly annoying copy paste
        const games = await requestAllGames(requestEventName());
        if (games.length > 0) {
          await say(dblistIntoString(games, 'Games part of program:', 'game_name'));
        } else {
          await say('No games in that event');
        }
      },
      help: "[games] lists all the scheduled games of the event."
    },
    {
      heavy: true,
      query: /votes$/,
      lambda: async ({ say }) => {
        const votes = await requestAllVotes(requestEventName());
        if (votes.length > 0) {
          let answer = 'Votes in all categories:';
          votes.forEach(vote => {
            answer += `\n    In ${vote.category_name} ${vote.vote} has been voted ${vote.NUM} times`;
          });
          await say(answer);
        } else {
          await say('No votes received yet!');
        }
      }
    }
  ];
  return registereableMessageEvents;
}