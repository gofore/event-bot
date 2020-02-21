CREATE TABLE `events` (
  `event_id` int PRIMARY KEY AUTO_INCREMENT,
  `event_name` varchar(255),
  `starting_date` timestamp,
  `lyyti_address` varchar(255),
  `location` varchar(255)
);

CREATE TABLE `teams` (
  `team_id` int PRIMARY KEY AUTO_INCREMENT,
  `event_id` int,
  `team_name` varchar(255)
);

CREATE TABLE `games` (
  `game_id` int PRIMARY KEY AUTO_INCREMENT,
  `event_id` int,
  `name` varchar(255)
);

CREATE TABLE `teams_games` (
  `team_id` int,
  `game_id` int,
  `score` int,
  PRIMARY KEY (`team_id`, `game_id`)
);

CREATE TABLE `correct_answers` (
  `game_id` int,
  `json_answerset` varchar(255)
);

CREATE TABLE `votes` (
  `vote_id` int PRIMARY KEY AUTO_INCREMENT,
  `event_id` int,
  `slack_id` varchar(255),
  `vote` int
);

CREATE TABLE `endings` (
  `event_id` int,
  `location` varchar(255),
  `end_time` timestamp,
  PRIMARY KEY (`event_id`, `location`)
);

ALTER TABLE `teams` ADD FOREIGN KEY (`event_id`) REFERENCES `events` (`event_id`);

ALTER TABLE `games` ADD FOREIGN KEY (`event_id`) REFERENCES `events` (`event_id`);

ALTER TABLE `teams_games` ADD FOREIGN KEY (`team_id`) REFERENCES `teams` (`team_id`);

ALTER TABLE `teams_games` ADD FOREIGN KEY (`game_id`) REFERENCES `games` (`game_id`);

ALTER TABLE `correct_answers` ADD FOREIGN KEY (`game_id`) REFERENCES `games` (`game_id`);

ALTER TABLE `votes` ADD FOREIGN KEY (`vote_id`) REFERENCES `events` (`event_id`);

ALTER TABLE `endings` ADD FOREIGN KEY (`event_id`) REFERENCES `events` (`event_id`);
