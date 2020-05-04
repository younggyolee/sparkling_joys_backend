const ebayApi = require('../utils/ebayApi');
const googleTranslateApi = require('../utils/googleTranslateApi');
const { Client } = require('pg');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

const SIGNUP_TYPES = {
  EMAIL: 'email',
  GUEST: 'guest'
};

exports.addGuestItem = async function(req, res, next) {
  try {
    await addItem(req.sessionID, req.params.keyword, SIGNUP_TYPES.GUEST);
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

exports.addUserItem = async function(req, res, next) {
  try {
    await addItem(req.user.id, req.params.keyword, SIGNUP_TYPES.EMAIL);
    res.status(200).json({
      result: 'ok'
    });
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
    const items = await getItems(client, req.sessionID);
    const totalValue = await getTotalValue(client, req.sessionID);
    await client.end();
    res.status(200).json({
      items,
      totalValue
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

exports.getUserItems = async function(req, res, next) {
  try {
    const client = new Client();
    await client.connect();
    const items = await getItems(client, req.user.id);
    const totalValue = await getTotalValue(client, req.user.id);
    await client.end();
    res.status(200).json({
      items,
      totalValue
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
    await deleteItem(client, req.params.itemId);
    await client.end();
    res.status(200).end();
  } catch (err) {
    console.log('Error while deleting guest item.\n', err);
    next(err);
  }
};

exports.deleteUserItem = async function(req, res, next) {
  try {
    const client = new Client();
    await client.connect();
    await deleteItem(client, req.userId);
    await client.end();
    res.status(200).end();
  } catch (err) {
    console.log('Error while deleting guest item.\n', err);
    next(err);
  }
};

exports.updateGuestItem = async function(req, res, next) {
  try {
    const client = new Client();
    await client.connect();
    if (req.body.type === 'price') {
      await updateItemPrice(
        client,
        req.params.itemId,
        req.body.price,
        req.body.priceCurrency
      );
    } else if (req.body.type === 'imageURL') {
      await updateItemImageURL(
        client,
        req.params.itemId,
        req.body.imageURL
      );
    }
    await client.end();
    res.status(200).end();
  } catch (err) {
    console.log('Error while updating guest item.\n', err);
    next(err);
  }
};

async function addItem(userId, keyword, signup_type) {
  const client = new Client();
  await client.connect();
  if (signup_type === SIGNUP_TYPES.GUEST) {
    await client.query(
      `INSERT INTO users (id, name, password, signup_type)
      VALUES ('${userId}', NULL, NULL, 'guest')
      ON CONFLICT DO NOTHING;`
    );
  }

  const translatedKeyword = await googleTranslateApi.translate('en', keyword);
  const { listings, currency } = await ebayApi.getListings(translatedKeyword);

  const sumPrices = listings.reduce((accumulator, item) => {
    return accumulator + Number(item.price);
  }, 0);
  const avgPrice = Math.round(sumPrices / listings.length);

  let imageURL = '';
  for (let i = 0; i < listings.length; i++) {
    if (listings[i].imageURL) {
      imageURL = listings[i].imageURL;
      break;
    }
  }

  const itemId = uuidv4();
  await saveItemToDB(
    client,
    itemId,
    userId,
    keyword,
    avgPrice,
    currency,
    imageURL
  );
  await saveListingsToDB(client, itemId, listings);
  await client.end();
}

async function saveListingsToDB(client, itemId, listings) {
  for (listing of listings) {
    await client.query(
      `INSERT INTO listings (
        id,
        item_id,
        end_date,
        title,
        source,
        price,
        price_currency_code,
        url,
        image_url
      )
      VALUES (
        '${uuidv4()}',
        '${itemId}',
        '${listing.endTime}',
        '${listing.title}',
        'ebay',
        ${listing.price},
        '${listing.priceCurrency}',
        '${listing.url}',
        '${listing.imageURL}'
      );`
    );
  }
}


async function saveItemToDB(client, id, userId, keyword, price, currency, imageURL) {
  const now = new Date().toISOString();
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
      '${id}',
      '${userId}',
      '${keyword}',
      '', -- description
      '', -- category_id
      '', -- category_name
      ${ price ? `${price}` : 'NULL' },
      '${currency}',
      '${now}',
      '${now}',
      '${imageURL}',
      true
    );`
  );
}


async function getItems(client, userId) {
  const { rows } = await client.query(
    `SELECT id,
            title,
            price,
            price_currency AS "priceCurrency",
            image_url AS "imageURL",
            creation_time AS "creationTime"
     FROM items
     WHERE user_id='${userId}'
     ORDER BY creation_time`
  );
  return rows;
}

async function getTotalValue(client, userId) {
  const { rows } = await client.query(
    `SELECT SUM(price) AS sum
    FROM items
    WHERE user_id = '${userId}'`
  );
  return rows[0].sum;
}

async function deleteItem(client, itemId) {
  await client.query(
    `DELETE FROM items WHERE id='${itemId}'`
  );
}

async function updateItemPrice(client, itemId, price, priceCurrency) {
  await client.query(
    `UPDATE items
      SET price=${price},
          price_currency='${priceCurrency}'
      WHERE id='${itemId}'`
  );
}

async function updateItemImageURL(client, itemId, imageURL) {
  await client.query(
    `UPDATE items
     SET image_url='${imageURL}'
     WHERE id='${itemId}'`
  );
}
