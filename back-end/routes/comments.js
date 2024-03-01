let express = require('express');
let router = express.Router();
const db = require('./../db');

/**
 * http://localhost:8080/comments/id
 * GET /comments/id
 * with the following parameters:
 *      id (of a post)
 *
 * @return a list of comments for a particular post (extracted from the user_post table in the database) as JSON
 */
router.get("/comments/:id", async function (req, res)
{
    try
    {
        const postId = req.params.id;

        console.log("postId: " + postId);

        if (postId === undefined)
        {
            res.status(400).json({"error": "bad request, expected parameter postId is not defined"});
            return;
        }

        const listOfComments = await db.getListOfCommentsById(postId);

        res.status(200).json(listOfComments);
    }
    catch (err)
    {
        console.error("Error:", err.message);
        res.status(500).json({"error": "Internal server error"});
    }
})

/**
 * POST /classes
 * with the following form parameters:
 *      id
 *      username
 *      commentBody
 *
 * The parameters passed in the body of the POST request are used to create a new comment.
 * The new comment is inserted into the comments table in the database.
 *
 * @return the created comment (which was inserted into the database), as JSON
 */
router.post("/comments", async function (req, res)
{
    try
    {
        const commentId = req.body.commentId;
        const username = req.body.username;
        const commentBody = req.body.commentBody;

        console.log("commentId   = " + commentId);
        console.log("username    = " + username);
        console.log("commentBody = " + commentBody);

        if (commentId === undefined) {
            res.status(400).json({"error": "bad request: expected parameter 'commentId' is not defined"});
            return;
        }
        if (username === undefined) {
            res.status(400).json({"error": "bad request: expected parameter 'username' is not defined"});
            return;
        }
        if (commentBody === undefined) {
            res.status(400).json({"error": "bad request: expected parameter 'commentBody' is not defined"});
            return;
        }

        let createdComment = {
            commentId: commentId,
            username: username,
            commentBody: commentBody
        };

        createdComment = await db.addNewComment(createdComment);

        res.status(201).json(createdComment);
    }
    catch (err)
    {
        console.error("Error:", err.message);
        res.status(422).json({"error": "failed to add new comment to the database"});
    }
});

module.exports = router;