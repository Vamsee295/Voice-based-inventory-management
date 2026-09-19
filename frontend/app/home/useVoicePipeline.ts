'use client';

import { useState, useRef, useCallback } from 'react';
import { voiceApi, StructuredCommand, PreviewResponse, ConfirmResponse } from '../../src/services/api/voiceApi';

export type VoiceState =
  | 'IDLE'
  | 'RECORDING'
  | 'UPLOADING'
  | 'TRANSCRIBING'
  | 'UNDERSTANDING'
  | 'RETRIEVING_CONTEXT'
  | 'VERIFYING'
  | 'READY'
  | 'COMMITTING'
  | 'COMMITTED'
  | 'ERROR';

/** Structured error with user-facing message + optional error code */
export interface VoicePipelineError {
  code: string;
  message: string;
}

export interface VoicePipelineResult {
  transcript?: string;
  errorMessage?: string;
  errorCode?: string;
  command?: StructuredCommand;
  preview?: PreviewResponse;
  confirmed?: ConfirmResponse;
}

// ---------------------------------------------------------------------------
// Human-readable messages keyed by backend status/error codes
// ---------------------------------------------------------------------------
const PREVIEW_STATUS_MESSAGES: Record<string, string> = {
  PRODUCT_NOT_FOUND:
    "I couldn't identify that product. Try using the product name or SKU.",
  AMBIGUOUS_PRODUCT:
    'I found multiple matching products. Please select one below.',
  MISSING_QUANTITY:
    'Please specify how much stock was added or removed.',
  INVALID_UNIT:
    'The specified trade unit is not configured for this product.',
  INSUFFICIENT_STOCK:
    'The requested stock-out exceeds the available inventory.',
  CLARIFICATION_REQUIRED:
    'Could not understand the command. Please try speaking or typing clearly.',
  UNKNOWN_INTENT:
    'Could not understand the command. Please try speaking or typing clearly.',
  QUERY_RESULT:
    'This appears to be a query. Use the Conversational Assistant for read-only queries.',
};

function mapPreviewStatusToError(preview: PreviewResponse): string {
  if (preview.message) return preview.message;
  return (
    PREVIEW_STATUS_MESSAGES[preview.status] ??
    'Could not understand the command. Please try speaking or typing clearly.'
  );
}

function mapApiError(err: any): string {
  const msg: string = err?.message ?? '';
  if (!msg) return 'An unexpected error occurred. Please try again.';

  if (msg.includes('timed out') || msg.includes('AbortError'))
    return 'Voice intelligence took too long to respond. Please try again.';
  if (msg.includes('503') || msg.includes('unavailable'))
    return 'Voice intelligence service is temporarily unavailable. Please try again in a moment.';
  if (msg.includes('401') || msg.includes('Unauthorized'))
    return 'Session expired. Please sign in again.';
  if (msg.includes('fetch') || msg.includes('Network') || msg.includes('connect'))
    return 'Could not reach the VoiceMate server. Please check your network connection.';

  // Return trimmed server message if it's short enough to be human-readable
  if (msg.length < 200) return msg;
  return 'An error occurred while processing your command. Please try again.';
}

