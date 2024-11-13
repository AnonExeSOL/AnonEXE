const Anthropic = require('@anthropic-ai/sdk');
const AIManager = require('./AIManager');

const config = require('./config.json');

const apiKey = config.claudeApiKey;

const anthropic = new Anthropic({
    apiKey: apiKey,
});

async function googleAI(search) {

    const aiManager = new AIManager();

    let response = await aiManager.queryIndex(search.toString(), { timestamp: { '$gt': 0 }}, 10);
    let responses = response.matches.map(e => e.metadata.content);

    const msg = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        messages: [
            {
                role: "user",
                content: [
                    {
                        type: "text",
                        text:
                            `
                        You're a cryptocurrency trader thats been doing research.

                        Here's what you've been looking at recently:
                        ${responses.join('\n')}

                        You just made a google search and the following results came up:
                        ${search}

                        Reply with the best result to click on.

                        Reply only using the index number. So if you want to click the first item in the array, then you'd return 0.

                        Make sure to only reply with the index number, nothing else.
                        `
                    }
                ],
            }
        ],
    });

    return msg.content[0].text;

}

module.exports = { googleAI };
