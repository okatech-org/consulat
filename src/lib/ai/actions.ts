'use server';

'use server';

import OpenAI from 'openai';

const openai = new OpenAI();

/**
 * Server Action to generate chat completion with context and chat history.
 *
 * @param {string} userMessage - The user's input message.
 * @param {string} context - Contextual information to guide the AI's response.
 * @param {OpenAI.Chat.ChatCompletionMessageParam[]} history - Array of previous chat messages.
 * @returns {Promise<string | null>} - AI-generated text response or null on error.
 */
export async function getChatCompletion(
  userMessage: string,
  context: string,
  history: OpenAI.Chat.ChatCompletionMessageParam[],
): Promise<string | null> {
  try {
    const params: OpenAI.Chat.ChatCompletionCreateParams = {
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'developer',
          content: context,
        },
        ...history,
        {
          role: 'user',
          content: userMessage,
        },
      ],
    };
    const completion: OpenAI.Chat.ChatCompletion =
      await openai.chat.completions.create(params);
    const responseContent = completion.choices[0]?.message?.content;

    return responseContent || null;
  } catch (error) {
    console.error('Error generating chat completion with context:', error);
    return null;
  }
}
