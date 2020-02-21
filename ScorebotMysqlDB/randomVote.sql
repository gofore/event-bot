INSERT INTO votes (event_id, slack_id, vote)
SELECT 2, floor(RAND() * 10001),  floor(RAND() * 11)