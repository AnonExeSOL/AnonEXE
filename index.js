const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');

puppeteer.use(StealthPlugin());

//Tools
const { checkMentions, getRandomMention } = require('./tools/CheckMentions');
const { replyToTweet } = require('./tools/PostReply');
const { generateImage } = require('./ai/GenerateImage');
const { launchPump } = require('./tools/LaunchPump');
const { getThread } = require('./tools/ReadThread');
const { screenshot } = require('./tools/Screenshot');
const { buyCoin, sellCoin } = require('./tools/TradeCoin');
const { createTweet } = require('./tools/CreateTweet');
const { checkTelegram } = require('./tools/CheckTelegram');
const { generateSpeech } = require('./ai/Voice');
const { readTimeline } = require('./tools/ReadTimeline');
const { followUser } = require('./tools/FollowUser');
const { getCoin, checkChart, checkChartByURL } = require('./tools/GetCoin');
const { google } = require('./tools/Google');
const { readPage } = require('./tools/ReadPage');

//AI
const { getAnalysis } = require('./ai/ChartAnalysis');
const AIManager = require('./ai/AIManager');
const { getEngineAction, addPastAction, tweetComposer, replyComposer } = require('./ai/Engine');

let browser,
    bullXPage,
    mainPage,
    telegramPage;

let tree = [];
let treeIndent = 0;

let currentCoins = [];
let lastChecked = Date.now();

async function loadCookies(page) {
    const cookies = JSON.parse(fs.readFileSync('cookies.json', 'utf8'));
    await page.setCookie(...cookies);
}

async function saveCookies(page) {
    const cookies = await page.cookies();
    fs.writeFileSync('cookies.json', JSON.stringify(cookies, null, 2));
}

async function loadLocalStorage(page) {
    const localStorageData = JSON.parse(fs.readFileSync('localStorage.json', 'utf8'));
    await page.goto('https://web.telegram.org', { waitUntil: 'domcontentloaded' });

    await page.evaluate((data) => {
        for (const [key, value] of Object.entries(data)) {
            localStorage.setItem(key, value);
        }
    }, localStorageData);


}

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function buildConsoleTree(action) {

    let call = action.action;

    if (call == "readTimeline" || call == "checkTelegram" || call == "checkMentions") {
        treeIndent = 0;
    } else {
        treeIndent++;
    }

    let string = "";

    if (treeIndent == 1) {
        string += "└── ";
    } else if (treeIndent > 1) {
        for (let i = 1; i < treeIndent; i++) {
            string += "    ";
        }
        string += "└── ";
    }

    string += call;

    console.log(string);

}

(async () => {

    for (let i = 0; i < 100; i++) {
        console.log("");
    }

    browser = await puppeteer.launch({ headless: false });

    bullXPage = await browser.newPage();
    mainPage = await browser.newPage();
    telegramPage = await browser.newPage();

    await loadCookies(bullXPage);
    await loadCookies(mainPage);
    await loadLocalStorage(telegramPage);

    await bullXPage.goto('https://bullx.io/');
    await mainPage.goto('https://www.x.com/');

    await wait(90000);

    //Start engine loop
    while (true) {

        try {

            let action;

            //Check if forced_actions.txt has any actions in it
            const forcedActions = fs.readFileSync('forced_actions.txt', 'utf8').trim();
            if (forcedActions) {
                action = forcedActions;
            } else {

                //If last checked was more than 30 minutes ago
                if (Date.now() - lastChecked > 180000 && currentCoins.length > 0) {
                    action = `{"action": "checkAllCharts"}`;
                    lastChecked = Date.now();
                } else {
                    action = await getEngineAction();
                }
            }

            try {
                action = JSON.parse(action);
            } catch (error) {
                action = await getEngineAction();
                action = JSON.parse(action);
            }

            buildConsoleTree(action);

            try {

                if (action.action == "replyToTweet") {

                    let res = await replyComposer(action.parameters[1]);
                    await mainPage.bringToFront();
                    await replyToTweet(mainPage, action.parameters[0], res);

                } else if (action.action == "getRandomMention") {
                    await mainPage.bringToFront();
                    action.result = await getRandomMention(mainPage);
                } else if (action.action == "launchPump") {
                    await mainPage.bringToFront();
                    let img = await generateImage("Generate a meme coin image with the following description: " + action.parameters[3] + ". The name of the coin should be " + action.parameters[1] + " and the ticker should be " + action.parameters[2] + ".");
                    action.result = await launchPump(img, action.parameters[1], action.parameters[2], action.parameters[3], browser);
                } else if (action.action == "getThread") {
                    await mainPage.bringToFront();
                    action.result = await getThread(mainPage, action.parameters[0]);
                } else if (action.action == "checkChart") {
                    await bullXPage.bringToFront();
                    action.result = await checkChart(bullXPage, action.parameters[0], 1);
                } else if (action.action == "buyCoin") {
                    currentCoins.push(await bullXPage.url());
                    await bullXPage.bringToFront();
                    await buyCoin(bullXPage);
                } else if (action.action == "sellCoin") {
                    let url = await bullXPage.url();
                    currentCoins = currentCoins.filter(coin => coin != url);
                    await bullXPage.bringToFront();
                    await sellCoin(bullXPage);
                } else if (action.action == "createTweet") {

                    let tweet = await tweetComposer();
                    await mainPage.bringToFront();
                    action.result = await createTweet(mainPage, tweet);

                } else if (action.action == "checkTelegram") {
                    await telegramPage.bringToFront();
                    action.result = await checkTelegram(telegramPage);
                } else if (action.action == "readTimeline") {
                    await mainPage.bringToFront();
                    await readTimeline(mainPage);
                } else if (action.action == "followUser") {
                    await mainPage.bringToFront();
                    await followUser(mainPage, action.parameters[0]);
                } else if (action.action == "google") {
                    await mainPage.bringToFront();
                    await google(mainPage, action.parameters[0]);
                } else if (action.action == "readPage") {
                    await mainPage.bringToFront();
                    await readPage(mainPage);
                } else if (action.action == "checkAllCharts") {

                    for (let i = 0; i < currentCoins.length; i++) {
                        let res = await checkChartByURL(bullXPage, currentCoins[i], 2);
                        if (res.action.recommendation == "SELL") {
                            let url = await bullXPage.url();
                            currentCoins = currentCoins.filter(coin => coin != url);
                            await bullXPage.bringToFront();
                            await sellCoin(bullXPage);
                        }
                    }

                    action.result = "Checked all charts and updated positions.";

                }

            } catch (error) {
                action.result = "ERROR. There was an issue with this action. Choose a different action.";
            }

            action = JSON.stringify(action);
            await addPastAction(action);

        } catch (error) {}

        await wait(5000);

    }

})();