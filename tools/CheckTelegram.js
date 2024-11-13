const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const AIManager = require('../ai/AIManager');
const { getRelevantCoin } = require('../ai/TelegramAI');

puppeteer.use(StealthPlugin());

let allMessages = [];

/*
    This function is used to check recent Telegram messages.
*/
async function checkTelegram(page) {

    let messages = await page.evaluate(() => {
        return document.querySelector(".chatlist").querySelectorAll('a').length;
    });

    //Limit it to the first 8 message rooms
    messages = Math.min(messages, 8);

    for (let i = 0; i < messages; i++) {

        await page.click(`.chatlist a:nth-of-type(${i + 1})`);
        //console.log(`Clicked on message ${i + 1}`);
        await wait(5000);

        await scrollThroughMessages(page);

    }

    let coin = await getRelevantCoin(allMessages.join('\n'));
    let analysis = await telegramAnalysis(allMessages.join('\n'));

    allMessages = [];

    return coin;

}

/*
    This function is used to scroll through the messages in a message room.
*/
async function scrollThroughMessages(page) {


    const elements = await page.$$('.bubbles-group');
    const bubbles = Array.from(elements);
    bubbles.reverse();

    // Scroll through the messages
    for (let bubble of bubbles) {
        // Smooth scroll
        await bubble.evaluate(el => el.scrollIntoView({ behavior: 'smooth' }));

        // Evaluate the message in the page context
        const message = await bubble.evaluate(el => {
            const messageElement = el.querySelector('.translatable-message');
            return messageElement ? messageElement.textContent : null;
        });

        //console.log(message);

        if (message) {

            allMessages.push(message);

            let msg = {
                account_handle: "telegram",
                content: message,
                engagement_metrics: { likes: 0, retweets: 0 },
                timestamp: new Date().getTime()
            };

            const aiManager = new AIManager();
            await aiManager.learnFromTweet(msg);
        }

        await wait(3000); // Wait for a second between scrolls
    }


}

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { checkTelegram };