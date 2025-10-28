import { ContextData } from './types';

export class ContextBuilder {
  static buildContext(contextData: ContextData): string {
    let context = '';

    context += `Role setting: ${contextData.assistantPrompt}\n`;

    context += `Respond to the user in the following language by default unless he talk in another one : ${contextData.language}\n`;

    context += `Current user datas: ${contextData.user}\n`;

    if (contextData.countryData) {
      context += `---\nUser related country datas: ${contextData.countryData}\n`;
    }

    if (contextData.profileData) {
      context += `---\nUser consular profile datas: ${contextData.profileData}\n`;
    }

    if (contextData.serviceRequestsData) {
      context += `---\nUser request service requests: ${contextData.serviceRequestsData}\n`;
    }

    if (contextData.appointmentData) {
      context += `---\nUser appointments: ${contextData.appointmentData}\n`;
    }

    if (contextData.notificationsData) {
      context += `---\nUser Notifications: ${contextData.notificationsData}\n`;
    }

    if (contextData.agentData) {
      context += `---\nAgent Data: ${contextData.agentData}\n`;
    }

    if (contextData.adminManagerData) {
      context += `---\nAdmin Manager Data: ${contextData.adminManagerData}\n`;
    }

    if (contextData.superAdminData) {
      context += `---\nSuper Admin Data: ${contextData.superAdminData}\n`;
    }

    context += `---\nKnowledge Base:\n${contextData.knowledgeBase}`;

    return context;
  }
}
