const puppeteer = require('puppeteer-extra');
const puppeteerExtraPluginStealth = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const path = require('path');

puppeteer.use(puppeteerExtraPluginStealth());

/*

    This function takes a screenshot of the current page and saves it to the screenshots folder.
    It returns the path to the screenshot and the screenshot as a base64 encoded string.

*/
async function screenshot(page, name) {

    const screenshotDir = path.join(__dirname, 'screenshots');
    if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir, { recursive: true });
    }

    const screenshotBuffer = await page.screenshot({ type: 'jpeg' });

    fs.writeFileSync(path.join(screenshotDir, `${name}.jpeg`), screenshotBuffer);

    const screenshotPath = path.join(screenshotDir, `${name}.jpeg`);
    const base64Image = fs.readFileSync(screenshotPath, { encoding: 'base64' });

    return {
        screenshotPath: screenshotPath,
        base64Image: base64Image
    };

}

module.exports = { screenshot };