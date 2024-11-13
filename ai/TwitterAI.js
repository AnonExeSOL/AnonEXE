const OpenAI = require('openai');

const config = require('./config.json');

const openAiKey = config.openAiKey;

const client = new OpenAI({
    apiKey: openAiKey,
});

let twitterAnalysisCache = "No twitter analysis yet.";

/*
    This function is used to create a market analysis based off the gathered Twitter messages.
*/
async function twitterAnalysis(messages) {

    let res = null;

    try {
        const response = await client.chat.completions.create({
            model: 'gpt-4',
            messages: [{
                role: 'user', content:
                    `
You're an expert crypto trader. I want you to look through these recent Tweets and create a market analysis based off the messages.

Here are the messages:
${messages}

Reply ONLY with the market analysis.
                ` }],
        });

        res = response.choices[0].message.content;

    } catch (error) {
    }

    twitterAnalysisCache = res;
    return res;

}

function getTwitterAnalysis() {
    return twitterAnalysisCache;
}

module.exports = { twitterAnalysis, getTwitterAnalysis };
