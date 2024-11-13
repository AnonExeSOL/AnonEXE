const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const path = require('path');

puppeteer.use(StealthPlugin());

let lastPumpTimestamp = Date.now() - (24 * 60 * 60 * 1000);

/*

    This function launches a pump.fun coin and returns the URL of the newly created pump.

*/
async function launchPump(image_url, name, ticker, description, browser) {

    //If the last pump was less than 24 hours ago, return null
    if(Date.now() - lastPumpTimestamp < 24 * 60 * 60 * 1000) {
        return "Error: You can only launch a pump once every 24 hours.";
    }

    let pumpBrowser = await puppeteer.launch({
        headless: false,
        defaultViewport: { width: 1920, height: 980 },
        timeout: 120000,
        targetFilter: target => !!target.url(),
    });

    let page = await pumpBrowser.pages();
    page = page[0];

    const cookies = JSON.parse(fs.readFileSync('cookies.json', 'utf8'));
    await page.setCookie(...cookies);

    const screenshotDir = path.join(__dirname, 'screenshots'); // Define the screenshot directory

    let tweetUrl = "https://x.com/anonexesol";
    let url = tweetUrl;

    await page.goto(`https://pump.fun/create`);

    await wait(5000);

    //Loop through all buttons on the page and click the one that contains the text "ready to pump"
    let buttons = await page.$$('button');
    for (let button of buttons) {
        const text = await page.evaluate(el => el.textContent, button);
        if (text.includes("ready to pump")) {
            await button.click();
        }
    }

    await wait(1000);

    await page.click('#btn-accept-all');

    await wait(1000);

    await page.type('#name', name);
    await page.type('#ticker', ticker);
    await page.type('#text', description);

    await wait(1000);

    let screenshotPage = await browser.newPage();
    await screenshotPage.goto(image_url);

    await wait(1000);

    //Screenshot the page and save it to screenshotDir
    const imagePath = path.join(screenshotDir, 'pfp.png');
    await screenshotPage.screenshot({ path: imagePath });
    await screenshotPage.close();
    await page.bringToFront();
    // Upload the image
    const dropArea = await page.$('input[type="file"]');
    await dropArea.uploadFile(imagePath);

    await wait(1000);

    //Loop through all a elements and click the one with the text "Show more"
    let showMoreButton = await page.$$('div');
    for (let i = 0; i < showMoreButton.length; i++) {
        const text = await page.evaluate(el => el.textContent, showMoreButton[i]);
        if (text == ('Show more options ↓')) {
            await showMoreButton[i].click();
        }
    }

    await page.type('#twitter', url);

    //Click the selector
    await page.bringToFront();
    await page.click('body > main > div.flex.flex-col.justify-center.items-center.mt-10 > div > div > button');
    await wait(1000);

    await page.type('#amount', '0');

    await wait(5000);

    await page.bringToFront();
    //Click button
    const buttonCount = await page.$$eval('button', buttons =>
        buttons.filter(button => button.textContent.trim() === 'Create coin')[1].click()
    );

    await wait(2000);
    await page.bringToFront();
    await wait(1000);
    await page.bringToFront();
    await page.click('body > main > div:nth-child(2) > ol > li > a > button');

    await wait(2000);

    const pumpUrl = await page.url();

    await wait(3000);

    return pumpUrl;

}

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { launchPump };