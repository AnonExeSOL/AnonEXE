const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

/*

    This function gets the thread of a tweet and returns an array of arrays.
    Each array contains the author and text of a tweet.
    
*/
async function getThread(page, url) {

    await page.goto(url);

    await wait(5000);

    //Scroll to top of page
    await page.evaluate(() => {
        window.scrollTo(0, 0);
    });

    await wait(1000);

    const conversationContainer = await page.$('div[aria-label="Timeline: Conversation"]');

    const conversationDivs = await conversationContainer.$$('div[data-testid="cellInnerDiv"]');

    conversationDivs.pop();

    let tweets = [];

    for (let i = 0; i < conversationDivs.length; i++) {
        let tweet = await getTweet(conversationDivs, page, i);
        tweets.push(tweet);
    }

    return tweets;

}

async function getTweet(conversationDivs, page, i) {

    let tweet = [];

    const spans = await page.evaluate(conversationDiv => {
        return Array.from(conversationDiv.querySelectorAll('span')).map(span => span.textContent);
    }, conversationDivs[i]);

    const condensedSpans = spans.slice(1, 4).join(' ');
    spans.splice(0, 4);
    tweet.push(condensedSpans);

    for (const text of spans) {
        if (text.length > 5) {
            tweet.push(text);
        }
    }

    return (tweet);

}

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { getThread };