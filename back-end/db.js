const util = require("util");
const fs = require("fs");
const sqlite3 = require('sqlite3').verbose();

// TODO: create a SQLite data source in IntelliJ with the name: "./back-end/cs208_project.sqlite"

// Do not change this name. The 'cs208_project.sqlite' will be created in the same folder as db.js
const SQLITE_FILE_NAME = "cs208_project.sqlite";


let db;

// If the run environment is 'test', we create an ephemeral (in memory) SQLite database that will
//   - create tables using the structure defined in the schema file: './resources/sql/schema.sql'
//   - populate the tables with data from the seeds file: './resources/sql/seeds.sql'
// Once the tests complete (i.e., finish running), this in memory SQLite database will be deleted automatically
//
// However, if the environment is not 'test' (e.g., the environment is 'development') then the application will use
// the SQLite database specified in the SQLITE_FILE_NAME
if (process.env.NODE_ENV === "test")
{
    console.log("Creating an in memory SQLite database for running the test suite...");

    const contentOfSchemaSQLFile = fs.readFileSync("./resources/sql/schema.sql", "utf8");
    const contentOfSeedsSQLFile = fs.readFileSync("./resources/sql/seeds.sql", "utf8");

    // Creates a connection to an in-memory SQLite database
    db = new sqlite3.Database(":memory:", function(err)
    {
        if (err)
        {
            return console.error(err.message);
        }

        // Enable enforcement of foreign keys constraints in the SQLite database every time we run the tests
        db.get("PRAGMA foreign_keys = ON;");

        console.log(`Connected to the ':memory:' SQLite database.`);
        console.log("Creating the tables from the 'schema.sql' file...");
        console.log("Populating them with data from the 'seeds.sql' file...");
        db.serialize(function()
        {
            // the serialize method ensures that the SQL queries from the exec calls are executed sequentially
            // (i.e., one after the other instead of being executed in parallel)
            db.exec(contentOfSchemaSQLFile);
            db.exec(contentOfSeedsSQLFile);
        });
    });
}
else
{
    // This is the default environment (e.g., 'development')

    // Create a connection to the SQLite database file specified in SQLITE_FILE_NAME
    db = new sqlite3.Database("./" + SQLITE_FILE_NAME, function(err)
    {
        if (err)
        {
            return console.error(err.message);
        }

        // Enable enforcement of foreign keys constraints in the SQLite database every time we start the application
        db.get("PRAGMA foreign_keys = ON;");

        console.log(`Connected to the '${SQLITE_FILE_NAME}' SQLite database for development.`);
    });
}


function getAllSamples()
{
    return new Promise(function(resolve, reject)
    {
        db.serialize(function()
        {
            // note the backticks ` which allow us to write a multiline string
            const sql =
                `SELECT id, tbd 
                 FROM samples;`;

            let listOfSamples = []; // initialize an empty array

            // print table header
            printTableHeader(["id", "tbd"]);

            const callbackToProcessEachRow = function(err, row)
            {
                if (err)
                {
                    reject(err);
                }

                // extract the values from the current row
                const id = row.id;
                const tbd = row.tbd;

                // print the results of the current row
                console.log(util.format("| %d | %s |", id, tbd));

                const sampleForCurrentRow = {
                    id: id,
                    tbd: tbd
                };

                // add a new element sampleForCurrentRow to the array
                listOfSamples.push(sampleForCurrentRow);
            };

            const callbackAfterAllRowsAreProcessed = function()
            {
                resolve(listOfSamples);
            };

            db.each(sql, callbackToProcessEachRow, callbackAfterAllRowsAreProcessed);
        });
    });
}

function getPostWithId(id)
{
    return new Promise(function(resolve, reject)
    {
        db.serialize(function()
        {
            const sql =
                `SELECT id, username, postBody, timestamp, likes
                 FROM user_posts
                 WHERE id = ?;`;

            function callbackAfterReturnedRowIsProcessed(err, row)
            {
                if (err)
                {
                    reject(err);
                }

                if (row === undefined)
                {
                    resolve(null);
                    return;
                }

                const id = row.id;
                const username = row.username;
                const postBody = row.postBody;
                const timestamp = row.timestamp;
                const likes = row.likes;

                const postForCurrentRow =
                    {
                        id: id,
                        username: username,
                        postBody: postBody,
                        timestamp: timestamp,
                        likes: likes
                    };

                    resolve(postForCurrentRow);
            }

            db.get(sql, [id], callbackAfterReturnedRowIsProcessed);
        });
    });
}

