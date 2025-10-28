export interface ContextData {
  user: string;
  assistantPrompt: string;
  knowledgeBase: string;
  language: string;
  countryData?: string;
  profileData?: string;
  serviceRequestsData?: string;
  appointmentData?: string;
  notificationsData?: string;
  agentData?: string;
  adminManagerData?: string;
  superAdminData?: string;
  availableServicesData?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

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
    basicInfo?: Record<string, unknown>;
    contactInfo?: Record<string, unknown>;
    familyInfo?: Record<string, unknown>;
    professionalInfo?: Record<string, unknown>;
  };
  documentConfidence?: number;
  explanation: string;
}
