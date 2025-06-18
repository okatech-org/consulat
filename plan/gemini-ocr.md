# Gemini API Integration Plan for Document Analysis

## Overview

This plan replaces OpenAI with Google's Gemini API for document analysis, allowing direct PDF processing without conversion to images.

## 1. Install Required Dependencies

```bash
npm install @google/generative-ai
```

## 2. Update Environment Variables

### File: `.env.local`

```env
# Remove or comment out:
# OPENAI_API_KEY=your_openai_key

# Add:
GOOGLE_GEMINI_API_KEY=your_gemini_api_key
```

### File: `src/lib/env/index.ts`

```typescript
// Update the server schema
server: {
  // ... existing fields ...
  // Remove: OPENAI_API_KEY: z.string().min(1),
  // Add:
  GOOGLE_GEMINI_API_KEY: z.string().min(1),
  // ... rest of the fields ...
},

// Update runtimeEnv
runtimeEnv: {
  // ... existing fields ...
  // Remove: OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  // Add:
  GOOGLE_GEMINI_API_KEY: process.env.GOOGLE_GEMINI_API_KEY,
  // ... rest of the fields ...
}
```

## 3. Create Gemini Vision Analyzer

### New File: `src/lib/ai/gemini-analyzer.ts`

````typescript
import { GoogleGenerativeAI } from '@google/generative-ai';
import { DocumentField } from '@/lib/utils';

export interface VisionAnalyzer {
  analyzeImage(base64Image: string, prompt: string): Promise<string>;
  analyzeImageWithStructuredOutput(
    base64Image: string,
    prompt: string,
    schema: object,
  ): Promise<StructuredOutput>;
  analyzeFile(
    fileBuffer: Buffer,
    mimeType: string,
    prompt: string,
    schema: object,
  ): Promise<StructuredOutput>;
}

export interface StructuredOutput {
  data: {
    basicInfo?: Record<string, any>;
    contactInfo?: Record<string, any>;
    familyInfo?: Record<string, any>;
    professionalInfo?: Record<string, any>;
  };
  documentConfidence?: number;
  explanation: string;
}

export class GeminiVisionAnalyzer implements VisionAnalyzer {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);
    // Use gemini-1.5-flash for faster processing or gemini-1.5-pro for better accuracy
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
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

      // Clean the response to ensure valid JSON
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

      // Clean the response to ensure valid JSON
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
````

## 4. Update Document Analysis Action

### File: `src/actions/documents.ts`

```typescript
'use server';

// Update imports - remove OpenAI, add Gemini
// import { OpenAI } from 'openai'; // Remove this
import sharp from 'sharp';
// import { pdfToImages } from '@/actions/convert'; // Remove this if only used for OCR
import { getCurrentUser } from '@/actions/user';
import { db } from '@/lib/prisma';
import { DocumentStatus, UserDocument, DocumentType } from '@prisma/client';
import { AppUserDocument } from '@/types';
import { checkAuth } from '@/lib/auth/action';
import { getTranslations } from 'next-intl/server';
import { notify } from '@/lib/services/notifications';
import { NotificationChannel } from '@/types/notifications';
import { env } from '@/lib/env/index';
import { ROUTES } from '@/schemas/routes';
import { documentSpecificFields, getFieldsForDocument } from '@/lib/document-fields';
import {
  GeminiVisionAnalyzer,
  VisionAnalyzer,
  StructuredOutput,
} from '@/lib/ai/gemini-analyzer';

// ... keep existing types and interfaces ...

// Remove the OpenAIVisionAnalyzer class entirely

// Update the fileToBuffer function to handle PDFs directly
async function fileToBuffer(file: File): Promise<{ buffer: Buffer; mimeType: string }> {
  const buffer = Buffer.from(await file.arrayBuffer());

  if (file.type === 'application/pdf') {
    // Return PDF directly without conversion
    return { buffer, mimeType: 'application/pdf' };
  }

  if (file.type.startsWith('image/')) {
    // Optimize images but keep original format
    const optimized = await optimizeImage(buffer);
    return { buffer: optimized, mimeType: file.type };
  }

  throw new Error(`Unsupported file type: ${file.type}`);
}

// Update analyzeDocuments function
export async function analyzeDocuments(
  documentsToAnalyze: Partial<Record<DocumentType, string>>,
  model: AIModel = 'gemini', // Change default to 'gemini'
): Promise<AnalysisResponse> {
  // For now, always use Gemini (you can add more models later)
  const visionAnalyzer = new GeminiVisionAnalyzer();

  const promises = Object.entries(documentsToAnalyze).map(async ([key, fileUrl]) => {
    const documentType = key as DocumentType;

    // Get document-specific schema and prompt
    const structuredOutputSchema = createStructuredOutputSchemaForDocument(documentType);
    const fields = getFieldsForDocument(documentType);
    const prompt = generatePrompt(fields);

    // Fetch file from URL
    const response = await fetch(fileUrl);
    const fileBlob = await response.blob();
    const file = new File([fileBlob], `${key}.${fileBlob.type.split('/')[1]}`, {
      type: fileBlob.type,
    });

    const { data: fileData, error } = await tryCatch(fileToBuffer(file));

    if (error || !fileData) {
      console.error(`Error processing ${key}:`, error);
      return null;
    }

    try {
      // Use Gemini's file analysis method
      const extractedData = await visionAnalyzer.analyzeFile(
        fileData.buffer,
        fileData.mimeType,
        prompt,
        structuredOutputSchema,
      );

      return {
        documentType: key,
        extractedData: extractedData,
      };
    } catch (analysisError) {
      console.error(`Error analyzing ${key}:`, analysisError);
      return null;
    }
  });

  try {
    const analysisResults = await Promise.all(promises);

    // Use type assertion to handle the undefined values
    const validResults = analysisResults.filter(
      (result) => result !== null,
    ) as DocumentAnalysisResult[];

    // Merge all extracted data together
    const mergedData: DocumentData = {
      basicInfo: {},
      contactInfo: {},
      familyInfo: {},
      professionalInfo: {},
    };

    validResults.forEach((result) => {
      const { extractedData } = result;
      const data = extractedData.data;

      if (!data) return;

      // Copy data from each category
      Object.keys(mergedData).forEach((category) => {
        const key = category as keyof DocumentData;
        if (data[key]) {
          mergedData[key] = {
            ...mergedData[key],
            ...data[key],
          };
        }
      });
    });

    return {
      success: true,
      results: validResults,
      mergedData,
    };
  } catch (error) {
    console.error('Document analysis error:', error);
    return {
      success: false,
      results: [],
      mergedData: {
        basicInfo: {},
        contactInfo: {},
        familyInfo: {},
        professionalInfo: {},
      },
      error:
        error instanceof Error ? error.message : 'Unknown error during document analysis',
    };
  }
}

// Update the AIModel type
type AIModel = 'claude' | 'gpt' | 'gemini';

// Keep all other existing functions unchanged
```

