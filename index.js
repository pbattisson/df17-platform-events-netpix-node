const jsforce = require('jsforce');
const username = process.env.SFDC_USERNAME;
const password = process.env.SFDC_PASS;
const conn = new jsforce.Connection({});

const Episode7     = require('episode-7');
const oAuthToken   = require('./lib/oauth-token');
const updateToken  = require('./lib/update-token');
const modelId    = process.env.CUSTOM_MODEL_ID;
const jwtToken   = process.env.EINSTEIN_VISION_TOKEN
const pvsUrl = process.env.EINSTEIN_VISION_URL;
const accountId  = process.env.EINSTEIN_VISION_ACCOUNT_ID;
const privateKey = process.env.EINSTEIN_VISION_PRIVATE_KEY;

Episode7.run(updateToken, pvsUrl, accountId, privateKey)
.then(() => {
    conn.login(username, password, function(err, userInfo) {
        if (err) { return console.error(err); }
        conn.streaming.topic("/event/Image_Upload__e").subscribe(function(message) {
            console.dir(message);
          
            Episode7.run(sendImageToVisionApi,
                pvsUrl,
                message.payload["S3_URL__c"],
                modelId,
                accountId,
                privateKey,
                jwtToken)
            .then(function(predictions) {
                console.dir(predictions);
                message.payload["RecordId__c"];
            })
            .catch( error => next(error));
        });
    });
})
.catch(error => {
    console.log(`Failed to start server: ${error.stack}`);
    process.exit(1);
});




