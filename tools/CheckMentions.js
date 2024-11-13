const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { twitterAnalysis } = require('../ai/TwitterAI');

puppeteer.use(StealthPlugin());

let lastHrefs = [];

/*

    This function returns an array of URLs of tweets that the user has been mentioned in.

*/
async function checkMentions(page) {

    await page.goto('https://x.com/mentions');

    await wait(15000);

    try {
        let timelineContainer = await page.$('div[aria-label="Timeline: Notifications"]');
        let cellInnerDivs = await timelineContainer.$$('div[data-testid="cellInnerDiv"]');
        await cellInnerDivs[1].click();
    } catch (error) {
        //console.log('Error clicking cellInnerDivs[1]:');
        return;
    }

    await wait(2000);

    await page.goBack();

    await wait(3000);

    timelineContainer = await page.$('div[aria-label="Timeline: Notifications"]');
    cellInnerDivs = await timelineContainer.$$('div[data-testid="cellInnerDiv"]');

    //Loop through all a elements in cellInnerDivs and check if their href contains status/ 
    let hrefs = [];

    for (let i = 0; i < cellInnerDivs.length; i++) {
        const aElements = await cellInnerDivs[i].$$('a');
        for (let j = 0; j < aElements.length; j++) {
            const href = await page.evaluate(el => el.href, aElements[j]);
            if (href.includes('/status/') && !hrefs.includes("/analytics")) {
                hrefs.push(href);
            }
        }
    }

    //Remove all hrefs that contain "analytics"
    hrefs = hrefs.filter(href => !href.includes("analytics"));

    return hrefs;

}

/*

    This function returns a random URL from the array of URLs returned by checkMentions.

*/
async function getRandomMention(page) {
    let hrefs = await checkMentions(page);
    return hrefs[Math.floor(Math.random() * hrefs.length)];
}

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { checkMentions, getRandomMention };
