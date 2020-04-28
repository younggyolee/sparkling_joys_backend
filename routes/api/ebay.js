const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const qs = require('qs');

async function getUserToken() {
  // for an initial run,
  // get Younggyo's user token, along with refresh token
  // redirect user to this URL
  const url = `https://auth.sandbox.ebay.com/oauth2/authorize?client_id=${appClientId}&redirect_uri=${appRuName}&response_type=code&scope=${scopeList}`

  const data = {
    client_id: 'Younggyo-sparklin-PRD-caa9faa63-111e6a31',
    redirect_uri: 'sparklingjoys',
    scope: 'https://api.ebay.com/oauth/api_scope/commerce.catalog.readonly'
    // grant_type: 'client_credentials',
    // scope: 'https://api.ebay.com/oauth/api_scope'
  };
  const options = {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic WW91bmdneW8tc3BhcmtsaW4tUFJELWNhYTlmYWE2My0xMTFlNmEzMTpQUkQtYWE5ZmFhNjMwNjdhLWJkOTctNDc0OC1hOTEzLWRkNTI=' // my OAuth credentials, from client_id and client_secret -- this needs to move to .env file. 
    },
    data: qs.stringify(data),
    url: 'https://api.ebay.com/identity/v1/oauth2/token'
  };
  const result = await axios(options);
  const access_token = result.data.access_token;
};

exports.getProductsFromCatalog = async function(req, res, next) {
  res.redirect('https://auth.ebay.com/oauth2/authorize?client_id=Younggyo-sparklin-PRD-caa9faa63-111e6a31&response_type=code&redirect_uri=Younggyo_Lee-Younggyo-sparkl-ptkyl&scope=https://api.ebay.com/oauth/api_scope https://api.ebay.com/oauth/api_scope/sell.marketing.readonly https://api.ebay.com/oauth/api_scope/sell.marketing https://api.ebay.com/oauth/api_scope/sell.inventory.readonly https://api.ebay.com/oauth/api_scope/sell.inventory https://api.ebay.com/oauth/api_scope/sell.account.readonly https://api.ebay.com/oauth/api_scope/sell.account https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly https://api.ebay.com/oauth/api_scope/sell.fulfillment https://api.ebay.com/oauth/api_scope/sell.analytics.readonly https://api.ebay.com/oauth/api_scope/sell.finances https://api.ebay.com/oauth/api_scope/sell.payment.dispute https://api.ebay.com/oauth/api_scope/commerce.identity.readonly');

  // const keyword = 'vortex+race3';
  // const url = `https://www.ebay.com/sch/i.html?_nkw=${keyword}&rt=nc&LH_Sold=1&LH_Complete=1`;
  // const { data } = await axios(url).catch((err) => console.log(err));
  // const $ = cheerio.load(data);
  // // console.log($.text());
  // console.log($('.s-item__price').text());
};


//
// var express = require('express');
// var router = express.Router();
// const { getProductsFromCatalog } = require('./apis/ebay');

// /* GET home page. */
// router.get('/', async function(req, res, next) {
//   const keyword = 'Macbook Pro Late 2013' // req.params.keyword
//   const products = getProductsFromCatalog(req, res, next);

//   res.render('index', { title: 'Express' });
// });

// router.get('/redirect', function(req, res, next) {
//   console.log(req.body);
//   res.render('index', { title: 'Express' });
// });

// module.exports = router;

// exports.getProductsFromListings = async function(req, res, next) {
//   const keyword = 'vortex+race3';
//   const url = `https://www.ebay.com/sch/i.html?_nkw=${keyword}&rt=nc&LH_Sold=1&LH_Complete=1`;
//   const { data } = await axios(url).catch((err) => console.log(err));
//   const $ = cheerio.load(data);
//   // console.log($.text());
//   console.log($('.s-item__price').text());

// };
