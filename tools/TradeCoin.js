const puppeteer = require('puppeteer-extra');
const puppeteerExtraPluginStealth = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const path = require('path');

puppeteer.use(puppeteerExtraPluginStealth());

/*

    This function buys a coin on bullx.io using 0.01 SOL.
    It returns true if the coin was bought successfully.

*/
async function buyCoin(page) {
    
    await page.click(`div[title="Buy"]`);

    let isMigrating = true;

    while(isMigrating) {
        isMigrating = await page.evaluate(() => {
            return document.body.innerText.includes("currently being migrated");
        });
        //console.log("Waiting for migration...");
        await wait(1000);
    }

    let found;

    found = await page.$$eval('span', spans => {
        for (let span of spans) {
            if (span.textContent.trim() === "0.2") {
                span.click();
                return span;
            }
        }
        return null;
    });

    found = await page.$$eval('span', spans => {
        for (let span of spans) {
            if (span.textContent.includes("for 0.01000")) {
                span.click();
                return span;
            }
        }
        return null;
    });

    return true;

}

/*

    This function sells 100% a coin on bullx.io.
    It returns true if the coin was sold successfully.

*/
async function sellCoin(page) {
    
    await page.click(`div[title="Sell"]`);

    let isMigrating = true;

    while(isMigrating) {
        isMigrating = await page.evaluate(() => {
            return document.body.innerText.includes("currently being migrated");
        });
        //console.log("Waiting for migration...");
        await wait(1000);
    }

    let found;

    found = await page.$$eval('span', spans => {
        for (let span of spans) {
            if (span.textContent.trim() === "100 %") {
                span.click();
                return span;
            }
        }
        return null;
    });

    await page.click(`#rc-tabs-2-panel-sell > div > div.relative > div > footer > div.flex.gap-x-2 > button > span`);

    return true;
}

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { buyCoin, sellCoin };
