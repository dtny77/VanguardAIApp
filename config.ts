import {
  VANGUARD_API_BASE_URL,
  VANGUARD_API_KEY,
  VANGUARD_TIMEOUT,
  VANGUARD_USE_MOCK_RESPONSES,
} from '@env';

// Configuration for Vanguard AI Agent integration
export const VANGUARD_CONFIG = {
  // Vanguard AI Agent API endpoint
  API_BASE_URL: VANGUARD_API_BASE_URL || 'https://fqmsebyf3j.execute-api.us-east-1.amazonaws.com/prod/',
  
  // API key for x-api-key header
  API_KEY: VANGUARD_API_KEY || '',
  
  // Request timeout in milliseconds
  TIMEOUT: parseInt(VANGUARD_TIMEOUT || '15000', 10),
  
  // Enable/disable mock responses for development
  USE_MOCK_RESPONSES: VANGUARD_USE_MOCK_RESPONSES === 'true',
};

export default VANGUARD_CONFIG;