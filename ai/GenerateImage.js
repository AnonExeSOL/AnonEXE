const OpenAI = require('openai');

const config = require('./config.json');

const openAiKey = config.openAiKey;

const client = new OpenAI({
    apiKey: openAiKey,
});

/*

    This function generates an image based on a prompt and returns the URL of the image.

*/
async function generateImage(prompt) {


    const response = await client.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
    });

    let image_url = response.data[0].url;

    return image_url;

}

module.exports = { generateImage };