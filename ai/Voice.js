const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");

const config = require('./config.json');

const openAiKey = config.openAiKey;

const openai = new OpenAI({
    apiKey: openAiKey,
});

const speechFile = path.resolve("./speech.mp3");

async function generateSpeech(text) {
  const mp3 = await openai.audio.speech.create({
    model: "tts-1",
    voice: "onyx",
    input: text,
  });
  const buffer = Buffer.from(await mp3.arrayBuffer());
  await fs.promises.writeFile(speechFile, buffer);
}

module.exports = { generateSpeech };