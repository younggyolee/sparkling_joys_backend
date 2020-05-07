const puppeteer = require('puppeteer');

exports.getImageForKeyword = async function(keyword) {
  console.log('bing bot turned on!');
  const browser = await puppeteer.launch({
    headless: false
  });
  const page = await browser.newPage();
  await page.goto('https://www.bing.com/image', { waitUntil: 'networkidle2' });

  await page.type('#sb_form_q', keyword);

  const searchButtonSelector = 'label[for="sb_form_go"]';
  await page.waitForSelector(searchButtonSelector);
  await page.click(searchButtonSelector);

  const imageSelector = '.mimg';
  await page.waitFor(2000 + Math.random() * 1000);  
  const images = await page.$$eval(
    imageSelector,
    imgs => imgs.map(img => img.getAttribute('src'))
  );
  console.log(images);
  await browser.close();
  return images[0];
};
