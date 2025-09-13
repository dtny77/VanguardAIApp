# VanguardAIApp

A React Native application that provides an AI chat interface with voice input functionality. Users can interact with the Vanguard AI Agent through both text and voice inputs.

## 🚀 Features

- **AI Chat Interface**: Clean, modern chat interface for interacting with AI
- **Voice Input**: Record voice messages and convert them to text
- **Text Input**: Traditional text-based chat functionality
- **Dark Mode Support**: Automatic dark/light mode based on system preferences
- **TypeScript**: Full TypeScript support for better development experience
- **Secure Configuration**: Environment-based API key management

## 📋 Prerequisites

Before running this application, make sure you have completed the [React Native Environment Setup](https://reactnative.dev/docs/set-up-your-environment) guide.

### Required Software

- **Node.js** (>= 20.0.0)
- **npm** or **yarn**
- **React Native CLI**
- **Xcode** (for iOS development on macOS)
- **Android Studio** (for Android development)

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/dtny77/VanguardAIApp.git
cd VanguardAIApp
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

This app requires environment variables for API configuration. **This step is critical for the app to work!**

#### Create Environment File

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` file and update with your actual values:
   ```env
   # Vanguard AI Agent Configuration
   
   # Vanguard AI Agent API endpoint
   VANGUARD_API_BASE_URL=https://fqmsebyf3j.execute-api.us-east-1.amazonaws.com/prod/
   
   # API key for x-api-key header (replace with your actual API key)
   VANGUARD_API_KEY=your_actual_api_key_here
   
   # Request timeout in milliseconds
   VANGUARD_TIMEOUT=15000
   
   # Enable/disable mock responses for development (true/false)
   VANGUARD_USE_MOCK_RESPONSES=false
   ```

3. **Important**: Replace `your_actual_api_key_here` with your real Vanguard API key.

#### Environment Variables Explanation

| Variable | Description | Required |
|----------|-------------|----------|
| `VANGUARD_API_BASE_URL` | The base URL for the Vanguard AI API | Yes |
| `VANGUARD_API_KEY` | Your API key for authentication | Yes |
| `VANGUARD_TIMEOUT` | Request timeout in milliseconds | No (default: 15000) |
| `VANGUARD_USE_MOCK_RESPONSES` | Enable mock responses for testing | No (default: false) |

### 4. iOS Setup (macOS only)

For iOS development, you need to install CocoaPods dependencies:

```bash
# Install Ruby dependencies (first time only)
bundle install

# Install iOS dependencies
cd ios && bundle exec pod install && cd ..
```

### 5. Permissions Configuration

#### iOS Permissions

The app requires microphone permissions for voice recording. These are already configured in `ios/VanguardAIApp/Info.plist`:

```xml
<key>NSMicrophoneUsageDescription</key>
<string>This app needs microphone access to record voice messages for AI interaction.</string>
```

#### Android Permissions

Microphone permissions are configured in `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
```

## 🏃‍♂️ Running the Application

### Start Metro (Development Server)

First, start the Metro development server:

```bash
npm start
```

### Run on iOS

In a new terminal window:

```bash
npm run ios
```

**Alternative iOS Methods:**
- Open `ios/VanguardAIApp.xcworkspace` in Xcode and run
- Specify simulator: `npm run ios -- --simulator="iPhone 15"`

### Run on Android

In a new terminal window:

```bash
npm run android
```

**Alternative Android Methods:**
- Open `android/` folder in Android Studio and run
- Specify device: `npm run android -- --device-id=<device_id>`

## 🎯 Usage

### Text Input
1. Type your message in the text input field
2. Tap "Send" to submit your query to the AI
3. View the AI response in the chat interface

### Voice Input
1. Tap the microphone button (🎤) to start recording
2. Speak your message (button turns red and shows ⏹️)
3. Tap the stop button to end recording
4. The voice will be transcribed to text automatically
5. Review and edit the transcribed text if needed
6. Tap "Send" to submit your query

### Features
- **Real-time feedback**: Visual indicators for recording state
- **Dark mode**: Automatically adapts to system theme
- **Error handling**: Clear error messages for API or recording failures
- **Responsive design**: Works on various screen sizes

## 🔧 Development

### Available Scripts

- `npm start` - Start Metro development server
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run lint` - Run ESLint
- `npm test` - Run tests

### Project Structure

```
VanguardAIApp/
├── App.tsx                 # Main application component
├── services/
│   ├── vanguardApi.ts     # API service for Vanguard AI
│   └── voiceService.ts    # Voice recording service
├── types/
│   └── env.d.ts           # Environment variable types
├── config.ts              # Configuration management
├── .env.example           # Environment template
└── .env                   # Your environment variables (gitignored)
```

### Key Dependencies

- **react-native-audio-record** - Voice recording functionality
- **react-native-webview** - Rendering HTML/SVG responses
- **react-native-dotenv** - Environment variable management
- **react-native-safe-area-context** - Safe area handling

## 🔒 Security

- **API keys are never committed to version control** (`.env` is gitignored)
- Environment variables are used for all sensitive configuration
- HTTPS is used for all API communications
- Proper error handling prevents sensitive information leakage

## 🚨 Troubleshooting

### Common Issues

#### "Cannot find module '@env'"
- Make sure you've run `npm install`
- Restart Metro: `npm start -- --reset-cache`
- Check that `babel.config.js` includes the dotenv plugin

#### "API Key not found" or API errors
- Verify your `.env` file exists and contains the correct API key
- Check that `VANGUARD_API_KEY` is set properly
- Restart the Metro server after changing environment variables

#### Voice recording not working
- Check microphone permissions in device settings
- Voice recording doesn't work in simulators - use a physical device
- Ensure you're testing on a real device for voice functionality

#### iOS Build Issues
- Run `cd ios && bundle exec pod install && cd ..`
- Clean build: `npx react-native-clean-project`
- Reset Metro cache: `npm start -- --reset-cache`

#### Android Build Issues
- Clean build: `cd android && ./gradlew clean && cd ..`
- Check Android SDK and build tools are properly installed
- Verify Java version compatibility

### Getting Help

If you encounter issues:

1. Check the [React Native Troubleshooting Guide](https://reactnative.dev/docs/troubleshooting)
2. Verify all prerequisites are installed correctly
3. Ensure your `.env` file is properly configured
4. Check that you're using a physical device for voice features

## 📚 Learn More

- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [TypeScript with React Native](https://reactnative.dev/docs/typescript)
- [Environment Setup Guide](https://reactnative.dev/docs/environment-setup)

## 📄 License

This project is private and proprietary.

---

**Built with ❤️ using React Native, TypeScript, and Claude Code**