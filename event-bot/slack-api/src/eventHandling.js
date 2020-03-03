
const {
  homePageRegistering
} = require("./registerHomePage");
const { directMessage } = require("./helpers");
const fetch = require('node-fetch');
const {
  getEventRegistrations
} = require("./eventRegistrations");

exports.registerEvents = (app) => {
  
  const registereableMessageEvents = getEventRegistrations(app);

  const handleRegistreables = (message, context) => {
    const sayFunc =  msg => {
      let body = {
        channel: message.channel,
        text: msg
      };

      fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + context.botToken
        },
        body: JSON.stringify(body)
      });
    };

    console.log(message);
    registereableMessageEvents.forEach(command => {
      if (message.text.match(command.query)) {
        if(command.heavy){
           sayFunc(`Processing request ${command}...`);
        }

        command.lambda({ message, say: sayFunc, context });
      }
    });
  }

  app.event("app_mention", ({ event, context, say }) => {
    const message = {
      text: event.text,
      channel: event.channel,
      user: event.user
    };

    console.log(message);
    handleRegistreables(message, context);
    
  });

  app.message(directMessage,  ({ message, context, say }) => {
    console.log(message);
    handleRegistreables(message, context);
  });

  homePageRegistering(app);
};
