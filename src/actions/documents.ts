'use server';

import { OpenAI } from 'openai';
import sharp from 'sharp';
import { pdfToImages } from '@/actions/convert';
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
import { documentSpecificFields } from '@/lib/document-fields';

import {
  BasicInfoFormData,
  ContactInfoFormData,
  FamilyInfoFormData,
  ProfessionalInfoFormData,
} from '@/schemas/registration';

// Types
interface DocumentAnalysisResult {
  documentType: string;
  extractedData: StructuredOutput;
}

interface DocumentData {
  basicInfo?: Partial<BasicInfoFormData>;
  contactInfo?: Partial<ContactInfoFormData>;
  familyInfo?: Partial<FamilyInfoFormData>;
  professionalInfo?: Partial<ProfessionalInfoFormData>;
}

interface AnalysisResponse {
  success: boolean;
  results: DocumentAnalysisResult[];
  mergedData: DocumentData;
  error?: string;
}

interface StructuredOutput {
  data: {
    basicInfo?: Partial<BasicInfoFormData>;
    contactInfo?: Partial<ContactInfoFormData>;
    familyInfo?: Partial<FamilyInfoFormData>;
    professionalInfo?: Partial<ProfessionalInfoFormData>;
  };
  documentConfidence?: number;
  explanation: string;
  [key: string]: unknown; // Add index signature to satisfy Record<string, unknown>
}

/**
 * Generate a structured output schema specific to the document type
 */
