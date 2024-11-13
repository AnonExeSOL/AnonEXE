const OpenAI = require('openai');

const config = require('./config.json');

const openAiKey = config.openAiKey;

const client = new OpenAI({
    apiKey: openAiKey,
});

let telegramAnalysisCache = "No telegram analysis yet.";

/*
    This function is used to find a coin/ token based off the Telegram messages.
*/
async function getRelevantCoin(messages) {

    let res = null;

    try {
        const response = await client.chat.completions.create({
            model: 'gpt-4',
            messages: [{
                role: 'user', content:
                    `
You're an expert crypto trader. I want you to look through these recent Telegram messages and find one coin/ token that you think is relevant to the user. And could be a good buy based off the messages

Here are the messages:
${messages}

Reply ONLY with the coin/ token name.

Once again, reply ONLY with the coin/ token name.

If you don't find any, reply with "NONE"
                ` }],
        });

        res = response.choices[0].message.content;

    } catch (error) {
    }

    return res == "NONE" ? null : res;

}

/*
    This function is used to create a market analysis based off the gathered Telegram messages.
*/
async function telegramAnalysis(messages) {

    let res = null;

    try {
        const response = await client.chat.completions.create({
            model: 'gpt-4',
            messages: [{
                role: 'user', content:
                    `
You're an expert crypto trader. I want you to look through these recent Telegram messages and create a market analysis based off the messages.

Here are the messages:
${messages}

Reply ONLY with the market analysis.
                ` }],
        });

        res = response.choices[0].message.content;

    } catch (error) {
    }

    telegramAnalysisCache = res;
    return res;

}

function getTelegramAnalysis() {
    return telegramAnalysisCache;
}

module.exports = { getRelevantCoin, telegramAnalysis, getTelegramAnalysis };