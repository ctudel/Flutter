const app = require('./app');

const PORT = 8080;

// Start the web server
app.listen(PORT, function ()
{
    console.log("Starting the TBDSampleApplication: Node API Server...");
    console.log(`The server will listen on port ${PORT}...`);
    console.log("In a browser, open the URL:");
    console.log("    http://localhost:8080/samples");
    console.log("to see a list of samples in JSON format.");
});