function createStructuredOutputSchemaForDocument(
  documentType: DocumentType,
): Record<string, unknown> {
  // Base schema structure that will be present for all document types
  const baseSchema = {
    type: 'object',
    properties: {
      data: {
        type: 'object',
        properties: {},
        additionalProperties: false,
      },
      documentConfidence: {
        type: 'number',
        description: 'Confidence score of the extraction (0-100)',
        minimum: 0,
        maximum: 100,
      },
      explanation: {
        type: 'string',
        description: 'Explanation of what was analyzed and extracted from the document',
      },
    },
    required: ['data', 'explanation'],
    additionalProperties: false,
  };

  // Define which sections should be included for each document type
  const sectionsByDocumentType: Partial<
    Record<
      DocumentType,
      Array<'basicInfo' | 'contactInfo' | 'familyInfo' | 'professionalInfo'>
    >
  > = {
    [DocumentType.PASSPORT]: ['basicInfo'],
    [DocumentType.BIRTH_CERTIFICATE]: ['basicInfo', 'familyInfo'],
    [DocumentType.RESIDENCE_PERMIT]: ['basicInfo', 'professionalInfo'],
    [DocumentType.PROOF_OF_ADDRESS]: ['contactInfo'],
    // Add default empty arrays for other document types
    [DocumentType.IDENTITY_CARD]: ['basicInfo'],
    [DocumentType.MARRIAGE_CERTIFICATE]: ['familyInfo'],
    [DocumentType.DEATH_CERTIFICATE]: ['familyInfo'],
    [DocumentType.DIVORCE_DECREE]: ['familyInfo'],
    [DocumentType.NATIONALITY_CERTIFICATE]: ['basicInfo'],
    [DocumentType.OTHER]: [],
    [DocumentType.VISA_PAGES]: ['basicInfo'],
    [DocumentType.EMPLOYMENT_PROOF]: ['professionalInfo'],
    [DocumentType.NATURALIZATION_DECREE]: ['basicInfo'],
    [DocumentType.IDENTITY_PHOTO]: ['basicInfo'],
    [DocumentType.CONSULAR_CARD]: ['basicInfo'],
  };

  // Section schemas
  const sectionSchemas = {
    basicInfo: {
      type: 'object',
      properties: {
        firstName: { type: 'string', description: 'First name of the person' },
        lastName: { type: 'string', description: 'Last name of the person' },
        gender: {
          type: 'string',
          enum: ['MALE', 'FEMALE'],
          description:
            'Gender of the person, must be MALE or FEMALE. If not specified, use MALE.',
        },
        acquisitionMode: {
          type: 'string',
          enum: ['BIRTH', 'NATURALIZATION', 'MARRIAGE', 'OTHER'],
          description: 'Method of nationality acquisition. If not specified, use BIRTH.',
        },
        birthDate: {
          type: 'string',
          description: 'Date of birth in YYYY-MM-DD format',
        },
        birthPlace: {
          type: 'string',
          description: 'Place of birth (city name)',
        },
        birthCountry: {
          type: 'string',
          description: 'Country of birth (e.g. GA, FR)',
        },
        passportNumber: {
          type: 'string',
          description: 'Passport number as shown on document',
        },
        passportIssueDate: {
          type: 'string',
          description: 'Date of passport issue in YYYY-MM-DD format',
        },
        passportExpiryDate: {
          type: 'string',
          description: 'Date of passport expiry in YYYY-MM-DD format',
        },
        passportIssueAuthority: {
          type: 'string',
          description: 'Authority that issued the passport',
        },
        nationality: {
          type: 'string',
          description: 'Nationality of the person (e.g. GA for Gabonese)',
        },
      },
      additionalProperties: false,
    },
    contactInfo: {
      type: 'object',
      properties: {
        address: {
          type: 'object',
          properties: {
            firstLine: {
              type: 'string',
              description: 'First line of address',
            },
            secondLine: {
              type: 'string',
              description: 'Second line of address',
            },
            city: {
              type: 'string',
              description: 'City name',
            },
            zipCode: {
              type: 'string',
              description: 'Postal/ZIP code',
            },
          },
          additionalProperties: false,
        },
      },
      additionalProperties: false,
    },
    familyInfo: {
      type: 'object',
      properties: {
        maritalStatus: {
          type: 'string',
          enum: ['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED', 'SEPARATED'],
          description: 'Marital status. If not specified, use SINGLE.',
        },
        fatherFullName: {
          type: 'string',
          description: "Father's full name",
        },
        motherFullName: {
          type: 'string',
          description: "Mother's full name",
        },
        spouseFullName: {
          type: 'string',
          description: "Spouse's full name, if married",
        },
      },
      additionalProperties: false,
    },
    professionalInfo: {
      type: 'object',
      properties: {
        workStatus: {
          type: 'string',
          enum: ['EMPLOYEE', 'ENTREPRENEUR', 'UNEMPLOYED', 'RETIRED', 'STUDENT', 'OTHER'],
          description:
            'Current work/employment status. If not specified, use UNEMPLOYED.',
        },
        profession: {
          type: 'string',
          description: 'Current profession or occupation',
        },
        employer: {
          type: 'string',
          description: 'Name of employer organization',
        },
        employerAddress: {
          type: 'string',
          description: 'Address of employer',
        },
      },
      additionalProperties: false,
    },
  };

  // Add relevant sections to the schema based on document type
  const relevantSections = sectionsByDocumentType[documentType] || [];
  const dataProperties = baseSchema.properties.data.properties as Record<string, unknown>;

  relevantSections.forEach((section) => {
    dataProperties[section] = sectionSchemas[section];
  });

  // Filter properties in each section based on documentSpecificFields
  const specificFields = documentSpecificFields[documentType] || [];

  // For each section, check if there are specific fields to include
  relevantSections.forEach((section) => {
    const sectionSchema = dataProperties[section] as {
      properties: Record<string, unknown>;
    };
    const filteredProperties: Record<string, unknown> = {};

    const sectionProperties = sectionSchema.properties;

    // For basicInfo with nested properties like passport details
    if (section === 'basicInfo') {
      for (const field in sectionProperties) {
        // Check if this field or a nested field should be included
        const shouldInclude = specificFields.some((specificField) => {
          // Direct match
          if (specificField === field) return true;
          // For nested fields like passportNumber, passportIssueDate
          if (field.startsWith('passport') && specificField === 'passport') return true;
          return false;
        });

        if (shouldInclude) {
          filteredProperties[field] = sectionProperties[field];
        }
      }
      sectionSchema.properties = filteredProperties;
    }
    // For other simpler sections
    else {
      for (const field in sectionProperties) {
        // Safely check if the field is in the specificFields array without type casting
        const fieldStr = field as string;
        if (specificFields.some((f) => f === fieldStr)) {
          filteredProperties[field] = sectionProperties[field];
        }
      }
      sectionSchema.properties = filteredProperties;
    }
  });

  return baseSchema;
}

/**
 * Generate a document-specific prompt
 */
