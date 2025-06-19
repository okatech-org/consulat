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
