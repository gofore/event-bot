# event-bot
AWS hosted slack bot for keeping track of game scores in events and hosting event information for slack users

#Architecture

SlackAPI <-> Bolt on AWS <-> AWS RDS

Slack will send events associated with this bot to the Bolt running on top of AWS lambdas.
The messages from Slack are sent with the Event based approach to Bolt where Bolt will handle the directMention containing messages based on regexes provided.
If commands or actions are formed based on this information, the Bolt Lambda will invoke AWS RDS to store the data in a relational database.

#Techs used
Slack API, Slack Bolt, Node, AWS, MySQL

#Work Estimate
5-10 working days with incremental additions when AWS is setup - start of another project might come suddenly