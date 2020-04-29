const qs = require('qs');
const axios = require('axios');
const ebayApi = require('../utils/ebayApi');
const googleTranslateApi = require('../utils/googleTranslateApi');
// const { Pool } = require('pg');

exports.guestAddItem = async function(req, res, next) {
  try {    
    const translatedKeyword = await googleTranslateApi.translateText(
      'en',
      req.params.keyword
    );
    const { items, avgPrice } = await ebayApi.getAvgPriceForKeyword(translatedKeyword);
    res.status(200).json({
      result: 'ok',
      avgPrice,
      translatedKeyword,
      items
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



// const pool = new Pool({
//   user: process.env.DB_USER,
//   host: process.env.DB_HOST,
//   database: process.env.DB_DATABASE,
//   password: process.env.DB_PASSWORD,
//   port: process.env.DB_PORT
// });

// try {
//   const users = await pool.query('CREATE TABLE users (ID int);');
//   console.log(users);
// } catch (err) {
//   console.log(err);
// }
// return OK state