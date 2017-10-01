const queryVisionApi         = require('./query-vision-api');
const Episode7 = require('episode-7');

function* sendImageToVisionApi(pvsUrl,
                              imgUrl,
                              modelId,
                              accountId,
                              privateKey,
                              jwtToken) {

  // send image to Vision API
  let visionApiResult = yield Episode7.call(
    queryVisionApi,
    pvsUrl,
    imgUrl,
    modelId,
    accountId,
    privateKey,
    jwtToken
  );
  
  return visionApiResult;
}

module.exports = sendImageToVisionApi;