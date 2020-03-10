# event-bot
AWS hosted slack bot for keeping track of game scores in events and hosting event information for slack users

#Architecture

SlackAPI <-> AWS VPC(Lambda <-> AWS RDS)

Slack will send events associated with this bot to the Bolt running on top of AWS lambdas.
The messages from Slack are sent with the Event based approach to Bolt where Bolt will handle the directMention containing messages based on regexes provided.
If commands or actions are formed based on this information, the Bolt Lambda will invoke AWS RDS to store the data in a relational database.

The AWS VPC has public subnet and multiple private subnets for connection handling.
The VPC has 2 route tables to organize traffic in and out of the VPC.
Lambda can be accessed through a public address and the lambda has a NAT Gateway to allow access to the outside world, mainly Slack API.

The architecture is hosted in eu-west-1 and it has an s3 bucket named event-bot-bucket and the lambda itself is named event-bot.
Lambda can be accessed with that stack name, the real name is a bit more convoluted with additional characters.

Currently uploading to the AWS is done through SAM CLI, but later setup for CDK or Terraform is recommended to make uploads more smooth and resetups a lot faster.

#Techs used
Slack API, Node, AWS Lambda, AWS RDS, MySQL, SAM CLI

#Information stored and security
The information in the project is stored in AWS in a secure database only accessible with keys.
The bot only stores player registered team names and Slack Ids, which could be somewhat thought as personal information.

Slack id is only stored to indicate that the person has voted already once so only a vote number is associated with the id.

Team name can be basically anything so it is possible it also contains personally identifiable information. Team name is only associated with scores registered to the system.

Logging can be disabled with an environment variable and without logging, messages should not be displayed to the user.

#Environment variables used
SLACK_BOT_TOKEN,
SLACK_SIGNING_SECRET,
VERIFICATION_TOKEN
DB_PASSWORD
CLIENT_ID
CLIENT_SECRET
DEBUG_LOGS

Most of the variables are related to slack and its functionality and should be directly related to the slack app being built.
DEBUG_LOGS is used for disabling/enabling debugging for requests to have a better understanding what is happening inside the lambda and RDS.

