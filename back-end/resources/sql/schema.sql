-- Execute all SQL statements, in sequential order, from the top of this file
-- to create the tables or to "reset" the database to the expected structure


-- TODO: add your tables structure

DROP TABLE IF EXISTS samples;
DROP TABLE IF EXISTS user_posts;
DROP TABLE IF EXISTS user_comments;

CREATE TABLE samples
(
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    tbd         VARCHAR(20)
);

CREATE TABLE user_posts
(
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    username  VARCHAR(15) NOT NULL,
    postBody  TEXT        NOT NULL,
    timestamp DATE,
    likes     INTEGER
);

CREATE TABLE user_comments
(
    commentId   INTEGER, -- commentId will correspond to the post it is commenting on.
    username    VARCHAR(15) NOT NULL,
    commentBody TEXT NOT NULL,
    FOREIGN KEY(commentId) REFERENCES user_posts(id)
);