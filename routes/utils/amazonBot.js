//const puppeteer = require('puppeteer');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

exports.getRecommendedProducts = async function(keyword) {
  const browser = await puppeteer.launch({
//    headless: false
  });
  // try {
    const page = await browser.newPage();
    await page.goto('https://www.amazon.com/', {waitUntil: 'networkidle2'});
    await page.screenshot({path: 'amazon0.png'});
    await page.waitForSelector('#twotabsearchtextbox', { timeout: 5000 });
    await page.type('#twotabsearchtextbox', keyword);
    let searchButtonSelector;
    searchButtonSelector = 'input[class="nav-input"]';
    await page.waitFor(500 + Math.random() * 2000);
    await page.waitForSelector(searchButtonSelector, {
      timeout: 2000
    });
    await page.click(searchButtonSelector);

    // const imagesSelector = 'img[class="s-image"]';
    // await page.waitFor(1000 + Math.random() * 1000);
    // const images = await page.$$eval(
    //   imagesSelector,
    //   imgs => imgs.map(img => ({
    //     url: img.getAttribute('src'),
    //     title: img.getAttribute('alt')
    //   }))
    // );
    // console.log('images', images);

    const linksSelector = 'a[class="a-link-normal"]';
    await page.waitFor(1000 + Math.random() * 1000);
    const links = await page.$$eval(
      linksSelector,
      links => links.map(link => link.getAttribute('href'))
    );
    console.log('links', links);

    // const links = await page.$$eval(
    //   imageLinksSelector,
    //   linkTags => linkTags.map(linkTag => linkTag.getAttribute('href'))
    // );

  //   await page.goto('https://bing.com' + links[0], { waitUntil: 'networkidle2' });
  //   const imageSelector='img.nofocus'
  //   await page.waitForSelector(imageSelector, {
  //     timeout: 5000
  //   });
  //   const images = await page.$$eval(
  //     imageSelector,
  //     imgs => imgs.map(img => img.getAttribute('src'))
  //   );
  //   browser.close();

  //   return images[0];
  // } catch (err) {
  //   console.log('Error while getting image using BingBot.\n', err);
  //   browser.close();
  // }
};
