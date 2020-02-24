INSERT INTO event (event_name, long_name, starting_date, lyyti_address, location)
VALUES ('hw', 'Jyväskylä housewarming party 2020', '2020-03-27 16:00:00', 'https://www.lyyti.fi/reg/gofore_jkl_housewarming_party_2020',  'https://goo.gl/maps/gSPsrBNFVQqy5tkR8');

INSERT into ending (event_id, location_from_three_lettered, location_from, end_time)
SELECT ev.event_id, 'TRE', 'Tampere', '2020-03-27 23:00:00'
FROM event ev
WHERE ev.event_name = 'hw';

INSERT into ending (event_id, location_from_three_lettered, location_from, end_time)
SELECT ev.event_id, 'HEL', 'Helsinki', '2020-03-27 23:00:00'
FROM event ev
WHERE ev.event_name = 'hw';

INSERT into ending (event_id, location_from_three_lettered, location_from, end_time)
SELECT ev.event_id, 'TKU', 'Turku', '2020-03-27 23:00:00'
FROM event ev
WHERE ev.event_name = 'hw';


INSERT into game (event_id, game_name)
SELECT ev.event_id, 'Speden spelit'
FROM event ev
WHERE ev.event_name = 'hw';

