const Anthropic = require('@anthropic-ai/sdk');

const config = require('./config.json');

const apiKey = config.claudeApiKey;

const anthropic = new Anthropic({
    apiKey: apiKey,
});

/*

    This function gets the analysis of a chart and returns a JSON object with the analysis.
    Parameters:
        base64Image: The base64 encoded image of the chart.
        type: The type of analysis to perform. 1 = buy/ don't buy, 2 = sell/ hold.
        amount: The amount of SOL the user has in their wallet.

*/
async function getAnalysis(base64Image, type, amount) {

    const jsonResponse = JSON.parse(await getChartAnalysis(base64Image, type, amount));
    return jsonResponse;

}

async function getChartAnalysis(base64Image, type, amount) {

    let prompt = "";

    if (type == 1) {
        prompt = "The user is asking whether or not they should buy. They currently have " + amount + " SOL in their wallet. Your options for a recommendation are BUY or DONT_BUY. You should be high risk with the buys - if the first few candles look good, then that's a good sign. Be very liberal with the buys.";
    } else if (type == 2) {
        prompt = "The user is asking whether or not they should sell. They currently have " + amount + " SOL of the coin. Your options for a recommendation are SELL or HOLD. You should feel inclined to hold most of the time, but if the chart is looking extremely bad/good then sell. Only sell on the extremes of the chart (extremely bad or extremely good profit)";
    }

    const msg = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        messages: [
            {
                role: "user",
                content: [
                    {
                        type: "image",
                        source: {
                            type: "base64",
                            media_type: "image/jpeg", // Adjust media type as needed
                            data: base64Image,
                        },
                    },
                    {
                        type: "text",
                        text:
                            `
                        You're a helpful AI assistant that imitates API endpoints for a web server that returns info about a cryptocurrency chart.

                        You return all data in the following format:

                        {
                            "ticker": "TICKER",
                            "market_cap": 18640,
                            "liquidity": 9650,
                            "risk_factors": [
                                "Example risk.",
                                "Example risk.",
                                "Example risk."
                            ],
                            "analysis": {
                                "chart_pattern": "Declining with steep drop",
                                "volume": "Low and decreasing",
                                "market_health": "Unhealthy",
                                "techincal_signal": "Bearish"
                            },
                            "action": {
                                "recommendation": "SELL",
                                "amount_sol": "0.5",
                                "reason": "High risk and poor market structure"
                            }
                        }

                        Make sure to only reply with that format, only fill out the above fields, and don't add/ take away from the format.

                        You're now getting an incoming request with a link to the following image. ${prompt}

                        Once again, make sure to reply ONLY with the JSON response according to the above format.

                        Use the exact JSON format, including the risk factors list, the analysis object, and the action object.
                        `
                    }
                ],
            }
        ],
    });
    
    //console.log(msg.content[0].text);
    return msg.content[0].text;
}

module.exports = { getAnalysis };