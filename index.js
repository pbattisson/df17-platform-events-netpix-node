const jsforce = require('jsforce');
const username = process.env.SFDC_USERNAME;
const password = process.env.SFDC_PASS;
const conn = new jsforce.Connection({version: '40.0'});

const Episode7     = require('episode-7');
const oAuthToken   = require('./lib/oauth-token');
const updateToken  = require('./lib/update-token');
const sendImageToVisionApi = require('./lib/send-image-to-vision-api');
const modelId    = process.env.CUSTOM_MODEL_ID;
const jwtToken   = process.env.EINSTEIN_VISION_TOKEN;
const pvsUrl = process.env.EINSTEIN_VISION_URL;
const accountId  = process.env.EINSTEIN_VISION_ACCOUNT_ID;
const privateKey = process.env.EINSTEIN_VISION_PRIVATE_KEY;

Episode7.run(updateToken, pvsUrl, accountId, privateKey)
.then(() => {
    conn.login(username, password, function(err, userInfo) {
        if (err) { return console.error(err); }

        console.log('We are listening');
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
                let predictedValues = JSON.parse(predictions);
                console.dir(predictedValues);
                let classifications = [];
                for(let i = 0, len = predictedValues.length; i < len; i++) {
                    console.log(predictedValues[i].label);
                    console.log(predictedValues[i].probability);
                    classifications.push({Classification__c: predictedValues[i].label, Confidence__c: predictedValues[i].probability, Record_Id__c: message.payload["RecordId__c"]});
                }

                console.dir(classifications);
                conn.sobject("Image_Classification__e").create(classifications)
                .then(function(res) {
                    console.dir(res);
                })
                .catch( error => console.error(error));
            })
            .catch( error => console.error(error));
        });
    });
})
.catch(error => {
    console.log(`Failed to start server: ${error.stack}`);
    process.exit(1);
});




