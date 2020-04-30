const qs = require('qs');
const axios = require('axios');
const { Translate } = require('@google-cloud/translate').v2;
const translate = new Translate();

exports.translateText = async function(
  target,
  text
) {
  try {
    let [translations] = await translate.translate(text, target);
    translations = Array.isArray(translations) ? translations : [translations];
    return translations[0];
  } catch (err) {
    console.log('Error while translating', err);
  }
};
