var express = require('express');
var router = express.Router();
// const { getProductsFromCatalog } = require('./apis/ebay');

/* GET home page. */
router.get('/', async function(req, res, next) {
  // const keyword = 'Macbook Pro Late 2013' // req.params.keyword
  // const products = getProductsFromCatalog(req, res, next);

  res.render('index', { title: 'Express' });
});

router.get('/redirect', function(req, res, next) {
  // console.log(req.body);
  res.render('index', { title: 'Express' });
});

module.exports = router;
