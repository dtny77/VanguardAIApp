import AudioRecord from 'react-native-audio-record';

export interface VoiceRecordingOptions {
  sampleRate: number;
  channels: number;
  bitsPerSample: number;
  audioSource: number;
  wavFile: string;
}

class VoiceService {
  private isInitialized = false;
  private isRecording = false;

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
    this.isInitialized = true;
  }

  async startRecording(): Promise<void> {
    if (!this.isInitialized) {
      this.initializeRecorder();
    }

    if (this.isRecording) {
      return;
    }

    try {
      AudioRecord.start();
      this.isRecording = true;
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw new Error('Failed to start voice recording');
    }
  }

  async stopRecording(): Promise<string> {
    if (!this.isRecording) {
      throw new Error('No recording in progress');
    }

    try {
      const audioFile = await AudioRecord.stop();
      this.isRecording = false;
      return audioFile;
    } catch (error) {
      console.error('Failed to stop recording:', error);
      this.isRecording = false;
      throw new Error('Failed to stop voice recording');
    }
  }

  getIsRecording(): boolean {
    return this.isRecording;
  }

  async convertToText(audioFilePath: string): Promise<string> {
    // For now, return a placeholder
    // In a real implementation, you would:
    // 1. Send the audio file to a speech-to-text service
    // 2. Return the transcribed text
    console.log('Converting audio to text:', audioFilePath);
    return 'Voice input transcription would go here';
  }
}

export const voiceService = new VoiceService();
export default VoiceService;