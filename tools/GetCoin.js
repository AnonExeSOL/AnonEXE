const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const path = require('path');
const { screenshot } = require('./Screenshot');
const { getAnalysis } = require('../ai/ChartAnalysis');

puppeteer.use(StealthPlugin());

async function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function getCoin(page, name) {

    await page.goto('https://bullx.io/');

    await wait(5000);

    await page.click('[placeholder="Search"]');

    await wait(2500);

    await page.keyboard.type(name);

    await wait(5000);

    await page.click(`#search-results-list > div`);

    await wait(5000);
    
    return page.url();

}

/*

    This function gets the coin and then checks the chart.
    Parameters:
        page: The page object.
        name: The name of the coin.
        type: The type of analysis to perform. 1 = buy/ don't buy, 2 = sell/ hold.

*/
async function checkChart(page, name, type) {

    await getCoin(page, name);

    let chart = await screenshot(page, "chart");

    let analysis = await getAnalysis(chart.base64Image, type, 1);

    return analysis;

}

async function checkChartByURL(page, url, type) {

    await page.goto(url);

    await wait(5000);
    let chart = await screenshot(page, "chart");

    let analysis = await getAnalysis(chart.base64Image, type, 1);

    return analysis;

}


module.exports = { getCoin, checkChart, checkChartByURL };