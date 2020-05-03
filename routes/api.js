const express = require('express');
const router = require('express').Router();
const apiController = require('./controllers/api.controller');
const { authorization } = require('../middlewares/authorization');

router.post('/guest/items/:keyword', apiController.addGuestItem);
router.get('/guest/items/', apiController.getGuestItems);
router.delete('/guest/items/:itemId', apiController.deleteGuestItem);
router.put('/guest/items/:itemId', apiController.updateGuestItem);

router.post('/users/:userId/items/:keyword', apiController.addUserItem);
router.get('/users/:userId/items', authorization, apiController.getUserItems);

module.exports = router;
