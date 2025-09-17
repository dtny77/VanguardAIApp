import {
  VANGUARD_API_BASE_URL,
  VANGUARD_API_KEY,
  VANGUARD_TIMEOUT,
  VANGUARD_USE_MOCK_RESPONSES,
  OPENAI_API_KEY,
  GOOGLE_CLOUD_API_KEY,
  SPEECH_PROVIDER,
} from '@env';

// Configuration for Vanguard AI Agent integration
export const VANGUARD_CONFIG = {
  // Vanguard AI Agent API endpoint
  API_BASE_URL: VANGUARD_API_BASE_URL || 'https://p8aq8ewwi3.execute-api.us-east-1.amazonaws.com/prod/',

  // API key for x-api-key header
  API_KEY: VANGUARD_API_KEY || '',

  // Request timeout in milliseconds
  TIMEOUT: parseInt(VANGUARD_TIMEOUT || '15000', 10),

  // Enable/disable mock responses for development
  USE_MOCK_RESPONSES: VANGUARD_USE_MOCK_RESPONSES === 'true',
};

// Configuration for speech-to-text services
export const SPEECH_CONFIG = {
  // Speech provider: 'google', 'openai', 'native', or 'mock'
  PROVIDER: SPEECH_PROVIDER || 'none',

  // OpenAI API key for Whisper transcription
  OPENAI_API_KEY: OPENAI_API_KEY || '',

  // Google Cloud API key for Speech-to-Text
  GOOGLE_CLOUD_API_KEY: GOOGLE_CLOUD_API_KEY || 'something doggy here',

  // Language for speech recognition - try Samsung's locale
  LANGUAGE: 'en-US',

  // Alternative language codes to try
  FALLBACK_LANGUAGES: ['en-US', 'en-GB', 'en', 'ko-KR'],

  // Enable continuous listening
  CONTINUOUS: true,

  // Show interim results
  INTERIM_RESULTS: true,

  // Transcription interval in milliseconds (5000ms = 5 seconds)
  TRANSCRIPTION_INTERVAL_MS: 5000,

  // Silence detection timeouts
  MAX_INITIAL_SILENCE_MS: 3000,     // 3 seconds before any voice
  MAX_SILENCE_AFTER_VOICE_MS: 3000,  // 3 seconds after voice detected
};

export default VANGUARD_CONFIG;