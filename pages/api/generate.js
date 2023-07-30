// pages/api/generate.js

import { Configuration, OpenAIApi } from 'openai';

const MIN_API_CALL_INTERVAL = 1000; // Minimum time (in milliseconds) between API calls
let lastApiCallTime = 0;

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const basePromptPrefix = "Only send the code. Send html css and js in object";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end(); // Method Not Allowed
  }

  // Check if the time since the last API call is greater than the minimum interval
  const currentTime = Date.now();
  if (currentTime - lastApiCallTime < MIN_API_CALL_INTERVAL) {
    return res.status(429).json({ error: "Too many requests. Please wait a moment and try again." });
  }

  lastApiCallTime = currentTime;

  try {
    const userInput = req.body.userInput;

    const baseCompletion = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: `${basePromptPrefix}${userInput}`,
      temperature: 0.7,
      max_tokens: 250,
    });

    const basePromptOutput = baseCompletion.data.choices.pop();
    res.status(200).json({ output: basePromptOutput });
  } catch (error) {
    console.error('Error while calling the API:', error);
    res.status(500).json({ error: 'Something went wrong with the API call.' });
  }
}
