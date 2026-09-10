const OpenAI = require("openai");
const config = require("./configService");

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

// Client is created lazily so a key entered via the Settings page takes
// effect immediately (the client is recreated whenever the key changes).
let client = null;

const getClient = () => {
  const apiKey = config.getEffectiveOpenRouterKey();
  if (!apiKey) return null;
  if (client && client._apiKey === apiKey) return client;
  client = new OpenAI({
    baseURL: OPENROUTER_BASE_URL,
    apiKey,
    timeout: 30000,
  });
  client._apiKey = apiKey;
  return client;
};

const getModel = () => config.getConfig().model;

const NO_KEY_MESSAGE =
  "AI is not configured. Add an OpenRouter API key in Settings.";

const summarizeReadme = async (readmeContent) => {
  const client = getClient();
  if (!client) return NO_KEY_MESSAGE;
  try {
    const response = await client.chat.completions.create({
      model: getModel(),

      messages: [
        {
          role: "system",
          content:
            "You are a senior software engineer. Explain GitHub repositories in beginner-friendly language.",
        },
        {
          role: "user",
          content: `
Explain this GitHub repository README in simple beginner-friendly terms.

README:
${readmeContent}

Explain:
1. What this project does
2. Main purpose
3. Technologies used
4. Key features
5. Who should use it

Keep answer short, clear, and beginner-friendly.
          `,
        },
      ],

      max_tokens: 300,
    });

    return response.choices[0].message.content;

  } catch (error) {
    console.error("FULL AI ERROR:");
    console.error(error);

    return "Failed to generate summary";
  }
};

const explainArchitecture = async (folders) => {
  const client = getClient();
  if (!client) return NO_KEY_MESSAGE;
  try {
    const response = await client.chat.completions.create({
      model: getModel(),

      messages: [
        {
          role: "system",
          content:
            "You are a senior software architect. Explain repository folder structures simply.",
        },
        {
          role: "user",
          content: `
Repository folders:

${folders.join(", ")}

Explain what each important folder likely contains.

Keep explanation concise.
          `,
        },
      ],

      max_tokens: 300,
    });

    return response.choices[0].message.content;

  } catch (error) {
    console.error(error);

    return "Failed to explain architecture";
  }
};
const identifyImportantFiles = async (files) => {
  const client = getClient();
  if (!client) return [];
  try {
    const response = await client.chat.completions.create({
      model: getModel(),

      messages: [
        {
          role: "system",
          content:
            "You are a senior software architect helping developers understand unfamiliar repositories.",
        },
        {
          role: "user",
          content: `
Repository files:

${files.join(", ")}

Identify the 3 most important files a developer should read first to understand this repository.

Return ONLY a valid JSON array.

IMPORTANT:
Use the exact file names provided.
Do not change capitalization.
Do not rename files.
Do not modify file names.

Example:

[
  "package.json",
  "index.js",
  "README.md"
]

Do not include explanations.
Do not include numbering.
Do not include markdown.
          `,
        },
      ],

      max_tokens: 200,
    });

    const content =
      response.choices[0].message.content;

    const cleanedContent = content
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(cleanedContent);

    // Guard against the AI model returning an object instead of an array,
    // or returning values that are not strings (e.g. null).
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (item) => typeof item === "string"
    );

  } catch (error) {
    console.error("Failed to identify important files:", error.message);

    // Return an empty array on any failure so callers can safely loop
    // over the result without encountering a string or throwing.
    return [];
  }
};
  const summarizeFile = async (
  fileName,
  fileContent
) => {
  const client = getClient();
  if (!client) return NO_KEY_MESSAGE;
  try {
    const response =
      await client.chat.completions.create({
        model: getModel(),

        messages: [
          {
            role: "system",
            content:
              "You are a senior software engineer explaining code files to beginners.",
          },
          {
            role: "user",
            content: `
File Name:
${fileName}

File Content:
${JSON.stringify(fileContent)}

Explain:

1. What this file does
2. Why it is important
3. What a beginner should understand from it

Keep answer under 100 words.
            `,
          },
        ],

        max_tokens: 200,
      });

    return response.choices[0].message.content;

  } catch (error) {
    console.error(error);

    return "Failed to summarize file";
  }
};

const answerQuestion = async (
  knowledgeBase,
  question
) => {
  const client = getClient();
  if (!client) return NO_KEY_MESSAGE;
  try {
    const response =
      await client.chat.completions.create({
        model: getModel(),

        messages: [
          {
            role: "system",
            content:
              "Answer questions using the repository information provided.",
          },
          {
            role: "user",
            content: `
Repository Information:

${knowledgeBase}

Question:

${question}
            `,
          },
        ],

        max_tokens: 300,
      });

    return response.choices[0].message.content;

  } catch (error) {
    console.error(error);

    return "Failed to answer question";
  }
};
module.exports = {
  summarizeReadme,
  explainArchitecture,
  identifyImportantFiles,
  answerQuestion,
  summarizeFile,
};