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

export interface VoicePipelineResult {
  transcript?: string;
  errorMessage?: string;
  command?: StructuredCommand;
  preview?: PreviewResponse;
  confirmed?: ConfirmResponse;
}

export function useVoicePipeline() {
  const [state, setState] = useState<VoiceState>('IDLE');
  const [result, setResult] = useState<VoicePipelineResult>({});

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const checkMicSupport = useCallback((): boolean => {
    if (typeof window === 'undefined') return false;
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }, []);

  const reset = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setState('IDLE');
    setResult({});
  }, []);

  const processPipeline = useCallback(async (transcriptText: string) => {
    try {
      setState('UNDERSTANDING');
      const command = await voiceApi.interpretCommand(transcriptText);

      setResult((prev) => ({ ...prev, command }));

      if (command.intent === 'UNKNOWN' && !command.product_query) {
        setState('ERROR');
        setResult((prev) => ({
          ...prev,
          errorMessage: command.clarification_reason || 'Could not understand the command. Please try speaking or typing clearly.',
        }));
        return;
      }

      setState('VERIFYING');
      const preview = await voiceApi.previewCommand(command);

      setResult((prev) => ({ ...prev, preview }));
      setState('READY');
    } catch (err: any) {
      console.error('Voice pipeline error:', err);
      setState('ERROR');
      setResult((prev) => ({
        ...prev,
        errorMessage: err.message || 'An error occurred while processing your command.',
      }));
    }
  }, []);

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
        setState('READY');
      } catch (err: any) {
        console.error('Candidate selection error:', err);
        setState('ERROR');
        setResult((prev) => ({
          ...prev,
          errorMessage: err.message || 'Failed to resolve selected product.',
        }));
      }
    },
    [result.command, result.preview?.operation_id]
  );

  const processTypedCommand = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      setResult({ transcript: trimmed });
      await processPipeline(trimmed);
    },
    [processPipeline]
  );

  const startListening = useCallback(async () => {
    if (!checkMicSupport()) {
      setState('ERROR');
      setResult({ errorMessage: 'Microphone is not supported in this browser.' });
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      let mimeType = 'audio/webm';
      if (typeof MediaRecorder !== 'undefined') {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          mimeType = 'audio/webm;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
          mimeType = 'audio/ogg';
        }
      }

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        // Stop all audio tracks
        stream.getTracks().forEach((track) => track.stop());

        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        if (audioBlob.size === 0) {
          setState('ERROR');
          setResult({ errorMessage: 'No audio captured. Please try speaking again.' });
          return;
        }

        try {
          setState('UPLOADING');
          const ext = mimeType.includes('mp4') ? 'mp4' : mimeType.includes('ogg') ? 'ogg' : 'webm';
          const transcribeRes = await voiceApi.transcribeAudio(audioBlob, `recording.${ext}`);

          if (!transcribeRes.text || !transcribeRes.text.trim()) {
            setState('ERROR');
            setResult({ errorMessage: 'No speech was detected. Please try speaking again.' });
            return;
          }

          setResult({ transcript: transcribeRes.text });
          await processPipeline(transcribeRes.text);
        } catch (err: any) {
          console.error('Transcription error:', err);
          setState('ERROR');
          setResult({
            errorMessage: err.message || 'Failed to transcribe audio. Please try again or type your command.',
          });
        }
      };

      recorder.start();
      setState('RECORDING');
    } catch (err: any) {
      console.error('Mic access error:', err);
      setState('ERROR');
      setResult({
        errorMessage: err.name === 'NotAllowedError'
          ? 'Microphone permission denied. Please allow microphone access in your browser.'
          : 'Could not access microphone: ' + (err.message || 'Unknown error'),
      });
    }
  }, [checkMicSupport, processPipeline]);

  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, []);

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
      console.error('Confirm error:', err);
      setState('ERROR');
      setResult((prev) => ({
        ...prev,
        errorMessage: err.message || 'Failed to apply transaction to inventory.',
      }));
    }
  }, [result.preview]);

  const isRecording = state === 'RECORDING';
  const isProcessing = [
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
    checkMicSupport,
    startListening,
    stopListening,
    processTypedCommand,
    selectCandidate,
    confirmAndApply,
    reset,
  };
}
