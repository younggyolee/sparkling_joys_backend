const puppeteer = require('puppeteer');

exports.getImageForKeyword = async function(keyword) {
  console.log('bing bot turned on!');
  const browser = await puppeteer.launch({
    // headless: false
  });
  const page = await browser.newPage();
  await page.goto('https://www.bing.com/?scope=images', { waitUntil: 'networkidle2' });

  await page.type('#sb_form_q', keyword);
  await page.screenshot({path: 'bing0.png'});
  // const searchButtonSelector = 'label[for="sb_form_go"]';
  const searchButtonSelector = 'input[id="sb_form_go"]';
  await page.waitForSelector(searchButtonSelector);
  await page.click(searchButtonSelector);

  const imageLinksSelector = 'a.iusc';
  await page.waitFor(2000 + Math.random() * 1000);
  const links = await page.$$eval(
    imageLinksSelector,
    linkTags => linkTags.map(linkTag => linkTag.getAttribute('href'))
  );

  await page.goto('https://bing.com' + links[0], { waitUntil: 'networkidle2' });
  const imageSelector='img.nofocus'
  await page.waitForSelector(imageSelector);
  const images = await page.$$eval(
    imageSelector,
    imgs => imgs.map(img => img.getAttribute('src'))
  );

  return images[0];

  // const imageSelector = '.mimg';
  // await page.waitFor(2000 + Math.random() * 1000);
  // await page.screenshot({path: 'bing1.png'});
  // const images = await page.$$eval(
  //   imageSelector,
  //   imgs => imgs.map(img => img.getAttribute('src'))
  // );

  // await browser.close();
  // return images[0];
};
