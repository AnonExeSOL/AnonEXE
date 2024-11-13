const puppeteer = require('puppeteer-extra');
const puppeteerExtraPluginStealth = require('puppeteer-extra-plugin-stealth');

puppeteer.use(puppeteerExtraPluginStealth());

let lastTweetTime = Date.now() - 30 * 60 * 1000;

/*

    This function creates a tweet on x.com.
    It returns true if the tweet was created successfully.

*/
async function createTweet(page, content) {
    
    //Check if the lastTweetTime is less than 30 minutes ago
    if (Date.now() - lastTweetTime < 30 * 60 * 1000) {
        return "ERROR: Too soon";
    }

    await page.goto('https://x.com/compose/tweet');

    await wait(5000);

    await page.keyboard.type(content);

    await wait(1500);

    //Click data-testid="tweetButton"
    const tweetButton = await page.$('[data-testid="tweetButton"]');
    if (tweetButton) {
        await tweetButton.click();
        //console.log("tweetButton clicked");
        await wait(500);
        try {
            //await tweetButton.click();
        } catch (error) {
            return false;
        }
    }

    await wait(3000);

    return true;

}

async function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { createTweet };
