const passport = require('passport');
const Strategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const { Client } = require('pg');

passport.use(new Strategy(
  async function(username, password, cb) {
    try {
      const client = new Client();
      await client.connect();
      const result = await client.query(
        `SELECT *
         FROM users
         WHERE name='${username}'`
      );
      const user = result.rows[0];
      await client.end();
      if (!user) return cb(null, false);
      const match = await bcrypt.compare(password, user.password);
      if (!match) return cb(null, false);
      return cb(null, user);
    } catch (err) {
      return cb(err);
    }
  })
);

passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(async function(id, cb) {
  try {
    const client = new Client();
    await client.connect();
    const result = await client.query(
      `SELECT *
        FROM users
        WHERE id='${id}'`
    );
    await client.end();
    const user = result.rows[0];
    cb(null, user);
  } catch (err) {
    cb(err);
  }
});
