# Vanguard AI Agent React Native App Setup

## Overview
This React Native app provides a simple interface to interact with your Vanguard AI Agent. The app features:
- Single screen interface with input box and submit button
- Display area that handles both text and graphical responses
- WebView integration for rendering HTML/SVG content
- Dark mode support
- Clean, responsive design

## Setup Instructions

### 1. Install Dependencies
All necessary dependencies are already installed:
- `react-native-svg` - For SVG rendering
- `react-native-webview` - For HTML/graphical content display

### 2. Configure API Integration
Edit `config.ts` to connect to your Vanguard AI Agent:

```typescript
export const VANGUARD_CONFIG = {
  // Your Vanguard AI Agent API endpoint
  API_BASE_URL: 'https://your-actual-vanguard-api-endpoint.com/api/v1',
  
  // Your API key (uncomment and set if required)
  // API_KEY: 'your-api-key-here',
  
  // Request timeout in milliseconds
  TIMEOUT: 15000,
  
  // Set to false when connecting to real API
  USE_MOCK_RESPONSES: false,
};
```

### 3. API Integration Details
The app expects your Vanguard AI Agent API to:
- Accept POST requests to `/query` endpoint
- Receive JSON payload: `{ "query": "user input" }`
- Return JSON response with:
  - `content` or `response` field with the response text
  - Optional `type` field: "text", "html", or "svg"

### 4. Run the App

#### iOS
```bash
npm run ios
```

#### Android
```bash
npm run android
```

## File Structure
- `App.tsx` - Main app component with UI and logic
- `services/vanguardApi.ts` - API service for Vanguard AI Agent integration
- `config.ts` - Configuration settings
- `SETUP.md` - This setup guide

## Features
- **Text Responses**: Displays plain text responses from the agent
- **HTML Responses**: Renders HTML content in WebView
- **SVG Responses**: Displays SVG graphics in WebView
- **Error Handling**: Shows user-friendly error messages
- **Loading States**: Visual feedback during API calls
- **Dark Mode**: Automatically adapts to system theme

## Customization
- Modify styles in `App.tsx` to match your branding
- Update API integration in `services/vanguardApi.ts`
- Add additional response types as needed
- Configure timeout and retry logic in the API service

## Troubleshooting
1. **Mock responses showing**: Set `USE_MOCK_RESPONSES: false` in config.ts
2. **API connection issues**: Verify your endpoint URL and API key
3. **WebView not rendering**: Check that HTML/SVG content is properly formatted
4. **Build errors**: Run `npm install` to ensure all dependencies are installed