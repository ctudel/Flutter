-- Execute all SQL INSERT statements, in sequential order, from the top of this file
-- to populate the tables with sample data


-- TODO: Insert some sample rows to populate the tables
INSERT INTO samples(id, tbd)
VALUES
    (1, 'value1'),
    (2, 'value2'),
    (3, 'value3'),
    (4, 'value4');

INSERT INTO user_posts (id, username, postBody, timestamp, likes)
VALUES
    (1, 'John Smith', 'Hello world!', '11/14/2023, 12:10:00 PM', 0);

-- commentId must be an existing id for a post in user_posts. Since we all have different local databases
-- we probably have differing posts with different id's. These two sample comments are associated with
-- a post with an id of 3
INSERT INTO user_comments (commentId, username, commentBody)
VALUES (3, 'test', 'This is a sample comment.'),
       (3, 'Someone', 'This is another comment');
