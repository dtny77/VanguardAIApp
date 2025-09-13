import { VANGUARD_CONFIG } from '../config';

export interface AgentResponse {
  id: string;
  type: 'text' | 'html' | 'svg';
  content: string;
}

export interface VanguardApiConfig {
  baseUrl: string;
  apiKey?: string;
  timeout?: number;
}

class VanguardApiService {
  private config: VanguardApiConfig;

  constructor(config: VanguardApiConfig) {
    this.config = {
      timeout: 10000,
      ...config,
    };
  }

  async sendQuery(query: string): Promise<AgentResponse> {
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => {
      abortController.abort();
    }, this.config.timeout!);

    try {
      // Call the root endpoint directly (not /query)
      const response = await fetch(this.config.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'x-api-key': this.config.apiKey }),
        },
        body: JSON.stringify({ query }),
        signal: abortController.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        id: Date.now().toString(),
        type: data.type || 'text',
        content: data.content || data.response || data.answer || 'No response received',
      };
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Vanguard API Error:', error);
      throw error; // Re-throw to be handled by the component
    }
  }

  // Method to handle different response types from the API
  processResponse(rawResponse: any): AgentResponse {
    if (typeof rawResponse === 'string') {
      return {
        id: Date.now().toString(),
        type: 'text',
        content: rawResponse,
      };
    }

    // Handle HTML/SVG responses
    if (rawResponse.html || rawResponse.svg) {
      return {
        id: Date.now().toString(),
        type: rawResponse.html ? 'html' : 'svg',
        content: rawResponse.html || rawResponse.svg,
      };
    }

    // Handle structured responses
    return {
      id: Date.now().toString(),
      type: rawResponse.type || 'text',
      content: rawResponse.content || rawResponse.message || 'No content received',
    };
  }

  // Update configuration
  updateConfig(newConfig: Partial<VanguardApiConfig>) {
    this.config = { ...this.config, ...newConfig };
  }
}

// Default configuration using values from config file
const defaultConfig: VanguardApiConfig = {
  baseUrl: VANGUARD_CONFIG.API_BASE_URL,
  apiKey: VANGUARD_CONFIG.API_KEY,
  timeout: VANGUARD_CONFIG.TIMEOUT,
};

export const vanguardApi = new VanguardApiService(defaultConfig);
export default VanguardApiService;