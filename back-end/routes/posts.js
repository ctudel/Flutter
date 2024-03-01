let express = require('express');
let router = express.Router();
const db = require("./../db");


/**
 * http://localhost:8080/posts
 * GET /posts
 * with the following parameters:
 *      toggle (case-sensitive)
 *
 * @return a list of posts (extracted from the user_post table in the database) as JSON
 */
router.get("/posts", async function (req, res)
{
    try
    {
        // OPTIONAL, calling GET with no parameters is valid
        // this will change the order lists are retrieved
        const toggle = req.body.toggle;
        const listOfPosts = await db.getAllPosts(toggle);
        console.log("listOfPosts:", listOfPosts);

        // this automatically converts the array of posts to JSON and returns it to the client
        res.send(listOfPosts);
    }
    catch (err)
    {
        console.error("Error:", err.message);
        res.status(500).json({ "error": "Internal Server Error" });
    }
});


/**
 * http://localhost:8080/posts
 * POST /posts
 * with the following parameters:
 *      username
 *      postBody
 *      timestamp
 *      likes
 *
 * The parameters passed in the body of the POST request are used to create a new post
 * The new post is inserted into the user_posts table in the database
 *
 * @return the created post (which was inserted into the database) as JSON
 */
router.post("/posts", async function (req, res)
{
    const currentDate = new Date().toLocaleString();

    try
    {
        const username = req.body.username;
        const postBody = req.body.postBody;
        const timestamp = currentDate;
        const likes = 0; // default likes is 0

        console.log("username  = " + username);
        console.log("postBody  = " + postBody);
        console.log("timestamp = " + timestamp);
        console.log("likes     = " + likes);

        if (username === undefined || username == "")
        {
            res.status(400).json({"error": "bad request: expected parameter username is not defined"});
            return;
        }

        if (postBody === undefined || postBody == "")
        {
            res.status(400).json({"error": "bad request: expected parameter postBody is not defined"});
            return;
        }

        let createdPost =
            {
                id: null,
                username: username,
                postBody: postBody,
                timestamp: timestamp,
                likes: likes
            };

        createdPost = await db.addNewPost(createdPost);

        res.status(200).json(createdPost);
    }
    catch (error)
    {
        console.error("error: " + error.message);
        res.status(422).json({"error": "failed to add new post to the database"});
    }
});

router.patch('/posts/:id', async function (req, res)
{
    try
    {
        const id = req.params.id;
        const postBody = req.body.postBody;

        console.log("id        = " + id);
        console.log("postBody  = " + postBody);

        let postToUpdate = await db.getPostWithId(id);
        console.log({postToUpdate});

        if (postToUpdate == null)
        {
            console.log("No post with id " + id + " exists.");

            res.status(404).json({"error": "failed to update the post with id " + id + " in the database because it does not exist"});
            return;
        }

        if (postBody != null)
        {
            postToUpdate.postBody = postBody;
        }

        await db.updateExistingPostInformation(postToUpdate);
        res.json(postToUpdate);
    }
    catch (error)
    {
        console.error("error: " + error.message);
        res.status(422).json({"error": "failed to update the post with id = " + req.params.id + " in the database"})
    }
});

module.exports = router;
