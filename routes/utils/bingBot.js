const puppeteer = require('puppeteer');

exports.getImageForKeyword = async function(keyword) {
  const browser = await puppeteer.launch({
    // headless: false
  });
  try {
    const page = await browser.newPage();
    await page.goto('https://www.bing.com/?scope=images', { waitUntil: 'networkidle2' });

    await page.type('#sb_form_q', keyword);
    let searchButtonSelector;
    if (process.env.NODE_ENV === 'development') {
      searchButtonSelector = 'label[for="sb_form_go"]';
    } else {
      searchButtonSelector = 'input[id="sb_form_go"]';
    }
    await page.waitForSelector(searchButtonSelector);
    await page.click(searchButtonSelector);

    const imageLinksSelector = 'a[class="iusc"]';
    await page.waitFor(1000 + Math.random() * 1000);
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
    browser.close();

    return images[0];
  } catch (err) {
    console.log('Error while getting image using BingBot.\n', err);
    browser.close();
  }
};
