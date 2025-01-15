import { OpenAI } from 'openai';
import { ConsularAssistant } from './assistants/consular-assistant';
import { ChatContext } from '@/lib/ai/types'

export class AssistantFactory {
  private static openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  static createAssistant(context: ChatContext): ConsularAssistant {
    return new ConsularAssistant(this.openai, context);
  }
}