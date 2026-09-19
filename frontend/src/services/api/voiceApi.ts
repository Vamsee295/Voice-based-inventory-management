/**
 * Voice API client — calls the backend voice pipeline.
 * NEVER calls Groq directly — all AI is backend-side.
 */
import { apiClient } from './client';

export interface TranscribeResponse {
  text: string;
  language: string;
  duration_ms: number;
}

export interface StructuredCommand {
  intent: 'STOCK_IN' | 'STOCK_OUT' | 'STOCK_LOOKUP' | 'LOW_STOCK_QUERY' | 'EXPIRY_QUERY' | 'TRANSACTION_QUERY' | 'UNKNOWN';
  product_query: string | null;
  quantity: number | null;
  unit: string | null;
  language: string | null;
  confidence: number;
  clarification_required: boolean;
  clarification_reason: string | null;
  rag_context_used?: string | null;
}

export interface ProductSummary {
  id: string;
  name: string;
  sku: string;
  base_unit: string;
  current_stock: number;
  category: string | null;
}

export interface PreviewResponse {
  status: 'READY' | 'PRODUCT_NOT_FOUND' | 'AMBIGUOUS_PRODUCT' | 'MISSING_QUANTITY' | 'INVALID_UNIT' | 'INSUFFICIENT_STOCK' | 'QUERY_RESULT' | 'CLARIFICATION_REQUIRED' | 'UNKNOWN_INTENT';
  operation_id: string;
  product?: ProductSummary | null;
  quantity?: number | null;
  input_unit?: string | null;
  normalized_quantity?: number | null;
  base_unit?: string | null;
  current_stock?: number | null;
  projected_stock?: number | null;
  tune_note?: string | null;
  validation?: string | null;
  message?: string | null;
  candidates?: Array<{id: string; name: string; sku: string}> | null;
}

export interface ConfirmResponse {
  success: boolean;
  transaction_id: string;
  product_name: string;
  previous_stock: number;
  new_stock: number;
  base_unit: string;
  source: string;
  message: string;
}

export const voiceApi = {
  /**
   * Upload audio blob → Groq Whisper → transcript.
   * Returns transcript text and detected language.
   */
  transcribeAudio: async (blob: Blob, filename: string = 'recording.webm'): Promise<TranscribeResponse> => {
    const formData = new FormData();
    formData.append('audio', blob, filename);

    const API_BASE = 
      (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_BASE_URL) ||
      (typeof process !== 'undefined' && process.env?.VITE_API_BASE_URL) ||
      'http://localhost:8000/api';

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(`${API_BASE}/voice/transcribe`, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (!response.ok) {
        const err = await response.json().catch(() => ({ detail: 'Upload failed' }));
        throw new Error(err.detail || 'Audio upload failed');
      }
      return response.json();
    } catch (err: any) {
      clearTimeout(timer);
      if (err.name === 'AbortError') {
        throw new Error('Transcription timed out. Please try again.');
      }
      throw err;
    }
  },

  /**
   * Transcript (voice or typed) → RAG + Groq LLM → structured command.
   */
  interpretCommand: async (text: string): Promise<StructuredCommand> => {
    return apiClient.post<StructuredCommand>('/voice/interpret', { text });
  },

  /**
   * Structured command → product resolution + TUNE + validation → preview.
   * No mutations happen here.
   */
  previewCommand: async (command: StructuredCommand, operationId?: string, productId?: string): Promise<PreviewResponse> => {
    return apiClient.post<PreviewResponse>('/voice/preview', {
      command,
      operation_id: operationId,
      product_id: productId,
    });
  },

  /**
   * ONLY mutation endpoint — confirms and commits to inventory.
   */
  confirmCommand: async (params: {
    operation_id: string;
    product_id: string;
    quantity_delta: number;
    source?: string;
  }): Promise<ConfirmResponse> => {
    return apiClient.post<ConfirmResponse>('/voice/confirm', {
      ...params,
      source: params.source || 'VOICE',
    });
  },
};
