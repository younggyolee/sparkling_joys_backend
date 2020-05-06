const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { Client } = require('pg');
const { v4: uuidv4 } = require('uuid');

router.post('/', (req, res, next) => {
  if (!req.body.username.length) {
    return next('Username is empty');
  }

  if (req.body.password.length < 6) {
    return next('Password length is too short.');
  }

  const saltRounds = Number(process.env.SALT_ROUNDS);
  bcrypt.hash(req.body.password, saltRounds, async function(err, hash) {
    try {
      const client = new Client();
      await client.connect();
      const user = await client.query(`
        SELECT id
        FROM users
        WHERE name='${req.body.username}'
      `);
      if (user.rows[0]) {
        res.status(409).json({
          result: 'error',
          message: 'Username already exists.'
        })
        return;
      }

      await client.query(
        `INSERT INTO users (
          id,
          name,
          password,
          signup_type
        )
        VALUES (
          '${uuidv4()}',
          '${req.body.username}',
          '${hash}',
          'email'
        );`
      );
      await client.end();
      res.status(200).json({
        result: 'ok'
      });
    } catch (err) {
      console.log('Error occured while creating a user: \n', err);
      next(err);
    }
  });
});

module.exports = router;