function generatePromptForDocument(documentType: DocumentType): string {
  // Common part of the prompt that applies to all document types
  const basePrompt = `Please analyze this document and extract specific information.
You are analyzing a Gabonese document, which may include handwritten text. Pay special attention to text recognition and interpretation.

When analyzing handwritten text, follow these guidelines:

1. Text Recognition Strategy:
   - Look for both cursive and print handwriting
   - Consider different handwriting styles
   - Pay attention to character spacing and alignment
   - Look for text in designated fields and margins
   - Check for crossed-out text and corrections

2. Name Analysis:
   - Names may be handwritten with varying legibility
   - Accents might be missing or varied
   - Match against common Gabonese names
   - Consider regional naming patterns and traditions
   - Look for family name prefixes (e.g., M', N', Ondo, Nze)

3. Number Recognition:
   - Pay attention to date formats
   - Be careful with 1/7, 4/9, 3/8 similarities in handwriting
   - Check for numerical corrections or overwritten numbers`;

  // Document-specific guidance
  const documentSpecificGuidance: Partial<Record<DocumentType, string>> = {
    [DocumentType.PASSPORT]: `
This is a PASSPORT document. Focus on extracting:
- Personal details (first name, last name, gender)
- Birth information (date, place, country)
- Passport details (number, issue date, expiry date, issuing authority)
- Nationality

Look for these details in standardized fields on the passport. Check both the main information page and the machine-readable zone (MRZ) at the bottom.`,

    [DocumentType.BIRTH_CERTIFICATE]: `
This is a BIRTH CERTIFICATE. Focus on extracting:
- Person's details (first name, last name)
- Birth information (date, place, country)
- Parents' information (father's full name, mother's full name)

Birth certificates often have a formal structure with fields for each piece of information. Pay attention to the parent names section which is crucial for identification.`,

    [DocumentType.RESIDENCE_PERMIT]: `
This is a RESIDENCE PERMIT. Focus on extracting:
- Personal details (first name, last name)
- Professional information (work status, profession, employer)

Look for sections that indicate the person's occupation or professional status. This might be in a dedicated field or mentioned in other parts of the document.`,

    [DocumentType.PROOF_OF_ADDRESS]: `
This is a PROOF OF ADDRESS document. Focus on extracting:
- Address information (street address, city, postal code)

This could be a utility bill, bank statement, or official correspondence. Look for the recipient address near the top of the document, often formatted as multiple lines.`,

    [DocumentType.IDENTITY_CARD]: `
This is an IDENTITY CARD. Focus on extracting:
- Personal details (first name, last name, gender)
- Birth information (date, place, country)
- Identity card details (number, issue date, expiry date)`,

    [DocumentType.OTHER]: `
This is an unspecified document type. Extract any relevant personal information you can find.`,
  };

  // Special cases handling
  const specialCasesPrompt = `
4. Special Cases:
   - For unclear characters, consider common local writing patterns
   - For partially obscured text, don't make assumptions
   - For overlapping text, try to separate based on ink color or writing style
   - For faded text, enhance contrast in your analysis
   - For stamps overlaying text, try to read through or around the stamp

Analyze the document and extract ONLY the requested information, placing extracted data in the provided schema. DO NOT include information that isn't explicitly visible in the document.`;

  // Use the specific guidance if available, otherwise use a generic one
  const specificGuidance =
    documentSpecificGuidance[documentType] ||
    `
This document needs analysis. Extract any relevant personal information visible in the document.`;

  return `${basePrompt}${specificGuidance}${specialCasesPrompt}`;
}

async function optimizeImage(buffer: Buffer): Promise<Buffer> {
  return await sharp(buffer)
    .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer();
}

async function fileToImages(file: File): Promise<Buffer[]> {
  if (file.type === 'application/pdf') {
    return await pdfToImages(file);
  }

  if (file.type.startsWith('image/')) {
    const buffer = await file.arrayBuffer();
    const optimized = await optimizeImage(Buffer.from(buffer));
    return [optimized];
  }

  throw new Error(`Unsupported file type: ${file.type}`);
}