// ---------------------------------------------------------------------------
export function useVoicePipeline() {
  const [state, setState] = useState<VoiceState>('IDLE');
  const [result, setResult] = useState<VoicePipelineResult>({});

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  // Keep track of whether the last input came from text so we can re-focus on reset
  const lastInputWasTypedRef = useRef(false);

  const checkMicSupport = useCallback((): boolean => {
    if (typeof window === 'undefined') return false;
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }, []);

  // ---------------------------------------------------------------------------
  // reset — returns to IDLE, clears all state
  // ---------------------------------------------------------------------------
  const reset = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try { mediaRecorderRef.current.stop(); } catch { /* ignore */ }
    }
    setState('IDLE');
    setResult({});
  }, []);

  // ---------------------------------------------------------------------------
  // processPipeline — shared by both voice and typed paths
  // ---------------------------------------------------------------------------
  const processPipeline = useCallback(async (transcriptText: string) => {
    try {
      // UNDERSTANDING: call interpret endpoint (RAG + Groq LLM)
      setState('UNDERSTANDING');
      let command: StructuredCommand;
      try {
        command = await voiceApi.interpretCommand(transcriptText);
      } catch (err: any) {
        setState('ERROR');
        setResult((prev) => ({
          ...prev,
          errorCode: 'LLM_PARSE_FAILED',
          errorMessage: mapApiError(err),
        }));
        return;
      }

      setResult((prev) => ({ ...prev, command }));

      // Check if LLM explicitly returned UNKNOWN / clarification_required
      if (
        command.intent === 'UNKNOWN' ||
        (command.clarification_required && !command.product_query)
      ) {
        setState('ERROR');
        setResult((prev) => ({
          ...prev,
          errorCode: 'LLM_PARSE_FAILED',
          errorMessage:
            command.clarification_reason ||
            'Could not understand the command. Please try speaking or typing clearly.',
        }));
        return;
      }

      // VERIFYING: call preview endpoint (deterministic product resolution + TUNE + validation)
      setState('VERIFYING');
      let preview: PreviewResponse;
      try {
        preview = await voiceApi.previewCommand(command);
      } catch (err: any) {
        setState('ERROR');
        setResult((prev) => ({
          ...prev,
          errorCode: 'PREVIEW_FAILED',
          errorMessage: mapApiError(err),
        }));
        return;
      }

      setResult((prev) => ({ ...prev, preview }));

      // Any non-READY preview status is a semantic error / clarification needed
      if (preview.status !== 'READY') {
        // AMBIGUOUS_PRODUCT is a special case — show candidates picker, keep in READY
        if (preview.status === 'AMBIGUOUS_PRODUCT') {
          setState('READY');
          return;
        }
        // All other non-READY statuses → ERROR state
        setState('ERROR');
        setResult((prev) => ({
          ...prev,
          errorCode: preview.status,
          errorMessage: mapPreviewStatusToError(preview),
        }));
        return;
      }

      setState('READY');
    } catch (err: any) {
      // Catch-all for any unexpected throws
      console.error('[VoicePipeline] Unexpected error in processPipeline:', err);
      setState('ERROR');
      setResult((prev) => ({
        ...prev,
        errorCode: 'UNEXPECTED',
        errorMessage: mapApiError(err),
      }));
    }
  }, []);

  // ---------------------------------------------------------------------------
  // selectCandidate — after AMBIGUOUS_PRODUCT disambiguation
  // ---------------------------------------------------------------------------
  const selectCandidate = useCallback(
    async (candidate: { id: string; name: string; sku: string }) => {
      if (!result.command) return;
      try {
        setState('VERIFYING');
        const preview = await voiceApi.previewCommand(
          result.command,
          result.preview?.operation_id,
          candidate.id
        );
        setResult((prev) => ({ ...prev, preview }));

        if (preview.status !== 'READY') {
          setState('ERROR');
          setResult((prev) => ({
            ...prev,
            errorCode: preview.status,
            errorMessage: mapPreviewStatusToError(preview),
          }));
          return;
        }
        setState('READY');
      } catch (err: any) {
        console.error('[VoicePipeline] Candidate selection error:', err);
        setState('ERROR');
        setResult((prev) => ({
          ...prev,
          errorCode: 'CANDIDATE_FAILED',
          errorMessage: err.message || 'Failed to resolve selected product.',
        }));
      }
    },
    [result.command, result.preview?.operation_id]
  );

  // ---------------------------------------------------------------------------
  // processTypedCommand — text → same pipeline as voice
  // ---------------------------------------------------------------------------
  const processTypedCommand = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      lastInputWasTypedRef.current = true;
      setResult({ transcript: trimmed });
      await processPipeline(trimmed);
    },
    [processPipeline]
  );

  // ---------------------------------------------------------------------------
  // startListening — microphone → Whisper → same pipeline
  // ---------------------------------------------------------------------------
  const startListening = useCallback(async () => {
    if (!checkMicSupport()) {
      setState('ERROR');
      setResult({
        errorCode: 'AUDIO_UNSUPPORTED',
        errorMessage:
          'Microphone is not supported in this browser. Please type your command instead.',
      });
      return;
    }

    lastInputWasTypedRef.current = false;

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err: any) {
      setState('ERROR');
      setResult({
        errorCode: 'MIC_PERMISSION_DENIED',
        errorMessage:
          err.name === 'NotAllowedError'
            ? 'Microphone access was denied. Please allow microphone access in your browser or type your command instead.'
            : 'Could not access microphone: ' + (err.message || 'Unknown error'),
      });
      return;
    }

    audioChunksRef.current = [];

    // Detect best supported MIME type robustly
    let mimeType = '';
    if (typeof MediaRecorder !== 'undefined') {
      const types = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/ogg',
        'audio/aac'
      ];
      for (const t of types) {
        if (MediaRecorder.isTypeSupported(t)) {
          mimeType = t;
          break;
        }
      }
    }

    let recorder: MediaRecorder;
    try {
      recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
    } catch (err: any) {
      console.warn('[VoicePipeline] First MediaRecorder initialization failed:', err);
      try {
        // Fallback: let the browser pick its default without specifying mimeType
        recorder = new MediaRecorder(stream);
      } catch (fallbackErr: any) {
        console.error('[VoicePipeline] Fallback MediaRecorder initialization failed:', fallbackErr);
        setState('ERROR');
        setResult({
          errorCode: 'MIC_DEVICE_UNAVAILABLE',
          errorMessage: 'Voice recording could not be started in your browser.',
        });
        return;
      }
    }

    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        audioChunksRef.current.push(e.data);
      }
    };

    recorder.onstop = async () => {
      console.log('[VoicePipeline] Recording stopped. Processing chunks...');
      stream.getTracks().forEach((track) => track.stop());

      // Use the actual mimeType the recorder decided on
      const actualMimeType = recorder.mimeType || 'audio/webm';
      const audioBlob = new Blob(audioChunksRef.current, { type: actualMimeType });
      
      console.log(`[VoicePipeline] Audio blob created: ${(audioBlob.size / 1024).toFixed(2)} KB, type: ${actualMimeType}`);

      if (audioBlob.size < 100) {
        setState('ERROR');
        setResult({
          errorCode: 'AUDIO_EMPTY',
          errorMessage: 'No audio was captured. Please try speaking again.',
        });
        return;
      }

      try {
        const ext = actualMimeType.includes('mp4') ? 'mp4' : actualMimeType.includes('ogg') ? 'ogg' : 'webm';
        
        // Switch to TRANSCRIBING immediately so UI updates during the long API call
        setState('TRANSCRIBING');
        const transcribeRes = await voiceApi.transcribeAudio(audioBlob, `recording.${ext}`);

        if (!transcribeRes.text || !transcribeRes.text.trim()) {
          setState('ERROR');
          setResult({
            errorCode: 'TRANSCRIPTION_FAILED',
            errorMessage: 'No speech detected. Please try speaking more clearly or type your command.',
          });
          return;
        }

        console.log(`[VoicePipeline] Transcription success: "${transcribeRes.text}"`);
        setResult({ transcript: transcribeRes.text });
        
        // Proceed with command understanding
        await processPipeline(transcribeRes.text);
      } catch (err: any) {
        console.error('[VoicePipeline] Transcription error:', err);
        setState('ERROR');
        setResult({
          errorCode: 'AUDIO_UPLOAD_FAILED',
          errorMessage: mapApiError(err),
        });
      }
    };

    try {
      recorder.start();
      console.log(`[VoicePipeline] Recording started with mimeType: ${recorder.mimeType}`);
      setState('RECORDING');
    } catch (err: any) {
      console.error('[VoicePipeline] Failed to start recorder:', err);
      setState('ERROR');
      setResult({
        errorCode: 'RECORDING_FAILED',
        errorMessage: 'Could not start recording audio.',
      });
    }
  }, [checkMicSupport, processPipeline]);

  // ---------------------------------------------------------------------------
  // stopListening
  // ---------------------------------------------------------------------------
  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  // ---------------------------------------------------------------------------
  // confirmAndApply — ONLY mutation: commits to inventory after human review
  // ---------------------------------------------------------------------------
  const confirmAndApply = useCallback(async () => {
    if (!result.preview || !result.preview.product || result.preview.status !== 'READY') {
      return;
    }

    try {
      setState('COMMITTING');
      const confirmed = await voiceApi.confirmCommand({
        operation_id: result.preview.operation_id,
        product_id: result.preview.product.id,
        quantity_delta: result.preview.normalized_quantity || 0,
        source: 'VOICE',
      });

      setResult((prev) => ({ ...prev, confirmed }));
      setState('COMMITTED');
    } catch (err: any) {
      console.error('[VoicePipeline] Confirm error:', err);
      setState('ERROR');
      setResult((prev) => ({
        ...prev,
        errorCode: 'DATABASE_ERROR',
        errorMessage: mapApiError(err),
      }));
    }
  }, [result.preview]);

  // ---------------------------------------------------------------------------
  // Derived flags
  // ---------------------------------------------------------------------------
  const isRecording = state === 'RECORDING';
  const isProcessing: boolean = [
    'UPLOADING',
    'TRANSCRIBING',
    'UNDERSTANDING',
    'RETRIEVING_CONTEXT',
    'VERIFYING',
    'COMMITTING',
  ].includes(state);
  const isReady = state === 'READY';
  const isCommitted = state === 'COMMITTED';
  const isError = state === 'ERROR';

  return {
    state,
    result,
    isRecording,
    isProcessing,
    isReady,
    isCommitted,
    isError,
    lastInputWasTyped: lastInputWasTypedRef,
    checkMicSupport,
    startListening,
    stopListening,
    processTypedCommand,
    selectCandidate,
    confirmAndApply,
    reset,
  };
}
