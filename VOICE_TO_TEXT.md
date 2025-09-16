# Voice-to-Text Setup Guide

This app includes continuous voice-to-text transcription functionality using OpenAI's Whisper API.

## Features

- **Continuous Recording**: Press the microphone button to start listening, press it again or press "Send" to stop
- **Real-time Transcription**: Audio is transcribed every 3 seconds during recording
- **Live Updates**: The text input field updates automatically as you speak
- **Visual Feedback**: UI shows "Listening..." and "Transcribing..." states

## Setup

### 1. Get OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an account or sign in
3. Navigate to API keys section
4. Create a new API key
5. Copy the key (keep it secure!)

### 2. Configure Environment

1. Copy `.env.example` to `.env`
2. Add your OpenAI API key:
   ```
   OPENAI_API_KEY=sk-your-actual-api-key-here
   ```

### 3. Test the Feature

1. Run the app: `npm run android`
2. Press the microphone button (🎤)
3. Start speaking - you'll see "Listening..." in the input field
4. Every 3 seconds, the app transcribes what you've said so far
5. Press the microphone button again or "Send" to stop recording

## How It Works

### Voice Recording Flow

1. **Start Recording**: `voiceService.startContinuousRecording()`
2. **Periodic Transcription**: Every 3 seconds, the app:
   - Stops recording temporarily
   - Sends audio to transcription service
   - Updates the text input with transcribed text
   - Restarts recording
3. **Stop Recording**: Final transcription is performed

### Transcription Services

The app supports multiple transcription backends:

#### OpenAI Whisper (Recommended)
- **Accuracy**: Excellent
- **Cost**: $0.006 per minute
- **Languages**: 50+ languages supported
- **Setup**: Add `OPENAI_API_KEY` to `.env`

#### Mock Transcription (Default)
- Used when no API key is configured
- Returns random sample transcriptions for testing
- No cost, but not functional for real use

## Development Mode

Without an OpenAI API key, the app uses mock transcriptions for testing:
- "Hello, this is a test transcription."
- "How are you doing today?"
- "This is working great!"
- "Voice recognition is amazing."
- "Testing the continuous transcription feature."

## Permissions

Make sure your app has microphone permissions:

### Android
Add to `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
```

### iOS
Add to `ios/VanguardAIApp/Info.plist`:
```xml
<key>NSMicrophoneUsageDescription</key>
<string>This app needs microphone access for voice input</string>
```

## Troubleshooting

### Common Issues

1. **"Failed to start recording"**
   - Check microphone permissions
   - Ensure no other app is using the microphone

2. **No transcription happening**
   - Verify OpenAI API key is correct
   - Check network connectivity
   - Look at console logs for errors

3. **Transcription is slow**
   - This is normal - transcription happens every 3 seconds
   - Adjust the interval in `voiceService.ts` if needed

### Audio Quality Tips

- Speak clearly and at normal volume
- Use in quiet environments for best results
- Hold device at normal distance (6-12 inches from mouth)
- Wait for "Listening..." before speaking

## API Costs

OpenAI Whisper pricing: $0.006 per minute of audio
- 10 minutes of voice input = ~$0.06
- Very cost-effective for most use cases

## Future Enhancements

Potential improvements:
- Real-time streaming transcription
- Support for other languages
- Offline transcription
- Custom wake words
- Speaker identification