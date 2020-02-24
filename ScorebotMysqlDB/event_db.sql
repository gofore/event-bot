CREATE TABLE `event` (
  `event_id` int PRIMARY KEY AUTO_INCREMENT,
  `event_name` varchar(255),
  `long_name` varchar(255),
  `starting_date` timestamp,
  `lyyti_address` varchar(255),
  `location` varchar(255)
);

CREATE TABLE `team` (
  `team_id` int PRIMARY KEY AUTO_INCREMENT,
  `event_id` int,
  `team_name` varchar(255)
);

CREATE TABLE `game` (
  `game_id` int PRIMARY KEY AUTO_INCREMENT,
  `event_id` int,
  `game_name` varchar(255)
);

CREATE TABLE `team_game` (
  `team_id` int,
  `game_id` int,
  `score` int,
  PRIMARY KEY (`team_id`, `game_id`)
);

CREATE TABLE `correct_answer` (
  `game_id` int,
  `json_answerset` text
);

CREATE TABLE `vote` (
  `vote_id` int PRIMARY KEY AUTO_INCREMENT,
  `event_id` int,
  `slack_id` varchar(255),
  `vote` int
);

CREATE TABLE `ending` (
  `event_id` int,
  `location_from` varchar(255),
  `end_time` timestamp,
  PRIMARY KEY (`event_id`, `location_from`)
);

ALTER TABLE `team` ADD CONSTRAINT `team_event_id` FOREIGN KEY (`event_id`) REFERENCES `event` (`event_id`);

ALTER TABLE `game` ADD CONSTRAINT `game_event_id` FOREIGN KEY (`event_id`) REFERENCES `event` (`event_id`);

ALTER TABLE `team_game` ADD CONSTRAINT `team_game_team_id` FOREIGN KEY (`team_id`) REFERENCES `team` (`team_id`);

ALTER TABLE `team_game` ADD CONSTRAINT `team_game_game_id` FOREIGN KEY (`game_id`) REFERENCES `game` (`game_id`);

ALTER TABLE `correct_answer` ADD CONSTRAINT `correct_answer_game_id` FOREIGN KEY (`game_id`) REFERENCES `game` (`game_id`);

ALTER TABLE `vote` ADD CONSTRAINT `vote_event_id` FOREIGN KEY (`event_id`) REFERENCES `event` (`event_id`);

ALTER TABLE `ending` ADD CONSTRAINT `ending_event_id` FOREIGN KEY (`event_id`) REFERENCES `event` (`event_id`);
