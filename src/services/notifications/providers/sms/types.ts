export interface SMSMessage {
  to: string;
  body: string;
  from?: string;
}

export interface SMSResponse {
  providerId: string;
  messageId: string;
  status: 'sent' | 'queued' | 'failed';
  errorMessage?: string;
}

export interface SMSProvider {
  sendSMS(message: SMSMessage): Promise<SMSResponse>;
}
