const puppeteer = require('puppeteer');

exports.getImageForKeyword = async function(keyword) {
  console.log('bing bot turned on!');
  const browser = await puppeteer.launch({
    // headless: false
  });
  const page = await browser.newPage();
  await page.goto('https://www.bing.com/?scope=images', { waitUntil: 'networkidle0' });

  await page.type('#sb_form_q', keyword);
  let searchButtonSelector;
  if (process.env.NODE_ENV='development') {
    searchButtonSelector = 'label[for="sb_form_go"]';
  } else {
    searchButtonSelector = 'input[id="sb_form_go"]';
  }
  await page.waitForSelector(searchButtonSelector);
  await page.click(searchButtonSelector);

  const imageLinksSelector = 'a[class="iusc"]';
  // await page.waitForSelector(imageLinksSelector, { timeout: 30000 });
  await page.waitFor(1000 + Math.random() * 2000);
  const links = await page.$$eval(
    imageLinksSelector,
    linkTags => linkTags.map(linkTag => linkTag.getAttribute('href'))
  );

  await page.goto('https://bing.com' + links[0], { waitUntil: 'networkidle0' });
  const imageSelector='img.nofocus'
  await page.waitForSelector(imageSelector);
  const images = await page.$$eval(
    imageSelector,
    imgs => imgs.map(img => img.getAttribute('src'))
  );

  return images[0];
};
