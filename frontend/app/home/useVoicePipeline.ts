'use client';

import { useState, useRef, useCallback } from 'react';
import { voiceApi, StructuredCommand, PreviewResponse, ConfirmResponse } from '../../src/services/api/voiceApi';

/**
 * Voice pipeline states — every state maps to a real backend operation.
 * NEVER shows fake states.
 */
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
  // Input
  transcript: string;
  // LLM interpretation
  command: StructuredCommand | null;
  // Backend preview
  preview: PreviewResponse | null;
  // Committed transaction
  confirmed: ConfirmResponse | null;
  // Error
  errorMessage: string | null;
}

export function useVoicePipeline() {
  const [state, setState] = useState<VoiceState>('IDLE');
  const [result, setResult] = useState<VoicePipelineResult>({
    transcript: '',
    command: null,
    preview: null,
    confirmed: null,
    errorMessage: null,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // ---------------------------------------------------------------------------
  // Reset to idle
  // ---------------------------------------------------------------------------
  const reset = useCallback(() => {
    setState('IDLE');
    setResult({ transcript: '', command: null, preview: null, confirmed: null, errorMessage: null });
  }, []);

  // ---------------------------------------------------------------------------
  // Error handler
  // ---------------------------------------------------------------------------
  const setError = useCallback((message: string) => {
    setState('ERROR');
    setResult(prev => ({ ...prev, errorMessage: message }));
  }, []);

  // ---------------------------------------------------------------------------
  // CORE PIPELINE: transcript → interpret → preview
  // ---------------------------------------------------------------------------
  const runPipeline = useCallback(async (transcript: string) => {
    if (!transcript.trim()) {
      setError('No speech detected. Please try again.');
      return;
    }

    // Update transcript in state
    setResult(prev => ({ ...prev, transcript, errorMessage: null }));

    // STEP 1: Interpret (RAG + Groq LLM)
    setState('UNDERSTANDING');
    let command: StructuredCommand;
    try {
      command = await voiceApi.interpretCommand(transcript);
      setResult(prev => ({ ...prev, command }));
    } catch (err: any) {
      if (err.message?.includes('503') || err.message?.includes('unavailable')) {
        setError('AI command understanding is temporarily unavailable. Check your Groq API key.');
      } else {
        setError(`Failed to understand command: ${err.message || 'Unknown error'}`);
      }
      return;
    }

    // STEP 2: Preview (product resolution + TUNE + validation)
    setState('VERIFYING');
    try {
      const preview = await voiceApi.previewCommand(command);
      setResult(prev => ({ ...prev, preview }));
      setState('READY');
    } catch (err: any) {
      setError(`Preview failed: ${err.message || 'Unknown error'}`);
    }
  }, [setError]);

  // ---------------------------------------------------------------------------
  // START VOICE RECORDING (MediaRecorder)
  // ---------------------------------------------------------------------------
  const startListening = useCallback(async () => {
    if (state === 'RECORDING') return;
    reset();
    setState('RECORDING');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        }
      });
      streamRef.current = stream;
      audioChunksRef.current = [];

      // Detect best supported MIME type
      const mimeType = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/ogg',
        'audio/mp4',
      ].find(type => MediaRecorder.isTypeSupported(type)) || '';

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());

        const audioBlob = new Blob(audioChunksRef.current, {
          type: mimeType || 'audio/webm',
        });

        if (audioBlob.size < 100) {
          setError('Recording too short. Please speak clearly and try again.');
          return;
        }

        // STEP 1: Upload to backend → Groq Whisper
        setState('UPLOADING');
        try {
          setState('TRANSCRIBING');
          const ext = (mimeType.includes('ogg') ? 'ogg' : mimeType.includes('mp4') ? 'm4a' : 'webm');
          const transcription = await voiceApi.transcribeAudio(audioBlob, `recording.${ext}`);
          
          if (!transcription.text) {
            setError('No speech detected in the recording. Please try again.');
            return;
          }

          // Run full pipeline with transcript
          await runPipeline(transcription.text);
        } catch (err: any) {
          if (err.message?.includes('MIC_PERMISSION')) {
            setError('Microphone permission denied. Please allow microphone access.');
          } else if (err.message?.includes('503') || err.message?.includes('unavailable')) {
            setError('Voice transcription is temporarily unavailable. Please type your command instead.');
          } else {
            setError(`Transcription failed: ${err.message || 'Unknown error'}`);
          }
        }
      };

      recorder.onerror = (event) => {
        setError('Recording failed. Please check your microphone and try again.');
      };

      recorder.start(250); // Collect in 250ms chunks
    } catch (err: any) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Microphone access denied. Please allow microphone permissions in your browser settings.');
      } else if (err.name === 'NotFoundError') {
        setError('No microphone found. Please connect a microphone and try again.');
      } else {
        setError(`Could not access microphone: ${err.message || 'Unknown error'}`);
      }
    }
  }, [state, reset, setError, runPipeline]);

  // ---------------------------------------------------------------------------
  // STOP RECORDING
  // ---------------------------------------------------------------------------
  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  }, []);

  // ---------------------------------------------------------------------------
  // TYPED COMMAND (same pipeline as voice)
  // ---------------------------------------------------------------------------
  const processTypedCommand = useCallback(async (text: string) => {
    reset();
    setResult(prev => ({ ...prev, transcript: text }));
    await runPipeline(text);
  }, [reset, runPipeline]);

  // ---------------------------------------------------------------------------
  // CONFIRM & APPLY (the ONLY mutation)
  // ---------------------------------------------------------------------------
  const confirmAndApply = useCallback(async () => {
    const { preview } = result;
    if (!preview || preview.status !== 'READY' || !preview.product || preview.normalized_quantity === undefined) {
      setError('Cannot confirm — no valid preview available.');
      return;
    }

    setState('COMMITTING');
    try {
      const confirmed = await voiceApi.confirmCommand({
        operation_id: preview.operation_id,
        product_id: preview.product.id,
        quantity_delta: preview.normalized_quantity!,
        source: 'VOICE',
      });

      setResult(prev => ({ ...prev, confirmed }));
      setState('COMMITTED');

      // Speak result (browser TTS — EN/Telugu not supported by Groq TTS)
      if ('speechSynthesis' in window && confirmed.message) {
        const utterance = new SpeechSynthesisUtterance(confirmed.message);
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
      }
    } catch (err: any) {
      setError(`Transaction failed: ${err.message || 'Unknown error'}`);
    }
  }, [result, setError]);

  // ---------------------------------------------------------------------------
  // Check mic support
  // ---------------------------------------------------------------------------
  const checkMicSupport = useCallback((): boolean => {
    try {
      return typeof MediaRecorder !== 'undefined' && !!navigator.mediaDevices;
    } catch {
      return false;
    }
  }, []);

  return {
    state,
    result,
    isRecording: state === 'RECORDING',
    isProcessing: ['UPLOADING', 'TRANSCRIBING', 'UNDERSTANDING', 'RETRIEVING_CONTEXT', 'VERIFYING'].includes(state),
    isReady: state === 'READY',
    isCommitted: state === 'COMMITTED',
    isError: state === 'ERROR',
    checkMicSupport,
    startListening,
    stopListening,
    processTypedCommand,
    confirmAndApply,
    reset,
  };
}
