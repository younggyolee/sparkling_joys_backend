const qs = require('qs');
const axios = require('axios');
const ebayApi = require('../utils/ebayApi');
const googleTranslateApi = require('../utils/googleTranslateApi');
const { Client } = require('pg');
const { v4: uuidv4 } = require('uuid');

exports.addGuestItem = async function(req, res, next) {
  try {
    // Save guest user to [users] table, if not exist
    const client = new Client();
    await client.connect();
    await client.query(
      `INSERT INTO users
       VALUES ('${req.sessionID}', NULL, NULL, 'guest')
       ON CONFLICT DO NOTHING;`
    );

    // Get average price and related listings from eBay API
    const translatedKeyword = await googleTranslateApi.translateText(
      'en',
      req.params.keyword
    );
    const {
      listings,
      avgPrice,
      imageURL,
      currency 
    } = await ebayApi.getAvgPrice(translatedKeyword);

    // Save the item to DB
    await client.query(
      `INSERT INTO items (
        id,
        user_id,
        title,
        description,
        category_id,
        category_name,
        price_usd,
        price_last_updated,
        image_url
      )
      VALUES (
        '${uuidv4()}',
        '${req.sessionID}',
        '${req.params.keyword}',
        '', -- description
        '', -- category_id
        '', -- category_name
        '${avgPrice}',
        '${new Date().toISOString()}',
        '${imageURL}'
      );`
    );
    await client.end();

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
    next(err);
  }
};

exports.getGuestItems = async function(req, res, next) {
  try {
    const client = new Client();
    await client.connect();
    const result = await client.query(
      `SELECT * FROM items WHERE user_id='${req.sessionID}'`
    );
    await client.end();
    console.log(result.rows);
    res.status(200).json(result.rows);
  } catch (err) {
    // console.log('Error while getting items for guest', err);
    next(err);
  }
};
