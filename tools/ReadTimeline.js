const puppeteer = require('puppeteer-extra');
const puppeteerExtraPluginStealth = require('puppeteer-extra-plugin-stealth');
const AIManager = require('../ai/AIManager');

puppeteer.use(puppeteerExtraPluginStealth());

let tweets = [];

async function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/*
    This function is used to read the timeline of the user.
    Disclaimer: Some janky code is used to index the timeline as Twitter updates timelines dynamically.
*/
async function readTimeline(page) {

    await page.goto('https://x.com/');

    await wait(15000);

    let totalIndex = 0;
    let lastBackup;

    const aiManager = new AIManager();

    //Find 30 tweets
    while (totalIndex < 30) {

        let index = 0;

        let backupList = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('[aria-label="Timeline: Your Home Timeline"] > div > [data-testid="cellInnerDiv"]')).map(e => e.outerHTML);
        });

        if (lastBackup && backupList.includes(lastBackup)) {
            index = backupList.indexOf(lastBackup);
        } else {
            index = Math.round((backupList.length / 2));
        }

        let ele = await page.evaluate(() => {

            let elements = Array.from(document.querySelectorAll('[aria-label="Timeline: Your Home Timeline"] > div > [data-testid="cellInnerDiv"]'));

            let texts = [];

            for (let e of elements) {

                let spans = e.querySelectorAll("span");

                if (!spans) continue;

                let text = [];

                let rect = e.getBoundingClientRect();
                let x = rect.left + window.scrollX; // x position relative to the document
                let y = rect.top + window.scrollY;  // y position relative to the document
                text.push([x, y]);

                text.push(e.outerHTML);

                let timestamp = e.querySelector('time');
                let timestampValue = timestamp ? new Date(timestamp.getAttribute('datetime')).getTime() : null; // Extract and convert to timestamp

                text.push(timestampValue);
                
                for (let s of spans) {
                    text.push(s.innerText);
                }

                texts.push(text);

            }

            return texts;

        });

        await wait(1000);

        while (index < ele.length) {

            let result = await page.evaluate(async (index, ele) => {
                let elements = ele[index];

                let name = elements[3] ? elements[3] : "null";
                let handle = elements[6] ? elements[6] : "null";
                let text = elements[8] ? elements[8] : "null";
                let replies = elements[11] ? elements[11] : "null";
                let retweets = elements[14] ? elements[14] : "null";
                let likes = elements[17] ? elements[17] : "null";
                let views = elements[20] ? elements[20] : "null";

                let x = elements[0][0];
                let y = elements[0][1];

                //Scroll to the x and y coordinates smoothly
                window.scrollTo({
                    top: y,
                    left: x,
                    behavior: 'smooth'
                });

                let timestamp = elements[2];
                if(!timestamp) timestamp = new Date().getTime();
            
                let tweet = {
                    account_handle: handle,
                    content: text,
                    engagement_metrics: { likes: likes, retweets: retweets },
                    timestamp: timestamp
                };

                tweets.push(text);

                return [elements[1], tweet];

            }, index, ele);

            lastBackup = result[0];

            await aiManager.learnFromTweet(result[1]);

            //Time between tweets
            await wait(3000);

            index++;
            totalIndex++;

        }

    }

    let allTweets = tweets.join('\n');
    allTweets = allTweets.substring(0, 15000);

    let analysis = await twitterAnalysis(allTweets);

}

module.exports = { readTimeline };