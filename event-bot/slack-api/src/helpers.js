const fetch = require('node-fetch');

const directMessage = ({ message, next }) => {
    if (message.channel_type === "im") {
      next();
    }
  };

exports.directMessage = directMessage;

exports.postSlack = (apiAddress, botToken, params) => {
  return fetch('https://slack.com/api/' + apiAddress, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + botToken
    },
    body: JSON.stringify(params)
  });
}


exports.postOk = (address, botToken) => {
  return fetch(address, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + botToken
    },
    statusCode: 200,
    body: {}
  });
}