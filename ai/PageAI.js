const Anthropic = require('@anthropic-ai/sdk');
const AIManager = require('./AIManager');

const config = require('./config.json');

const apiKey = config.claudeApiKey;

const anthropic = new Anthropic({
    apiKey: apiKey,
});

async function isPageRelevant(content) {

    const aiManager = new AIManager();

    let response = await aiManager.queryIndex("cryptocurrency", { timestamp: { '$gt': 0 }}, 10);
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

                        You've been reading this page:
                        ${content}

                        Is this page relevant to your research? Yes or No.

                        Reply only with Yes or No. Nothing else.
                        `
                    }
                ],
            }
        ],
    });

    return msg.content[0].text;

}

module.exports = { isPageRelevant };
