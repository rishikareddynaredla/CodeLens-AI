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
  answerQuestion,
};