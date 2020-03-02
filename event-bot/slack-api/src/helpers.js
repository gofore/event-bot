const directMessage = ({ message, next }) => {
    if (message.channel_type === "im") {
      next();
    }
  };

exports.directMessage = directMessage;