
const {
  homePageRegistering
} = require("./registerHomePage");
const { directMessage } = require("./helpers");
const fetch = require('node-fetch');
const {
  eventRegistrations
} = require("./eventRegistrations");

const eventName = requestSoonestEvent(Date.now());

exports.registerEvents = (app, finish) => {
  
  this.registereableMessageEvents = eventRegistrations(app, finish);

  const handleRegistreables =  (message, context) => {
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
      finish(null, 200);
    };

    registereableMessageEvents.forEach( command => {
      if (message.text.match(command.query)) {
        if(command.heavy){
           sayFunc(`Processing request ${command}...`);
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
