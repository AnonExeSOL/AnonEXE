const puppeteer = require('puppeteer-extra');
const puppeteerExtraPluginStealth = require('puppeteer-extra-plugin-stealth');
const AIManager = require('../ai/AIManager');

puppeteer.use(puppeteerExtraPluginStealth());

async function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function followUser(page, user) {

    await page.goto('https://x.com/' + user);

    await wait(15000);

    const spans = await page.$$('span'); // Get all span elements
    for (const span of spans) {
        const text = await page.evaluate(el => el.innerText, span); // Get the inner text of the span
        if (text.trim() === 'Follow') { // Check if the text is 'Follow'
            await span.click(); // Click the button
            //console.log("Followed user");
            break; // Exit the loop after clicking
        }
    }
}

module.exports = { followUser };