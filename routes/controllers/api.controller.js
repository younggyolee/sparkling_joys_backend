const ebayApi = require('../utils/ebayApi');
const googleTranslateApi = require('../utils/googleTranslateApi');
const bingBot = require('../utils/bingBot');
const { Client } = require('pg');
const { v4: uuidv4 } = require('uuid');

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
    const totalCost = await getTotalCost(client, req.sessionID);
    await client.end();
    res.status(200).json({
      items,
      totalValue,
      totalCost
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
    const totalCost = await getTotalCost(client, req.sessionID);
    await client.end();
    res.status(200).json({
      items,
      totalValue,
      totalCost
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
    res.status(200).json({
      result: 'ok'
    });
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
    await updateItem(
      client,
      req.params.itemId,
      req.body.title,
      req.body.price,
      req.body.imageURL,
      req.body.description,
      req.body.isOwned
    );
    await client.end();
    res.status(200).end();
  } catch (err) {
    console.log('Error while updating guest item.\n', err);
    next(err);
  }
};

exports.updateUserItem = async function(req, res, next) {
  try {
    const client = new Client();
    await client.connect();
    await updateItem(
      client,
      req.params.itemId,
      req.body.title,
      req.body.price,
      req.body.imageURL,
      req.body.description
    );
    await client.end();
    res.status(200).json({
      result: 'ok'
    });
  } catch (err) {
    console.log('Error while updating guest item.\n', err);
    next(err);
  }
};

exports.getItemDetails = async function(req, res, next) {
  try {
    const client = new Client();
    await client.connect();
    const { listings, item } = await getItemDetails(
      client,
      req.params.itemId
    );
    await client.end();
    res.status(200).json({
      listings,
      item: item[0]
    });
  } catch (err) {
    console.error('Error while getting guest item details.\n', err);
    err.status = 500;
    next(err);
  }
};

exports.getAvgPriceDaily = async function(req, res, next) {
  try {
    const client = new Client ();
    await client.connect();
    const { rows } = await client.query(
      `SELECT end_date AS "endDate", avg(price) AS "avgPrice"
       FROM listings
       WHERE item_id = '${req.params.itemId}'
       GROUP BY end_date
       ORDER BY end_date`
    );
    res.status(200).json({
      avgPriceDaily: rows
    });
    await client.end();
  } catch (err) {
    console.error('Error while getting getting daily average price for an item.\n', err);
    err.status = 500;
    next(err);
  }
};

// exports.getImageForKeyword = async function(req, res, next) {
//   try {
//     const imgSrc = await googleBot.getImageForKeyword(req.params.keyword);
//     if (imgSrc) {
//       res.status(200).json({
//         result: 'ok',
//         imgSrc
//       });
//     } else {
//       throw new Error
//     }
//   } catch (err) {
//     err.status = 200;
//     err.message = 'Error while getting image for keyword';
//     next(err);
//   }
// };

exports.getUser = async function(req, res, next) {
  if (req.user === undefined) {
    res.json({});
  } else {
    res.json({
      userId: req.user.id,
      username: req.user.name
    })
  }
};

async function getItemDetails(client, itemId) {
  const listings = await client.query(
    `SELECT title, end_date AS "endDate", price,
            price_currency AS "priceCurrency", source, url,
            image_url AS "imageURL"
     FROM listings
     WHERE item_id='${itemId}'
     ORDER BY end_date DESC`
  );

  const item = await client.query(
    `SELECT id, user_id AS "userId", title, description,
            category_id AS "categoryId",
            category_name AS "categoryName", price,
            price_currency AS "priceCurrency", 
            price_last_update_time AS "priceLastUpdateTime",
            creation_time AS "creationTime",
            image_url AS "imageURL",
            is_owned AS "isOwned"
     FROM items
     WHERE id='${itemId}'`
  );

  return {
    listings: listings.rows,
    item: item.rows
  };
}

async function addItem(userId, keyword, signup_type) {
  const client = new Client();
  await client.connect();
  if (signup_type === SIGNUP_TYPES.GUEST) {
    await client.query(
      `INSERT INTO users (id, name, password, signup_type)
       VALUES            ('${userId}', NULL, NULL, 'guest')
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
  try {
    imageURL = await bingBot.getImageForKeyword(keyword);
  } catch (err) {
    console.log('Error while trying bing bot to fetch image.\n', err);
  }

  if (!imageURL) {
    // Extract from the first available image from eBay listings
    for (let i = 0; i < listings.length; i++) {
      if (listings[i].imageURL) {
        imageURL = listings[i].imageURL;
        break;
      }
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
        price_currency,
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
    `SELECT id, title, price,
            price_currency AS "priceCurrency",
            image_url AS "imageURL",
            creation_time AS "creationTime",
            is_owned AS "isOwned"
     FROM items
     WHERE user_id='${userId}'
     ORDER BY creation_time DESC`
  );
  return rows;
}

async function getTotalValue(client, userId) {
  const { rows } = await client.query(
    `SELECT SUM(price) AS sum
    FROM items
    WHERE user_id = '${userId}'
      AND is_owned=true
    `
  );
  return rows[0].sum;
}

async function getTotalCost(client, userId) {
  const { rows }  = await client.query(
    `SELECT SUM(price) AS sum
    FROM items
    WHERE user_id = '${userId}'
      AND is_owned=false
    `
  );
  return rows[0].sum;
}

async function deleteItem(client, itemId) {
  await client.query(
    `DELETE FROM items WHERE id='${itemId}'`
  );
}

async function updateItem(client, itemId, title, price, imageURL, description, isOwned) {
  let query = 'UPDATE items SET ';
  const setColumns = [];
  if (title) setColumns.push(`title='${title}'`);
  if (price) setColumns.push(`price=${Number(price)}`);
  if (imageURL) setColumns.push(`image_url='${imageURL}'`);
  if (description) setColumns.push(`description='${description}'`);
  if (isOwned !== undefined) setColumns.push(`is_owned=${isOwned}`);
  query += setColumns.join(',');
  query += ` WHERE id='${itemId}';`
  console.log('query', query);
  await client.query(query);
}
