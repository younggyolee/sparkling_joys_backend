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
    const translatedKeyword = await googleTranslateApi.translate('en', req.params.keyword);
    const { listings, currency } = await ebayApi.getListings(translatedKeyword);

    // calculate avg price
    const sum = listings.reduce((accumulator, item) => {
      return accumulator + Number(item.price);
    }, 0);
    const price = Math.round(sum / listings.length);

    // get image URL
    let imageURL = '';
    for (let i = 0; i < listings.length; i++) {
      if (listings[i].imageURL) {
        imageURL = listings[i].imageURL;
        break;
      }
    }

    // Save the item to DB
    await client.query(
      `INSERT INTO items (
        id,
        user_id,
        title,
        description,
        category_id,
        category_name,
        price,
        price_currency,
        price_last_update_time,
        creation_time,
        image_url,
        is_owned
      )
      VALUES (
        '${uuidv4()}',
        '${req.sessionID}',
        '${req.params.keyword}',
        '', -- description
        '', -- category_id
        '', -- category_name
        ${ price ? `${price}` : 'NULL' },
        '${currency}',
        '${new Date().toISOString()}',
        '${new Date().toISOString()}',
        '${imageURL}',
        true
      );`
    );
    await client.end();
    res.status(200).end();
  } catch (err) {
    console.log('Error while adding guest item.\n', err);
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
    const items = await client.query(
      `SELECT id,
              title,
              price,
              price_currency AS "priceCurrency",
              image_url AS "imageURL",
              creation_time AS "creationTime"
       FROM items
       WHERE user_id='${req.sessionID}'
       ORDER BY creation_time`
    );
    const totalValue = await client.query(
      `SELECT SUM(price) AS sum
       FROM items
       WHERE user_id = '${req.sessionID}'`
    );
    // console.log(totalValue.rows[0].sum);
    await client.end();
    res.status(200).json({
      items: items.rows,
      totalValue: totalValue.rows[0].sum
    });
  } catch (err) {
    res.status(500).json({
      result: 'error',
      error: {
        'message': 'Internal Server Error while getting items'
      }
    });
    next(err);
  }
};

exports.deleteGuestItem = async function(req, res, next) {
  try {
    const client = new Client();
    await client.connect();
    await client.query(
      `DELETE FROM items WHERE id='${req.params.itemId}'`
    );
    await client.end();
    res.status(200).end();
  } catch (err) {
    // res.status(500).end();
    console.log('Error while deleting guest item.\n', err);
    next(err);
  }
};

exports.updateGuestItem = async function(req, res, next) {
  console.log('updating guest item price');
  try {
    const client = new Client();
    await client.connect();
    if (req.body.type === 'price') {
      await client.query(
        `UPDATE items
         SET price=${req.body.price},
             price_currency='${req.body.priceCurrency}'
         WHERE id='${req.params.itemId}'`
      );
    } else if (req.body.type === 'imageURL') {
      const client = new Client();
      await client.connect();
      await client.query(
        `UPDATE items
         SET image_url='${req.body.imageURL}'
         WHERE id='${req.params.itemId}'`
      );
    }
    await client.end();
    res.status(200).end();
  } catch (err) {
    console.log('Error while updating guest item.\n', err);
    next(err);
  }
};
