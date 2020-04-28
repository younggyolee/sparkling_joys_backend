const express = require('express');
const router = require('express').Router();
const apiController = require('./controllers/api.controller');

router.post('/guest/items/:keyword', apiController.addItem);

module.exports = router;
