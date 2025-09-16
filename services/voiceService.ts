import AudioRecord from 'react-native-audio-record';
import { SPEECH_CONFIG } from '../config';
import RNFS from 'react-native-fs';

export interface VoiceRecordingOptions {
  sampleRate: number;
  channels: number;
  bitsPerSample: number;
  audioSource: number;
  wavFile: string;
}

export interface TranscriptionCallback {
  (text: string): void;
}

export interface RecordingStoppedCallback {
  (reason: 'silence' | 'manual' | 'error'): void;
}

class VoiceService {
  private isInitialized = false;
  private isRecording = false;
  private onTranscriptionCallback: TranscriptionCallback | null = null;
  
  constructor() {
    this.initializeRecorder();
  }

  private initializeRecorder() {
    const options: VoiceRecordingOptions = {
      sampleRate: 16000,
      channels: 1,
      bitsPerSample: 16,
      audioSource: 6, // VOICE_RECOGNITION
      wavFile: 'voice_recording.wav',
    };

    AudioRecord.init(options);
    console.log('[INIT] AudioRecord initialized');
    this.isInitialized = true;
  }

  async startRecording(onTranscription?: (text: string) => void): Promise<void> {
    if (this.isRecording) {
      console.log('[RECORDING] Already recording, ignoring start request');
      return;
    }

    try {
      this.onTranscriptionCallback = onTranscription || null;
      
      const options = {
        sampleRate: 16000,
        channels: 1,
        bitsPerSample: 16,
        audioSource: 6, // VOICE_RECOGNITION
        wavFile: 'recording.wav',
      };

      await AudioRecord.init(options);
      await AudioRecord.start();
      this.isRecording = true;
      
      console.log('[RECORDING] Started recording');
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw new Error('Failed to start voice recording');
    }
  }

  async stopRecording(): Promise<string> {
    if (!this.isRecording) {
      console.log('[RECORDING] Not recording, ignoring stop request');
      return '';
    }

    try {
      console.log('[RECORDING] Stopping recording...');
      
      // Stop the recording and get the audio file
      const audioFile = await AudioRecord.stop();
      this.isRecording = false;
      
      console.log('[RECORDING] Recording stopped, audio file:', audioFile);

      // Convert speech to text
      if (audioFile) {
        try {
          console.log('[TRANSCRIPTION] Starting speech-to-text conversion...');
          const transcription = await this.convertToText(audioFile);
          console.log('[TRANSCRIPTION] Completed:', transcription);
          
          // Call the callback if provided
          if (this.onTranscriptionCallback) {
            this.onTranscriptionCallback(transcription || '');
          }
          
          // Clear callback
          this.onTranscriptionCallback = null;
          
          return transcription || '';
        } catch (error) {
          console.error('[TRANSCRIPTION] Failed:', error);
          if (this.onTranscriptionCallback) {
            this.onTranscriptionCallback('');
          }
          this.onTranscriptionCallback = null;
          return '';
        }
      }

      // Clear callback
      this.onTranscriptionCallback = null;
      return '';
      
    } catch (error) {
      console.error('Failed to stop recording:', error);
      this.isRecording = false;
      this.onTranscriptionCallback = null;
      throw new Error('Failed to stop voice recording');
    }
  }

  getIsRecording(): boolean {
    return this.isRecording;
  }

  // Smart merge function to avoid duplicating content
  private mergeTranscriptions(existing: string, newText: string): string {
    if (!existing) return newText;
    if (!newText) return existing;

    // Clean up the text
    const cleanExisting = existing.trim();
    const cleanNew = newText.trim();

    // If new text is much longer, it likely contains the existing text plus more
    if (cleanNew.length > cleanExisting.length + 5) {
      // Check if new text starts with existing text (allowing for some variation)
      const existingWords = cleanExisting.toLowerCase().split(' ');
      const newWords = cleanNew.toLowerCase().split(' ');
      
      // If most of the existing words are found at the start of new text, use new text
      if (existingWords.length > 0) {
        let matchCount = 0;
        for (let i = 0; i < Math.min(existingWords.length, newWords.length); i++) {
          if (existingWords[i] === newWords[i]) {
            matchCount++;
          } else {
            break;
          }
        }
        
        // If more than 70% of words match, use the new transcription
        if (matchCount / existingWords.length > 0.7) {
          return cleanNew;
        }
      }
    }

    // Default: append new text with space
    return cleanExisting + ' ' + cleanNew;
  }

  async convertToText(audioFilePath: string): Promise<string> {
    console.log('Speed config ' + JSON.stringify(SPEECH_CONFIG));
    // Check which provider to use based on configuration
    if (SPEECH_CONFIG.PROVIDER === 'google' && SPEECH_CONFIG.GOOGLE_CLOUD_API_KEY) {
      return this.convertToTextWithGoogle(audioFilePath, SPEECH_CONFIG.GOOGLE_CLOUD_API_KEY);
    } else if (SPEECH_CONFIG.PROVIDER === 'openai' && SPEECH_CONFIG.OPENAI_API_KEY) {
      return this.convertToTextWithWhisper(audioFilePath, SPEECH_CONFIG.OPENAI_API_KEY);
    } else {
      throw new Error('No suitable provider configured. Configured provider: ' + SPEECH_CONFIG.PROVIDER + ', google key ' + SPEECH_CONFIG.GOOGLE_CLOUD_API_KEY);
    }
  }

  // Method to integrate with OpenAI Whisper API
  async convertToTextWithWhisper(audioFilePath: string, apiKey: string): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: audioFilePath,
        type: 'audio/wav',
        name: 'audio.wav',
      } as any);
      formData.append('model', 'whisper-1');

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const result = await response.json();
      return result.text || '';
    } catch (error) {
      console.error('OpenAI Whisper transcription failed:', error);
      throw new Error('Failed to transcribe audio with OpenAI Whisper');
    }
  }

  // Method to integrate with Google Cloud Speech-to-Text API
  async convertToTextWithGoogle(audioFilePath: string, apiKey: string): Promise<string> {
    try {
      // Convert audio file to base64
      const audioBase64 = await this.audioFileToBase64(audioFilePath);

      const requestBody = {
        config: {
          encoding: 'LINEAR16', // WAV files use LINEAR16 encoding
          sampleRateHertz: 16000,
          languageCode: 'en-US',
          enableAutomaticPunctuation: true,
          audioChannelCount: 1, // Mono audio
        },
        audio: {
          content: audioBase64,
        },
      };

      const response = await fetch(
        `https://speech.googleapis.com/v1/speech:recognize?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        throw new Error(`Google Cloud API error: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.results && result.results.length > 0) {
        return result.results[0].alternatives[0].transcript || '';
      }

      return '';
    } catch (error) {
      console.error('Google Cloud Speech transcription failed:', error);
      throw new Error('Failed to transcribe audio with Google Cloud Speech');
    }
  }

  // Helper method to convert audio file to base64
  private async audioFileToBase64(audioFilePath: string): Promise<string> {
    try {
      console.log('Converting audio file to base64:', audioFilePath);

      // Check if file exists
      const fileExists = await RNFS.exists(audioFilePath);
      if (!fileExists) {
        throw new Error(`Audio file does not exist: ${audioFilePath}`);
      }

      // Read file as base64
      const base64Data = await RNFS.readFile(audioFilePath, 'base64');
      console.log('Audio file converted to base64, length:', base64Data.length);

      return base64Data;
    } catch (error) {
      console.error('Failed to convert audio file to base64:', error);
      throw new Error('Failed to read audio file for transcription');
    }
  }
}

export const voiceService = new VoiceService();
export default VoiceService;