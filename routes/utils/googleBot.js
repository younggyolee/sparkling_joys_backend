const puppeteer = require('puppeteer');

exports.getImageForKeyword = async function(keyword) {
  console.log('google bot turned on!');
  const browser = await puppeteer.launch({});
  const page = await browser.newPage();
  await page.goto('https://www.google.com/imghp?hl=en', { waitUntil: 'networkidle2' });

  await page.type('input[title="Search"]', keyword);

  const searchButtonSelector = 'button[aria-label="Google Search"]';
  await page.waitForSelector(searchButtonSelector);
  await page.waitFor(500 + Math.random() * 1000);
  await page.click(searchButtonSelector);

  const firstImageSelector = 'img[alt]:not([alt=""])';
  await page.waitForSelector(firstImageSelector);
  await page.waitFor(500 + Math.random() * 1000);
  await page.click(firstImageSelector);

  const largeImageSelector = 'img[style]:not([style=""])';
  await page.waitFor(500 + Math.random() * 1000);
  await page.screenshot({path: 'google.png'});
  await page.waitForSelector(largeImageSelector);
  await page.waitFor(500 + Math.random() * 1000);
  const imgs = await page.$$eval(largeImageSelector, imgs => imgs.map(img => img.getAttribute('src')));
  await browser.close()

  console.log('imgs', imgs);
  return imgs[0]

  // const imgSrc = imgs.filter(img => img.includes('https://'))[0];
  // return imgSrc;
};
