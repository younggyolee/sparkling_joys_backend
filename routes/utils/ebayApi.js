const axios = require('axios');
const qs = require('qs');

exports.getAvgPriceForKeyword = async function(keyword) {
  // Search from eBay up to 100 recently sold listings
  const now = new Date();
  const url = 'https://svcs.ebay.com/services/search/FindingService/v1?'
  const queryString =
    qs.stringify({
      'OPERATION-NAME': 'findCompletedItems',
      'SERVICE-VERSION': '1.0.0',
      'SECURITY-APPNAME': process.env.APP_ID,
      'RESPONSE-DATA-FORMAT': 'JSON',
      'GLOBAL-ID': 'EBAY-US'
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
  const result = await axios.get(url + queryString);

  // Extract necessary information
  let listings = result.data.findCompletedItemsResponse[0].searchResult[0].item;
  listings = listings.map(item => {
    return {
      itemId: item.itemId[0],
      title: item.title[0],
      itemURL: item.viewItemURL[0],
      itemPrice: item.sellingStatus[0].convertedCurrentPrice[0].__value__,
      itemPriceCurrency: item.sellingStatus[0].convertedCurrentPrice[0]['@currencyId'],
      endTime: item.listingInfo[0].endTime[0]
    };
  });

  // Calculate average
  const sumPrices = listings.reduce((accumulator, item) => {
    return accumulator + Number(item.itemPrice);
  }, 0);
  const avgPrice = Math.round(sumPrices / listings.length);
  return {
    listings,
    avgPrice
  };
};
