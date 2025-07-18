import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../env';
import { ChatMessage, ContextData } from './types';
import { ContextBuilder } from './context-builder';

export class GeminiChatService {
  private genAI: GoogleGenerativeAI;
  private model: ReturnType<GoogleGenerativeAI['getGenerativeModel']>;

  constructor() {
    this.genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY!);
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-2.5-pro',
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 4096,
      },
    });
  }

  async getChatCompletion(
    userMessage: string,
    contextData: ContextData,
    history: ChatMessage[],
  ): Promise<string | null> {
    try {
      // Build context using the ContextBuilder
      const context = ContextBuilder.buildContext(contextData);

      // Format chat history for Gemini
      const formattedHistory = history.map((msg) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

      // Start a new chat
      const chat = this.model.startChat({
        history: formattedHistory,
        safetySettings: this.model.safetySettings,
        generationConfig: this.model.generationConfig,
      });

      // Send message with context
      const result = await chat.sendMessage(`${context}\n\nUser message: ${userMessage}`);
      const response = await result.response;

      if (!response.candidates || response.candidates.length === 0) {
        console.error('No response candidates from Gemini');
        return null;
      }

      const text = response.text();
      if (!text) {
        console.error('Empty response from Gemini');
        return null;
      }

      return text;
    } catch (error) {
      console.error('Error generating chat completion with Gemini:', error);
      if (error instanceof Error) {
        // Log specific error details for debugging
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      return null;
    }
  }
}
