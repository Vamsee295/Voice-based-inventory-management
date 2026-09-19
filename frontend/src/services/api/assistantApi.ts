import { apiClient } from './client';

export interface AssistantResponse {
  reply: string;
  intent: string;
  data?: Record<string, unknown> | null;
  action_required: boolean;
  spoken_text?: string | null;
}

export const assistantApi = {
  queryAssistant: async (message: string, conversationId?: string): Promise<AssistantResponse> => {
    return apiClient.post<AssistantResponse>('/assistant/query', {
      message,
      conversation_id: conversationId,
    });
  },
};
