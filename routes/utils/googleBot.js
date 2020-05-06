const puppeteer = require('puppeteer');

exports.getImageForKeyword = async function(keyword) {
  const browser = await puppeteer.launch({
    // headless: false
  });
  const page = await browser.newPage();
  await page.goto('https://www.google.com/imghp?hl=en', { waitUntil: 'networkidle2' });
  await page.type('input[title="Search"]', keyword);
  const searchButtonSelector = 'button[aria-label="Google Search"]';
  await page.waitForSelector(searchButtonSelector);
  await page.waitFor(500 + Math.random() * 1000);
  await page.click(searchButtonSelector);
  // 
  const firstImageSelector = 'img[alt]:not([alt=""])';
  await page.waitForSelector(firstImageSelector);
  await page.waitFor(500 + Math.random() * 1000);
  await page.click(firstImageSelector);
  const largeImageSelector = 'img[style]:not([style=""])';
  await page.waitForSelector(largeImageSelector);
  await page.waitFor(500 + Math.random() * 1000);
  const imgs = await page.$$eval(largeImageSelector, imgs => imgs.map(img => img.getAttribute('src')));
  return imgs[0]

  // const imgSrc = imgs.filter(img => img.includes('https://'))[0];
  // return imgSrc;
};
