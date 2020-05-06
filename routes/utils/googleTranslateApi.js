const { Translate } = require('@google-cloud/translate').v2;
const translate = new Translate({
  projectId: process.env.GOOGLE_APPLICATION_CREDENTIALS
});

exports.translate = async function(
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
