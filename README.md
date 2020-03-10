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