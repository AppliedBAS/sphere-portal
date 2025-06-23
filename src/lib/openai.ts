import OpenAI from "openai";

const openAIClient = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY!,
    dangerouslyAllowBrowser: true,
});

export default openAIClient;