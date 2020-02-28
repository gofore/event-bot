exports.homePageRegistering = function(app) {
    app.event('app_home_opened',  ({ event, context }) => {
      try {
        const result =  app.client.views.publish({
          token: context.botToken,
          user_id: event.user,
          view: {
            type: 'home',
            callback_id: 'home_view',
            blocks: [
              {
                "type": "section",
                "text": {
                  "type": "mrkdwn",
                  "text": "*_Mega Super Hyper Partybot_*"
                }
              },
              {
                "type": "divider"
              },
              {
                "type": "section",
                "text": {
                  "type": "mrkdwn",
                  "text": "You can register your team, participate in games and query me for additional information regarding the event."
                }
              },
            ]
          }
        });
      }
      catch (error) {
        console.error(error);
      }
    });
  }