function getAllPosts(toggle)
{
    return new Promise(function(resolve, reject)
    {
        db.serialize(function()
        {
            // defaults descending order, newest to oldest
            // toggles ascending order, oldest to newest
            let order = toggle === "true" ? "ASC" : "DESC";
            const sql =
                `SELECT id, username, postBody, timestamp, likes
                 FROM user_posts
                 ORDER BY timestamp ${order};`;

            let listOfPosts = [];

            printTableHeader(["id", "username", "postBody", "timestamp", "likes"]);

            const callbackToProcessEachRow = function (err, row)
            {
                if(err)
                {
                    reject(err);
                }

                const id = row.id;
                const username = row.username;
                const postBody = row.postBody;
                const timestamp = row.timestamp;
                const likes = row.likes;

                console.log(util.format("| %d | %s | %s | %s| %d |", id, username, postBody, timestamp, likes));

                const postForCurrentRow = {
                    id: id,
                    username: username,
                    postBody: postBody,
                    timestamp: timestamp,
                    likes: likes
                };

                // add a new element postForCurrentRow to the array
                listOfPosts.push(postForCurrentRow);
            };

            const callbackAfterAllRowsAreProcessed = function ()
            {
                resolve(listOfPosts);
            };

            db.each(sql, callbackToProcessEachRow, callbackAfterAllRowsAreProcessed);
        });
    });
}

function addNewPost(newPost)
{
    return new Promise(function(resolve, reject)
    {
        db.serialize(function()
        {
            const sql =
                `INSERT INTO user_posts (username, postBody, timestamp, likes) 
                 VALUES (?, ?, ?, ?);`;

            function callbackAfterReturnedRowIsProcessed(err, row)
            {
                if (err)
                {
                    reject(err);
                }

                const numberOfRowsAffected = this.changes;
                if (numberOfRowsAffected > 0)
                {
                    const generatedIdForTheNewlyInsertedPost = this.lastID;

                    console.log("SUCCESSFULLY inserted a new post with id = " + generatedIdForTheNewlyInsertedPost);

                    newPost.id = generatedIdForTheNewlyInsertedPost;

                    resolve(newPost);
                }
            }

            // execute the sql prepared statement
            // and return the id of the newly created class
            db.run(sql, [newPost.username, newPost.postBody, newPost.timestamp, newPost.likes], callbackAfterReturnedRowIsProcessed);
        });
    });
}

function updateExistingPostInformation(postToUpdate)
{
    return new Promise(function(resolve, reject)
    {
        db.serialize(function()
        {
            const sql =
                `UPDATE user_posts
                 SET postBody = ?
                 WHERE id = ?;`;

            function callbackAfterReturnedRowIsProcessed(err, row)
            {
                if (err)
                {
                    reject(err);
                }

                const numberOfRowsAffected = this.changes;
                if (numberOfRowsAffected > 0)
                {
                    console.log("SUCCESSFULLY updated the post with id " + postToUpdate.id);

                    resolve(postToUpdate);
                }
                else
                {
                    reject("ERROR could not update the post with id = " + postToUpdate.id);
                }
            }

            db.run(sql, [postToUpdate.postBody, postToUpdate.id], callbackAfterReturnedRowIsProcessed);
        });
    });
}

function getListOfCommentsById(postId)
{
    return new Promise(function(resolve, reject)
    {
        db.serialize(function()
        {
            const sql =
                `SELECT commentId, username, commentBody
                 FROM user_comments
                 WHERE commentId = ?;`;

            let listOfComments = [];

            function callbackToProcessEachRow(err, row)
            {
                if (err)
                {
                    reject(err);
                }

                if (row === undefined)
                {
                    resolve(null);
                    return;
                }

                const commentId = row.commentId;
                const username = row.username;
                const commentBody = row.commentBody;

                const commentForCurrentRow =
                    {
                        commentId: commentId,
                        username: username,
                        commentBody: commentBody
                    };

                listOfComments.push(commentForCurrentRow);
            };

            const callbackAfterReturnedRowIsProcessed = function ()
            {
                resolve(listOfComments);
            }

            db.each(sql, [postId], callbackToProcessEachRow, callbackAfterReturnedRowIsProcessed);
        });
    });
}

function addNewComment(newComment)
{
    return new Promise(function (resolve, reject)
    {
        db.serialize(function()
        {
            const sql =
                `INSERT INTO user_comments (commentId, username, commentBody)
                 VALUES  (?, ?, ?);`;

            function callbackAfterReturnedRowIsProcessed(err, row)
            {
                if (err)
                {
                    reject(err);
                }

                const numberOfRowsAffected = this.changes;
                if (numberOfRowsAffected > 0)
                {
                    console.log("SUCCESSFULLY created a new comment");
                    resolve(newComment);
                }
            }

            db.run(sql, [newComment.commentId, newComment.username, newComment.commentBody], callbackAfterReturnedRowIsProcessed);
        });
    });
}

function printTableHeader(listOfColumnNames)
{
    let buffer = "| ";
    for (const columnName of listOfColumnNames)
    {
        buffer += columnName + " | ";
    }
    console.log(buffer);
    console.log("-".repeat(80));
}


// TODO: export the functions that will be used in other files
// these functions will be available from other files that import this module
module.exports = {
    getAllSamples,
    getAllPosts,
    addNewPost,
    getPostWithId,
    updateExistingPostInformation,
    getListOfCommentsById,
    addNewComment
};
