const { Translate } = require('@google-cloud/translate').v2;
const qs = require('qs');
const axios = require('axios');

// exports.detectLanguage = async function(text) {
//   const url = 'https://translation.googleapis.com/language/translate/v2/detect';
//   try {
//     const response = await axios.post(url,
//       { 
//         q: text 
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${process.env.GOOGLE_TRANSLATE_PRINT_ACCESS_TOKEN}`
//         }
//       }
//     );
//     return response.data.data.detections[0][0].language;
//   } catch (err) {
//     console.log('Error while detecting language\n', err);
//   }
// };

exports.translateText = async function(
  targetLanguageCode,
  text
) {
  const url = `https://translation.googleapis.com/language/translate/v2`;
  try {
    const response = await axios.post(url,
      {
        q: [text],
        target: targetLanguageCode
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GOOGLE_TRANSLATE_PRINT_ACCESS_TOKEN}`
        }
      }
    );
    console.log(response.data.data.translations[0].translatedText);
    return response.data.data.translations[0].translatedText;
  } catch (err) {
    console.log('Error while translating keyword using Google Translate API\n', err);
  }
};
