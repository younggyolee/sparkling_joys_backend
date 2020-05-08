const axios = require('axios');
const qs = require('qs');

exports.getListings = async function(keyword) {
  // Search from eBay up to 100 recently sold listings
  // const now = new Date();
  const url = 'https://svcs.ebay.com/services/search/FindingService/v1?'
  const queryString =
    qs.stringify({
      'OPERATION-NAME': 'findCompletedItems',
      'SERVICE-VERSION': '1.0.0',
      'SECURITY-APPNAME': process.env.EBAY_APP_ID,
      'RESPONSE-DATA-FORMAT': 'JSON',
      'GLOBAL-ID': 'EBAY-US', // Sets response currency in USD
      'outputSelector(0)': 'PictureURLLarge',
      'outputSelector(1)': 'PictureURLSuperSize'
    }) +
    '&REST-PAYLOAD&' +
    qs.stringify({
      keywords: keyword,
      'itemFilter(0).name': 'Condition',
      'itemFilter(0).value(0)': 3000, // Used
      'itemFilter(0).value(1)': 4000, // Very Good
      'itemFilter(0).value(2)': 5000, // Good
      'itemFilter(0).value(3)': 6000, // Acceptable
      'itemFilter(1).name': 'SoldItemsOnly',
      'itemFilter(1).value(0)': true,
      // 'itemFilter(2).name': 'EndTimeFrom',
      // 'itemFilter(2).value(0)': new Date(now.setMonth(now.getMonth() - 1)).toISOString(),
    });
  let result;
  try {
    result = await axios.get(url + queryString);
  } catch (err) {
    console.log(err);
  }

  // Extract necessary information
  let listings = result.data.findCompletedItemsResponse[0].searchResult[0].item || [];
  listings = listings.map(item => {
    return {
      ebayItemId: item.itemId[0],
      title: item.title[0],
      url: item.viewItemURL[0],
      price: item.sellingStatus[0].convertedCurrentPrice[0].__value__,
      priceCurrency: item.sellingStatus[0].convertedCurrentPrice[0]['@currencyId'],
      imageURL: (item.pictureURLLarge && item.pictureURLLarge[0]) || '',
      endTime: item.listingInfo[0].endTime[0]
    };
  });
  const currency = listings.length ? listings[0].priceCurrency : '';

  // Filter some irrelevant listings
  listings = listings.filter(
    listing => !listing.title.toLowerCase().includes('only')
  );

  return {
    listings,
    currency
  };
};
