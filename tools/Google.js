const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { googleAI } = require('../ai/GoogleAI');

puppeteer.use(StealthPlugin());

async function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function google(page, search) {

    //go to google.com
    await page.goto('https://www.google.com');

    //wait 1 second
    await wait(1000);

    //search for the name on google, the search bar selector is #APjFqb
    await page.type('#APjFqb', search);

    //wait 1 second
    await wait(1000);

    //click enter
    await page.keyboard.press('Enter');

    //wait 5 seconds
    await wait(5000);

    //here
    const elements = await page.$$('.LC20lb.MBeuO.DKV0Md');
    const results = [];
    let e = [];
    for (const element of elements) {
        e.push(element);
        const text = await page.evaluate(el => el.innerText, element);
        results.push(text);
    }

    let aiResponse = await googleAI(results);

    let index = 0;

    if (!isNaN(aiResponse)) {
        index = aiResponse;
    }

    await e[index].click();
}

module.exports = { google };
