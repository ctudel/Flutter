let express = require('express');
let router = express.Router();
const db = require("./../db");


/**
 * http://localhost:8080/samples
 * GET /samples
 *
 * @return a list of samples (extracted from the samples table in the database) as JSON
 */
router.get("/samples", async function (req, res)
{
    try
    {
        const listOfSamples = await db.getAllSamples();
        console.log("listOfSamples:", listOfSamples);

        // this automatically converts the array of samples to JSON and returns it to the client
        res.send(listOfSamples);
    }
    catch (err)
    {
        console.error("Error:", err.message);
        res.status(500).json({ "error": "Internal Server Error" });
    }
});


module.exports = router;
