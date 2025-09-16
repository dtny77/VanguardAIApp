import Voice from '@react-native-voice/voice';
import {PermissionsAndroid, Platform, Alert} from 'react-native';

export interface SpeechRecognitionCallback {
  (text: string): void;
}

export interface SpeechServiceOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
}

class SpeechService {
  private isListening = false;
  private onResultCallback: SpeechRecognitionCallback | null = null;
  private currentTranscription = '';
  private options: SpeechServiceOptions = {
    language: 'en-US',
    continuous: true,
    interimResults: true,
  };

  constructor() {
    this.initializeVoice();
  }

  private async initializeVoice() {
    try {
      // Set up event listeners
      Voice.onSpeechStart = this.onSpeechStart.bind(this);
      Voice.onSpeechEnd = this.onSpeechEnd.bind(this);
      Voice.onSpeechResults = this.onSpeechResults.bind(this);
      Voice.onSpeechPartialResults = this.onSpeechPartialResults.bind(this);
      Voice.onSpeechError = this.onSpeechError.bind(this);

      console.log('Voice module initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Voice module:', error);
    }
  }

  private onSpeechStart() {
    console.log('Speech recognition started');
  }

  private onSpeechEnd() {
    console.log('Speech recognition ended');
  }

  private onSpeechResults(event: any) {
    console.log('Speech results:', event.value);
    if (event.value && event.value.length > 0) {
      const finalText = event.value[0];
      this.currentTranscription = finalText;
      if (this.onResultCallback) {
        this.onResultCallback(finalText);
      }
    }
  }

  private onSpeechPartialResults(event: any) {
    console.log('Speech partial results:', event.value);
    if (event.value && event.value.length > 0) {
      const partialText = event.value[0];
      if (this.onResultCallback && this.options.interimResults) {
        this.onResultCallback(partialText);
      }
    }
  }

  private onSpeechError(event: any) {
    console.error('Speech recognition error:', event.error);
  }

  private async requestMicrophonePermission(): Promise<boolean> {
    if (Platform.OS === 'android') {
      try {
        // First check if we already have permission
        const hasPermission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        );

        console.log('Current microphone permission status:', hasPermission);

        if (hasPermission) {
          console.log('Microphone permission already granted');
          return true;
        }

        // If not, request it
        console.log('Requesting microphone permission...');
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'This app needs access to your microphone to convert speech to text.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );

        console.log('Permission request result:', granted);

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Microphone permission granted via dialog');
          return true;
        } else {
          console.log('Microphone permission denied:', granted);
          Alert.alert(
            'Microphone Permission Required',
            'Please enable microphone permission in Settings to use voice input.',
            [
              {
                text: 'Cancel',
                style: 'cancel',
              },
              {
                text: 'Open Settings',
                onPress: () => {
                  console.log('Should open app settings');
                },
              },
            ],
          );
          return false;
        }
      } catch (err) {
        console.error('Permission request error:', err);
        Alert.alert('Error', 'Failed to request microphone permission: ' + err);
        return false;
      }
    } else {
      // iOS permissions are handled differently, assume granted for now
      return true;
    }
  }

  private async checkVoiceAvailability(): Promise<boolean> {
    try {
      console.log('Checking Voice module availability...');

      // First check if Voice module exists
      if (!Voice || typeof Voice.isAvailable !== 'function') {
        console.error('Voice module not properly loaded');
        return false;
      }

      // Then check if speech recognition is available on device
      const isAvailable = await Voice.isAvailable();
      console.log('Voice.isAvailable result:', isAvailable);
      return isAvailable === true;
    } catch (error) {
      console.error('Error checking voice availability:', error);
      return false;
    }
  }

  async startContinuousListening(
    onResult: SpeechRecognitionCallback,
    options?: Partial<SpeechServiceOptions>
  ): Promise<void> {
    console.log('startContinuousListening called, isListening:', this.isListening);

    if (this.isListening) {
      console.log('Already listening, returning early');
      return;
    }

    try {
      console.log('Starting speech recognition process...');

      // Update options
      this.options = { ...this.options, ...options };
      this.onResultCallback = onResult;
      this.currentTranscription = '';

      console.log('Checking if speech recognition is available...');
      // Check if speech recognition is available
      const isAvailable = await this.checkVoiceAvailability();
      console.log('Speech recognition available:', isAvailable);

      if (!isAvailable) {
        console.error('Speech recognition not available on this device');
        throw new Error('Speech recognition is not available on this device. Please make sure Google app is installed and up to date.');
      }

      // Start listening
      console.log('Starting Voice.start with language:', this.options.language || 'en-US');
      await Voice.start(this.options.language || 'en-US');
      this.isListening = true;
      console.log('Speech recognition started successfully');

    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      // Provide more specific error messages
      let errorMessage = 'Failed to start speech recognition';
      if (error instanceof Error) {
        if (error.message.includes('isSpeechAailable') || error.message.includes('null')) {
          errorMessage = 'Speech recognition service not available. Please ensure Google app is installed and updated.';
        } else {
          errorMessage = error.message;
        }
      }
      throw new Error(errorMessage);
    }
  }

  async stopListening(): Promise<string> {
    if (!this.isListening) {
      return this.currentTranscription;
    }

    try {
      await Voice.stop();
      this.isListening = false;
      return this.currentTranscription;
    } catch (error) {
      console.error('Failed to stop speech recognition:', error);
      this.isListening = false;
      throw new Error('Failed to stop speech recognition');
    }
  }

  async cancelListening(): Promise<void> {
    if (!this.isListening) {
      return;
    }

    try {
      await Voice.cancel();
      this.isListening = false;
    } catch (error) {
      console.error('Failed to cancel speech recognition:', error);
      this.isListening = false;
    }
  }

  getIsListening(): boolean {
    return this.isListening;
  }

  getCurrentTranscription(): string {
    return this.currentTranscription;
  }

  // Check if speech recognition is supported
  static async isSupported(): Promise<boolean> {
    try {
      const available = await Voice.isAvailable();
      return Boolean(available);
    } catch (error) {
      return false;
    }
  }

  // Get available languages
  static async getSupportedLanguages(): Promise<string[]> {
    try {
      const services = await Voice.getSpeechRecognitionServices();
      return services || ['en-US']; // Default fallback if undefined
    } catch (error) {
      console.error('Failed to get supported languages:', error);
      return ['en-US']; // Default fallback
    }
  }

  // Clean up resources
  destroy(): void {
    Voice.removeAllListeners();
    if (this.isListening) {
      this.cancelListening();
    }
  }
}

export const speechService = new SpeechService();
export default SpeechService;