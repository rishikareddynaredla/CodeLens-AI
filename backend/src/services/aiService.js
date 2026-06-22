const OpenAI = require("openai");

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

const summarizeReadme = async (readmeContent) => {
  try {
    const response = await client.chat.completions.create({
      model: "deepseek/deepseek-chat",

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
  try {
    const response = await client.chat.completions.create({
      model: "deepseek/deepseek-chat",

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
  try {
    const response = await client.chat.completions.create({
      model: "deepseek/deepseek-chat",

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
  "index.js",s
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

    return JSON.parse(cleanedContent);

  } catch (error) {
    console.error(error);

    return "Failed to identify important files";
  }
};
  const summarizeFile = async (
  fileName,
  fileContent
) => {
  try {
    const response =
      await client.chat.completions.create({
        model: "deepseek/deepseek-chat",

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
  try {
    const response =
      await client.chat.completions.create({
        model: "deepseek/deepseek-chat",

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