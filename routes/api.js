const router = require('express').Router();
const apiController = require('./controllers/api.controller');
const { authorization } = require('../middlewares/authorization');

router.post('/guest/items/:keyword', apiController.addGuestItem);
router.get('/guest/items/', apiController.getGuestItems);
router.delete('/guest/items/:itemId', apiController.deleteGuestItem);
router.put('/guest/items/:itemId', apiController.updateGuestItem);
router.put('/guest/items/:itemId/isOwned', apiController.updateGuestItemIsOwned);

router.post('/users/:userId/items/:keyword', apiController.addUserItem);
router.get('/users/:userId/items', authorization, apiController.getUserItems);
router.delete('/users/:userId/items/:itemId', apiController.deleteUserItem);
router.put('/users/:userId/items/:itemId', apiController.updateUserItem);
router.put('/guest/items/:itemId/isOwned', apiController.updateUserItemIsOwned);

router.get('/items/:itemId/avg-price-daily', apiController.getAvgPriceDaily);
router.get('/items/:itemId/details', apiController.getItemDetails);

router.get('/user', apiController.getUser);

module.exports = router;
