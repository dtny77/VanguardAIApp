import React, { useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  useColorScheme,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { vanguardApi, AgentResponse } from './services/vanguardApi';
import { voiceService } from './services/voiceService';
import { speechService } from './services/speechService';
import { SPEECH_CONFIG } from './config';
import { PermissionsAndroid } from 'react-native';

function AppContent() {
  const isDarkMode = useColorScheme() === 'dark';
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [responses, setResponses] = useState<AgentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // New state for speech-to-text conversion and API call

  const sendToVanguardApi = async (queryText: string, clearInput: boolean = true) => {
    try {
      setIsLoading(true);
      const response = await vanguardApi.sendQuery(queryText);
      setResponses(prev => [...prev, response]);
      if (clearInput) {
        setQuery('');
      }
      console.log('Query sent successfully');
    } catch (error) {
      console.error('Error sending query:', error);
      const errorResponse: AgentResponse = {
        id: Date.now().toString(),
        type: 'text',
        content: `Error: Could not connect to Vanguard AI Agent. ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
      setResponses(prev => [...prev, errorResponse]);
      if (clearInput) {
        setQuery('');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!query.trim() || isLoading) return;
    await sendToVanguardApi(query.trim());
  };

  const requestMicrophonePermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'VanguardAI needs access to your microphone for voice input.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );

        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('Permission error:', err);
        return false;
      }
    }
    return true;
  };

  const handleVoicePress = async () => {
    if (isRecording) {
      try {
        setIsProcessing(true); // Show spinner while calling Google API to convert speech to text
        setIsRecording(false); // Stop recording immediately
        
        // Use Google Cloud Speech-to-Text by default
        if (SPEECH_CONFIG.PROVIDER === 'google' || SPEECH_CONFIG.PROVIDER === 'openai') {
          // Stop recording and get transcription
          const transcribedText = await voiceService.stopRecording();
          setIsProcessing(false); // Transcription is done, stop showing spinner
          
          if (transcribedText && transcribedText.trim()) {
            setQuery(transcribedText);
            
            // Automatically send the transcribed text using the shared function
            console.log('Auto-sending transcribed text to Vanguard API:', transcribedText);
            await sendToVanguardApi(transcribedText, true);
          } else {
            console.log('No transcribed text received');
            setQuery(''); // Clear input if no text was transcribed
          }
        } else {
          // Fallback to native device speech recognition
          await speechService.stopListening();
          setIsProcessing(false);
        }
      } catch (error) {
        setIsRecording(false);
        setIsProcessing(false);
        Alert.alert('Error', 'Failed to stop recording');
        console.error('Voice recording error:', error);
      }
    } else {
      try {
        // Reset states when starting new recording
        setIsProcessing(false);
        
        // First request permission
        console.log('Requesting microphone permission...');
        const hasPermission = await requestMicrophonePermission();

        if (!hasPermission) {
          Alert.alert('Permission Required', 'Microphone permission is needed for voice input.');
          return;
        }

        console.log('Permission granted, starting speech recognition...');

        // Use Google Cloud Speech-to-Text by default (more reliable!)
        if (SPEECH_CONFIG.PROVIDER === 'google' || SPEECH_CONFIG.PROVIDER === 'openai') {
          // Use audio recording service with API-based transcription
          await voiceService.startRecording();
        } else {
          // Fallback to native device speech recognition
          await speechService.startContinuousListening((transcribedText) => {
            setQuery(transcribedText);
          }, {
            language: SPEECH_CONFIG.LANGUAGE,
            continuous: SPEECH_CONFIG.CONTINUOUS,
            interimResults: SPEECH_CONFIG.INTERIM_RESULTS,
          });
        }
        setIsRecording(true);
        setQuery(''); // Clear the input when recording starts
        console.log('Speech recognition started successfully');
      } catch (error) {
        console.error('Voice recording error:', error);
        Alert.alert('Error', 'Failed to start recording: ' + (error as Error).message);
      }
    }
  };

  const renderResponse = (response: AgentResponse) => {
    switch (response.type) {
      case 'text':
        return (
          <Text style={[styles.responseText, isDarkMode && styles.darkText]}>
            {response.content}
          </Text>
        );
      case 'html':
      case 'svg':
        return (
          <WebView
            source={{ html: response.content }}
            style={styles.webView}
            scrollEnabled={false}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        enabled={true}
      >
        <View style={styles.header}>
          <Text style={[styles.title, isDarkMode && styles.darkText]}>
            Vanguard AI Agent
          </Text>
        </View>

        <ScrollView 
          style={styles.responseContainer}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {responses.map((response) => (
            <View key={response.id} style={[styles.responseItem, isDarkMode && styles.darkResponseItem]}>
              {renderResponse(response)}
            </View>
          ))}
          {responses.length === 0 && (
            <View style={styles.placeholderContainer}>
              <Text style={[styles.placeholderText, isDarkMode && styles.darkText]}>
                Welcome! Ask the Vanguard AI Agent anything.
              </Text>
            </View>
          )}
        </ScrollView>

        <View style={[
          styles.inputContainer, 
          isDarkMode && styles.darkInputContainer,
          { 
            // Extra padding for Samsung devices with gesture navigation
            // Samsung devices often need more padding due to their navigation gestures
            paddingBottom: Platform.OS === 'android' ? Math.max(insets.bottom + 12, 28) : Math.max(insets.bottom, 16),
          }
        ]}>
          <TextInput
            style={[styles.textInput, isDarkMode && styles.darkTextInput]}
            value={query}
            onChangeText={setQuery}
            placeholder={isRecording ? "Recording..." : isProcessing ? "Converting speech..." : isLoading ? "Sending to AI..." : "Type your query here or use voice input..."}
            placeholderTextColor={isDarkMode ? '#888' : '#666'}
            multiline
            maxLength={500}
            editable={!isRecording && !isProcessing && !isLoading}
          />
          <TouchableOpacity
            style={[
              styles.voiceButton,
              isRecording && styles.recordingButton,
              isProcessing && styles.processingButton,
              isLoading && !isProcessing && styles.disabledVoiceButton
            ]}
            onPress={handleVoicePress}
            disabled={isLoading || isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator 
                size="small" 
                color="#FFFFFF" 
              />
            ) : (
              <Text style={styles.voiceButtonText}>
                {isRecording ? '⏹️' : '🎤'}
              </Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!query.trim() || isLoading || isRecording || isProcessing) && styles.disabledButton
            ]}
            onPress={handleSubmit}
            disabled={!query.trim() || isLoading || isRecording || isProcessing}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>
                ➤
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  flex: {
    flex: 1,
  },
  darkContainer: {
    backgroundColor: '#1a1a1a',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  darkText: {
    color: '#fff',
  },
  responseContainer: {
    flex: 1,
    padding: 16,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20, // Extra padding at bottom of scroll content
  },
  responseItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  darkResponseItem: {
    backgroundColor: '#2a2a2a',
  },
  responseText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  webView: {
    height: 200,
    backgroundColor: 'transparent',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  placeholderText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'flex-end',
  },
  darkInputContainer: {
    backgroundColor: '#2a2a2a',
    borderTopColor: '#444',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 120,
    backgroundColor: '#fff',
    color: '#333',
  },
  darkTextInput: {
    backgroundColor: '#1a1a1a',
    borderColor: '#444',
    color: '#fff',
  },
  voiceButton: {
    marginLeft: 8,
    backgroundColor: '#34C759',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    width: 44,
    height: 44,
  },
  recordingButton: {
    backgroundColor: '#FF3B30',
  },
  processingButton: {
    backgroundColor: '#34C759',
  },
  voiceButtonText: {
    fontSize: 18,
  },
  disabledVoiceButton: {
    backgroundColor: '#ccc',
  },
  submitButton: {
    marginLeft: 8,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    width: 44,
    height: 44,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
  },
});

export default App;
