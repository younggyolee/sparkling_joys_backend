const qs = require('qs');
const axios = require('axios');
const ebayApi = require('../utils/ebayApi');
const googleTranslateApi = require('../utils/googleTranslateApi');

exports.guestAddItem = async function(req, res, next) {
  // check on session
  console.log('req.session', req.session);
  console.log('req.sessionID', req.sessionID);

  try {    
    const translatedKeyword = await googleTranslateApi.translateText(
      'en',
      req.params.keyword
    );

    const { listings, avgPrice, imageURL, currency } = await ebayApi.getAvgPrice(translatedKeyword);
    res.status(200).json({
      result: 'ok',
      avgPrice,
      translatedKeyword,
      listings,
      imageURL,
      currency
    });
  } catch (err) {
    res.status(500).json({
      result: 'error',
      error: {
        'message': 'Internal Server Error while getting average price for a keyword'
      }
    });
  }
};