export async function analyzeDocuments(
  documentsToAnalyze: Partial<Record<DocumentType, string>>,
  model: AIModel = 'gpt',
): Promise<AnalysisResponse> {
  try {
    const visionAnalyzer =
      model === 'gpt' ? new OpenAIVisionAnalyzer() : new OpenAIVisionAnalyzer();

    const analysisResults = await Promise.all(
      Object.entries(documentsToAnalyze).map(async ([key, fileUrl]) => {
        const documentType = key as DocumentType;

        try {
          // Get document-specific schema and prompt
          const structuredOutputSchema =
            createStructuredOutputSchemaForDocument(documentType);
          const prompt = generatePromptForDocument(documentType);

          // Récupérer le fichier depuis l'URL
          const response = await fetch(fileUrl);
          const fileBlob = await response.blob();
          const file = new File([fileBlob], `${key}.${fileBlob.type.split('/')[1]}`, {
            type: fileBlob.type,
          });

          const images = await fileToImages(file);

          const documentResults = await Promise.all(
            images.slice(0, 1).map(async (imageBuffer) => {
              const base64 = imageBuffer.toString('base64');
              const extractedData = await visionAnalyzer.analyzeImageWithStructuredOutput(
                base64,
                prompt,
                structuredOutputSchema,
              );

              return {
                documentType: key,
                extractedData: extractedData,
              };
            }),
          );

          return documentResults[0]; // We're only using the first image for now
        } catch (error) {
          console.error(`Error analyzing ${key}:`, error);
          return null;
        }
      }),
    );

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

type AIModel = 'claude' | 'gpt';

interface VisionAnalyzer {
  analyzeImage(base64Image: string, prompt: string): Promise<string>;
  analyzeImageWithStructuredOutput(
    base64Image: string,
    prompt: string,
    schema: object,
  ): Promise<StructuredOutput>;
}

class OpenAIVisionAnalyzer implements VisionAnalyzer {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async analyzeImage(base64Image: string, prompt: string): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: 'gpt-4o-latest',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
                detail: 'high',
              },
            },
          ],
        },
      ],
    });

    return response.choices[0]?.message.content || '';
  }

  async analyzeImageWithStructuredOutput(
    base64Image: string,
    prompt: string,
    schema: object,
  ): Promise<StructuredOutput> {
    try {
      // Use the standard response format without a custom schema
      const response = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `${prompt}\n\nOutput your findings in JSON format matching the following schema: ${JSON.stringify(schema)}.`,
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                  detail: 'high',
                },
              },
            ],
          },
        ],
        response_format: { type: 'json_object' },
      });

      // The content may be undefined
      const content = response.choices[0]?.message?.content || '{}';

      try {
        return JSON.parse(content) as StructuredOutput;
      } catch (parseError) {
        console.error('Error parsing JSON response:', parseError);
        return {
          data: {},
          explanation: 'Error parsing response from analysis model',
        };
      }
    } catch (apiError) {
      console.error('OpenAI API error:', apiError);
      return {
        data: {},
        explanation:
          apiError instanceof Error ? apiError.message : 'Unknown error during analysis',
      };
    }
  }
}

export async function getUserDocumentsList(): Promise<AppUserDocument[]> {
  try {
    const user = await getCurrentUser();
    if (!user) return [];

    const documents = await db.userDocument.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    return documents.map((document) => ({
      ...document,
      metadata: JSON.parse(document.metadata as string),
    }));
  } catch (error) {
    console.error('Error fetching user components:', error);
    return [];
  }
}

export async function getUserProfileDocuments(userId: string) {
  const profileWithDocument = await db.profile.findUnique({
    where: { userId },
    include: {
      passport: true,
      birthCertificate: true,
      residencePermit: true,
      addressProof: true,
      identityPicture: true,
    },
  });

  if (!profileWithDocument) return [];

  const documents = [
    profileWithDocument.passport,
    profileWithDocument.birthCertificate,
    profileWithDocument.residencePermit,
    profileWithDocument.addressProof,
  ];

  return documents.filter(Boolean) as UserDocument[];
}

interface ValidateDocumentInput {
  documentId: string;
  status: DocumentStatus;
  notes?: string;
}

export async function validateDocument(input: ValidateDocumentInput) {
  const authResult = await checkAuth(['ADMIN', 'SUPER_ADMIN', 'MANAGER', 'AGENT']);
  const t = await getTranslations('messages.documents');

  const updatedDocument = await db.userDocument.update({
    where: { id: input.documentId },
    data: {
      status: input.status,
      metadata: {
        ...(input.notes && { validationNotes: input.notes }),
        validatedBy: authResult.user.id,
        validatedAt: new Date().toISOString(),
      },
    },
    include: {
      user: true,
    },
  });

  // Send notification if document is rejected
  if (input.status === 'REJECTED' && updatedDocument.user) {
    await notify({
      userId: updatedDocument.user.id,
      type: 'DOCUMENT_REJECTED',
      title: t('notifications.rejected.title'),
      message: input.notes
        ? t('notifications.rejected.message_with_notes', { notes: input.notes })
        : t('notifications.rejected.message_default'),
      channels: [NotificationChannel.APP, NotificationChannel.EMAIL],
      email: updatedDocument.user.email || undefined,
      priority: 'high',
      actions: [
        {
          label: t('notifications.actions.view_documents'),
          url: `${env.NEXT_PUBLIC_URL}${ROUTES.user.documents}`,
          primary: true,
        },
      ],
      metadata: {
        documentId: updatedDocument.id,
        documentType: updatedDocument.type,
        notes: input.notes,
      },
    });
  }

  return updatedDocument;
}
