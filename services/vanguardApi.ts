import { VANGUARD_CONFIG } from '../config';

export interface ChartData {
  type: 'line' | 'bar' | 'pie' | 'area' | 'scatter';
  data: Array<{x: string | number, y: number, [key: string]: any}>;
  title?: string;
  xLabel?: string;
  yLabel?: string;
  colors?: string[];
}

export interface AgentResponse {
  id: string;
  type: 'text' | 'html' | 'svg' | 'chart';
  content: string;
  chartData?: ChartData;
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
      console.log('Sending request to:', this.config.baseUrl);
      console.log('Query:', query);
      console.log('Has API key:', !!this.config.apiKey);
      
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
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response:', errorText);
        throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Response data:', data);

      // Check if response contains chart data separated by ---CHART_DATA--- marker
      const responseContent = data.content || data.response || data.answer || '';
      if (responseContent.includes('---CHART_DATA---')) {
        const parts = responseContent.split('---CHART_DATA---');
        const textContent = parts[0].trim();
        
        try {
          const chartDataString = parts[1].trim();
          const chartData = JSON.parse(chartDataString);
          
          return {
            id: data.session_id || Date.now().toString(),
            type: 'chart',
            content: textContent,
            chartData: chartData,
          };
        } catch (error) {
          console.error('Failed to parse chart data:', error);
          // If chart data parsing fails, return as text
          return {
            id: data.session_id || Date.now().toString(),
            type: 'text',
            content: responseContent.replace('---CHART_DATA---', '').trim(),
          };
        }
      }

      // Check if response contains chart data in separate fields
      if (data.chart_data || data.chartData) {
        return {
          id: data.session_id || Date.now().toString(),
          type: 'chart',
          content: data.content || data.response || data.answer || 'Chart generated',
          chartData: data.chart_data || data.chartData,
        };
      }

      return {
        id: data.session_id || Date.now().toString(),
        type: data.type || 'text',
        content: responseContent || 'No response received',
      };
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Vanguard API Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        name: error instanceof Error ? error.name : 'Unknown',
        stack: error instanceof Error ? error.stack : undefined,
        url: this.config.baseUrl,
        hasApiKey: !!this.config.apiKey
      });
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