## 5. Update Security Headers (if needed)

### File: `src/lib/security/headers.ts`

```typescript
// Add Gemini API to connect-src if not already covered
'connect-src': `'self' https://generativelanguage.googleapis.com ... (other existing URLs)`,
```

## 6. Optional: Remove PDF Conversion Dependencies

If you're only using ConvertAPI for OCR and not for other purposes:

### Remove from `package.json`:

- Any ConvertAPI related packages

### Remove environment variable:

- `CONVERT_API_KEY` from `.env.local` and `src/lib/env/index.ts`

### Delete or archive:

- `src/actions/convert.ts` (if not used elsewhere)

## 7. Testing the Integration

Create a test file to verify the Gemini integration:

### File: `src/lib/ai/__tests__/gemini-analyzer.test.ts`

```typescript
import { GeminiVisionAnalyzer } from '../gemini-analyzer';
import fs from 'fs';
import path from 'path';

describe('GeminiVisionAnalyzer', () => {
  let analyzer: GeminiVisionAnalyzer;

  beforeAll(() => {
    analyzer = new GeminiVisionAnalyzer();
  });

  test('analyzes PDF directly', async () => {
    // Add your test PDF file
    const pdfBuffer = fs.readFileSync(path.join(__dirname, 'test-documents/sample.pdf'));

    const result = await analyzer.analyzeFile(
      pdfBuffer,
      'application/pdf',
      'Extract text from this document',
      { data: { basicInfo: { type: 'object' } } },
    );

    expect(result).toBeDefined();
    expect(result.data).toBeDefined();
  });
});
```

## 8. Migration Checklist

- [ ] Obtain Google Gemini API key from Google AI Studio
- [x] Update environment variables
- [x] Install @google/generative-ai package
- [x] Create GeminiVisionAnalyzer class
- [x] Update documents.ts to use Gemini
- [ ] Test with various document types (PDFs, images)
- [x] Update security headers if needed
- [x] Remove unused OpenAI dependencies
- [ ] Update any UI components that reference the AI model
- [ ] Test error handling and edge cases

## Benefits of This Integration

1. **Direct PDF Processing**: No need to convert PDFs to images
2. **Cost Efficiency**: Gemini pricing is competitive, especially for high-volume processing
3. **Better OCR**: Gemini has excellent multilingual OCR capabilities
4. **Larger Context**: Gemini can handle larger documents in a single request
5. **Faster Processing**: Eliminates the PDF conversion step

## Notes

- Gemini supports various file types: PDF, images (JPEG, PNG, GIF, WebP), and more
- Maximum file size is 20MB per file
- Consider using gemini-1.5-pro for better accuracy or gemini-1.5-flash for faster/cheaper processing
- The structured output approach uses prompt engineering since Gemini doesn't have native structured output like GPT-4

## Implementation Status

The Gemini API integration has been successfully implemented with the following components:

- ✅ Environment configuration updated in `src/lib/env/index.ts`
- ✅ Google Generative AI package installed
- ✅ `GeminiVisionAnalyzer` class created in `src/lib/ai/gemini-analyzer.ts`
- ✅ Document analysis action updated in `src/actions/documents.ts`
- ✅ Security headers updated to allow Gemini API connections
- ✅ OpenAI dependencies removed from document analysis code
- ✅ Test file created at `src/lib/ai/__tests__/gemini-analyzer.test.ts`

### Next Steps

1. Obtain a Google Gemini API key from Google AI Studio
2. Test the integration with various document types
3. Update any UI components that reference the AI model
4. Conduct thorough error handling and edge case testing
