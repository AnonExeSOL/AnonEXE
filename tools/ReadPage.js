const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { isPageRelevant } = require('../ai/PageAI');
const AIManager = require('../ai/AIManager');

puppeteer.use(StealthPlugin());

async function readPage(page) {

    // Scroll down the page 400 pixels at a time
    const maxScroll = 7777;
    const scrollStep = 400;
    const scrollDelay = 3000;
    let totalScrolled = 0;

    while (totalScrolled < maxScroll) {
        await page.evaluate(() => {
            window.scrollBy(0, 400); // Scroll down 400 pixels
        });
        totalScrolled += scrollStep;
        await new Promise(resolve => setTimeout(resolve, scrollDelay)); // Wait for 1000ms
    }

    //get all the content of all paragraphs on the page
    let content = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('p')).map(p => p.textContent.trim()).join('\n');
    });

    let aiResponse = await isPageRelevant(content);
    let isRelevant = aiResponse.toLowerCase() === 'yes';

    if(!isRelevant) {
        //console.log('Page is not relevant. Skipping.');
        return;
    }

    const aiManager = new AIManager();
    await aiManager.learnFromTweet({
        content: content,
        account_handle: page.url(),
        timestamp: Date.now(),
        engagement_metrics: {
            likes: 0,
            retweets: 0
        }
    });

    //console.log('Page is relevant. Added to memory.');

}

module.exports = { readPage };