const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

/*

    This function replies to a tweet. There is no return value.

*/
async function replyToTweet(page, tweetUrl, content) {

    await page.goto(tweetUrl);

    await wait(5000);

    //Find the first element with aria-label="Post text" and click it
    const postText = await page.$('div[aria-label="Post text"]');
    await postText.click();

    await wait(100);

    await page.keyboard.type(content);

    await wait(1000);

    //Find the first span on the page with the text "Reply" and click it
    const replySpans = await page.$$('span'); // Select all span elements
    for (const replySpan of replySpans) {
        const text = await page.evaluate(el => el.textContent, replySpan);
        if (text.includes("Reply")) { // Check if the text includes "Reply"
            //Get coordinates of the span
            const coordinates = await page.evaluate(el => {
                const rect = el.getBoundingClientRect();
                return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
            }, replySpan);
            // Move the mouse to the coordinates
            await page.bringToFront();
            await page.mouse.move(coordinates.x + coordinates.width / 2, coordinates.y + coordinates.height / 2);
            await wait(100);
            //await page.mouse.click(coordinates.x + coordinates.width / 2, coordinates.y + coordinates.height / 2);
            break; // Exit the loop after clicking the first matching span
        }
    }

    await wait(1000);

    return;

}

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { replyToTweet };
