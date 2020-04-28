const qs = require('qs');
const axios = require('axios');

exports.addItem = async function(req, res, next) {
  // search in eBay using api
  // get 100 per page
  // next page can be accessed using result.data.findCompletedItemsResponse[0].paginationOutput
  const now = new Date();
  const url = 'https://svcs.ebay.com/services/search/FindingService/v1?'
  const queryString =
    qs.stringify({
      'OPERATION-NAME': 'findCompletedItems',
      'SERVICE-VERSION': '1.0.0',
      'SECURITY-APPNAME': process.env.APP_ID,
      'RESPONSE-DATA-FORMAT': 'JSON',
      'GLOBAL-ID': 'EBAY-US' // so that the returned data is in USD currency
    }) +
    '&REST-PAYLOAD&' +
    qs.stringify({
      keywords: req.params.keyword,
      'itemFilter(0).name': 'Condition',
      'itemFilter(0).value(0)': 3000, // Used
      'itemFilter(0).value(1)': 4000, // Very Good
      'itemFilter(0).value(2)': 5000, // Good
      'itemFilter(0).value(3)': 6000, // Acceptable
      'itemFilter(1).name': 'SoldItemsOnly',
      'itemFilter(1).value(0)': true,
      'itemFilter(2).name': 'EndTimeFrom',
      'itemFilter(2).value(0)': new Date(now.setMonth(now.getMonth() - 1)).toISOString(),
    });


  const result = await axios.get(url + queryString);
  console.log(url + queryString);
  console.log(result.data);
  console.log('searchResult', result.data.findCompletedItemsResponse[0].searchResult);
  console.log('paginationOutput', result.data.findCompletedItemsResponse[0].paginationOutput);

  // extract necessary information
  console.log('searchResult[0]', result.data.findCompletedItemsResponse[0].searchResult);
  const rawItems = result.data.findCompletedItemsResponse[0].searchResult[0].item;
  const items = rawItems.map(item => {
    console.log(item);
    return {
      itemId: item.itemId[0],
      title: item.title[0],
      itemURL: item.viewItemURL[0],
      itemPrice: item.sellingStatus[0].convertedCurrentPrice[0].__value__,
      itemPriceCurrency: item.sellingStatus[0].convertedCurrentPrice[0]['@currencyId'],
      endTime: item.listingInfo[0].endTime[0]
    };
  });

  // calculate average
  const sumPrices = items.reduce((accumulator, item) => {
    return accumulator + Number(item.itemPrice);
  }, 0);
  const avgPrice = sumPrices / items.length;
  console.log('avgPrice', avgPrice);
}
