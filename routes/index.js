var express = require('express');
var router = express.Router();

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

/* GET home page. */
router.get('/', async function(req, res, next) {
  const keyword = 'vortex+race3';
  const url = `https://www.ebay.com/sch/i.html?_nkw=${keyword}&rt=nc&LH_Sold=1&LH_Complete=1`;
  const { data } = await axios(url).catch((err) => console.log(err));
  const $ = cheerio.load(data);
  // console.log($.text());
  console.log($('.s-item__price').text());
  
  res.render('index', { title: 'Express' });
});

module.exports = router;
