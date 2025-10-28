import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { StructuredOutput, VisionAnalyzer } from './types';

export class GeminiVisionAnalyzer implements VisionAnalyzer {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: 0.1,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 4096,
      },
    });
  }

  async analyzeImage(base64Image: string, prompt: string): Promise<string> {
    const image = {
      inlineData: {
        data: base64Image,
        mimeType: 'image/jpeg',
      },
    };

    const result = await this.model.generateContent([prompt, image]);
    const response = await result.response;
    return response.text();
  }

  async analyzeImageWithStructuredOutput(
    base64Image: string,
    prompt: string,
    schema: object,
  ): Promise<StructuredOutput> {
    const image = {
      inlineData: {
        data: base64Image,
        mimeType: 'image/jpeg',
      },
    };

    const enhancedPrompt = `${prompt}

CRITICAL: You MUST respond with valid JSON that matches this exact schema:
${JSON.stringify(schema, null, 2)}

Remember:
- Output ONLY valid JSON, no markdown formatting
- Include all required fields from the schema
- Use null for missing values
- Ensure proper data types as specified in the schema`;

    try {
      const result = await this.model.generateContent([enhancedPrompt, image]);
      const response = await result.response;
      const text = response.text();

      const cleanedText = text
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      try {
        return JSON.parse(cleanedText) as StructuredOutput;
      } catch (parseError) {
        console.error('Error parsing Gemini response:', parseError);
        console.error('Raw response:', text);
        return {
          data: {},
          explanation: 'Error parsing response from Gemini',
        };
      }
    } catch (apiError) {
      console.error('Gemini API error:', apiError);
      return {
        data: {},
        explanation: apiError instanceof Error ? apiError.message : 'Unknown error',
      };
    }
  }

  async analyzeFile(
    fileBuffer: Buffer,
    mimeType: string,
    prompt: string,
    schema: object,
  ): Promise<StructuredOutput> {
    const file = {
      inlineData: {
        data: fileBuffer.toString('base64'),
        mimeType: mimeType,
      },
    };

    const enhancedPrompt = `${prompt}

CRITICAL: You MUST respond with valid JSON that matches this exact schema:
${JSON.stringify(schema, null, 2)}

Remember:
- Output ONLY valid JSON, no markdown formatting
- Include all required fields from the schema
- Use null for missing values
- Ensure proper data types as specified in the schema
- For dates, use ISO 8601 format (YYYY-MM-DD)
- For document confidence, provide a number between 0 and 100`;

    try {
      const result = await this.model.generateContent([enhancedPrompt, file]);
      const response = await result.response;
      const text = response.text();

      const cleanedText = text
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      try {
        return JSON.parse(cleanedText) as StructuredOutput;
      } catch (parseError) {
        console.error('Error parsing Gemini response:', parseError);
        console.error('Raw response:', text);
        return {
          data: {},
          explanation: 'Error parsing response from Gemini',
        };
      }
    } catch (apiError) {
      console.error('Gemini API error:', apiError);
      return {
        data: {},
        explanation: apiError instanceof Error ? apiError.message : 'Unknown error',
      };
    }
  }
}
