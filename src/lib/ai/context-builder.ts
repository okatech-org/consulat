import { ContextData } from '@/lib/ai/types';

export class ContextBuilder {
  static buildContext(contextData: ContextData): string {
    let context = '';

    // Add assistant prompt
    context += `Role setting: ${contextData.assistantPrompt}\n`;

    // Add language
    context += `Respond to the user in the following language by default unless he talk in another one : ${contextData.language}\n`;

    context += `Current user datas: ${contextData.user}\n`;

    // Parse country data if available
    if (contextData.countryData) {
      context += `---\nUser related country datas: ${contextData.countryData}\n`;
    }

    // Parse profile data if available
    if (contextData.profileData) {
      context += `---\nUser consular profile datas: ${contextData.profileData}\n`;
    }

    // Parse service requests data if available
    if (contextData.serviceRequestsData) {
      context += `---\nUser request service requests: ${contextData.serviceRequestsData}\n`;
    }

    // Parse appointment data if available
    if (contextData.appointmentData) {
      context += `---\nUser appointments: ${contextData.appointmentData}\n`;
    }

    // Parse notifications data if available
    if (contextData.notificationsData) {
      context += `---\nUser Notifications: ${contextData.notificationsData}\n`;
    }

    // Parse agent data if available
    if (contextData.agentData) {
      context += `---\nAgent Data: ${contextData.agentData}\n`;
    }

    // Parse admin manager data if available
    if (contextData.adminManagerData) {
      context += `---\nAdmin Manager Data: ${contextData.adminManagerData}\n`;
    }

    // Parse super admin data if available
    if (contextData.superAdminData) {
      context += `---\nSuper Admin Data: ${contextData.superAdminData}\n`;
    }

    // Add knowledge base context
    context += `---\nKnowledge Base:\n${contextData.knowledgeBase}`;

    return context;
  }
}
