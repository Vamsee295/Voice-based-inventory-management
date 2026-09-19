export type SpeechState = 'READY' | 'LISTENING' | 'TRANSCRIBING' | 'ERROR';

export interface SpeechAdapterConfig {
  onStateChange: (state: SpeechState) => void;
  onResult: (transcript: string, isFinal: boolean) => void;
  onError: (error: string) => void;
  language?: string;
}

export class SpeechAdapter {
  private recognition: any | null = null;
  private isSupported: boolean = false;
  private config: SpeechAdapterConfig;

  constructor(config: SpeechAdapterConfig) {
    this.config = config;
    this.init();
  }

  private init() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.isSupported = true;
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false; // Usually for commands we want one utterance
        this.recognition.interimResults = true;
        this.recognition.lang = this.config.language || 'en-IN'; // Default to Indian English, can adjust for Telugu mixed

        this.recognition.onstart = () => {
          this.config.onStateChange('LISTENING');
        };

        this.recognition.onresult = (event: any) => {
          this.config.onStateChange('TRANSCRIBING');
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }

          if (finalTranscript) {
             this.config.onResult(finalTranscript.trim(), true);
          } else if (interimTranscript) {
             this.config.onResult(interimTranscript.trim(), false);
          }
        };

        this.recognition.onerror = (event: any) => {
          this.config.onStateChange('ERROR');
          this.config.onError(event.error);
        };

        this.recognition.onend = () => {
          this.config.onStateChange('READY');
        };
      } else {
        this.isSupported = false;
        console.warn("SpeechRecognition API is not supported in this browser.");
      }
    }
  }

  public startListening() {
    if (!this.isSupported || !this.recognition) {
      this.config.onError('Speech recognition not supported in this browser.');
      return;
    }
    
    try {
      this.recognition.start();
    } catch (e) {
      // It might already be started
      console.warn("Failed to start speech recognition", e);
    }
  }

  public stopListening() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        console.warn("Failed to stop speech recognition", e);
      }
    }
  }
  
  public abortListening() {
     if (this.recognition) {
         try {
             this.recognition.abort();
         } catch(e) {
            console.warn("Failed to abort speech recognition", e);
         }
     }
  }

  public speak(text: string, onEnd?: () => void) {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = this.config.language || 'en-IN';
      
      if (onEnd) {
          utterance.onend = onEnd;
      }
      
      window.speechSynthesis.speak(utterance);
    } else {
      console.warn("SpeechSynthesis API not supported");
      if (onEnd) onEnd();
    }
  }
  
  public checkSupport(): boolean {
      return this.isSupported;
  }
}
