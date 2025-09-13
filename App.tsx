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
} from 'react-native';
import { WebView } from 'react-native-webview';
import { vanguardApi, AgentResponse } from './services/vanguardApi';
import { voiceService } from './services/voiceService';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [query, setQuery] = useState('');
  const [responses, setResponses] = useState<AgentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const handleSubmit = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    
    try {
      const response = await vanguardApi.sendQuery(query);
      setResponses(prev => [...prev, response]);
      setQuery('');
    } catch (error) {
      console.error('Error calling Vanguard AI Agent:', error);
      // Add error response
      const errorResponse: AgentResponse = {
        id: Date.now().toString(),
        type: 'text',
        content: `Error: Could not connect to Vanguard AI Agent. ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
      setResponses(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoicePress = async () => {
    if (isRecording) {
      try {
        const audioFile = await voiceService.stopRecording();
        setIsRecording(false);
        
        // Convert audio to text (placeholder for now)
        const transcribedText = await voiceService.convertToText(audioFile);
        setQuery(transcribedText);
        
        Alert.alert('Recording Complete', 'Voice has been transcribed to text');
      } catch (error) {
        setIsRecording(false);
        Alert.alert('Error', 'Failed to stop recording');
        console.error('Voice recording error:', error);
      }
    } else {
      try {
        await voiceService.startRecording();
        setIsRecording(true);
      } catch (error) {
        Alert.alert('Error', 'Failed to start recording. Please check microphone permissions.');
        console.error('Voice recording error:', error);
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
      
      <View style={styles.header}>
        <Text style={[styles.title, isDarkMode && styles.darkText]}>
          Vanguard AI Agent
        </Text>
      </View>

      <ScrollView style={styles.responseContainer}>
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

      <View style={[styles.inputContainer, isDarkMode && styles.darkInputContainer]}>
        <TextInput
          style={[styles.textInput, isDarkMode && styles.darkTextInput]}
          value={query}
          onChangeText={setQuery}
          placeholder={isRecording ? "Recording..." : "Type your query here..."}
          placeholderTextColor={isDarkMode ? '#888' : '#666'}
          multiline
          maxLength={500}
          editable={!isRecording}
        />
        <TouchableOpacity
          style={[
            styles.voiceButton,
            isRecording && styles.recordingButton
          ]}
          onPress={handleVoicePress}
          disabled={isLoading}
        >
          <Text style={styles.voiceButtonText}>
            {isRecording ? '⏹️' : '🎤'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!query.trim() || isLoading || isRecording) && styles.disabledButton
          ]}
          onPress={handleSubmit}
          disabled={!query.trim() || isLoading || isRecording}
        >
          <Text style={styles.submitButtonText}>
            {isLoading ? 'Sending...' : 'Send'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    padding: 16,
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
    paddingHorizontal: 12,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 44,
  },
  recordingButton: {
    backgroundColor: '#FF3B30',
  },
  voiceButtonText: {
    fontSize: 18,
  },
  submitButton: {
    marginLeft: 8,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default App;
