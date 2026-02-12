import axios from 'axios';
import {
  VerificationRequest,
  VerificationResponse,
  BatchVerificationRequest,
  BatchVerificationResponse,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 second timeout for batch processing
});

export const apiService = {
  /**
   * Verify a single label
   */
  async verifyLabel(request: VerificationRequest): Promise<VerificationResponse> {
    const response = await api.post<VerificationResponse>('/api/verify-label', request);
    return response.data;
  },

  /**
   * Verify multiple labels
   */
  async verifyBatch(request: BatchVerificationRequest): Promise<BatchVerificationResponse> {
    const response = await api.post<BatchVerificationResponse>('/api/verify-batch', request);
    return response.data;
  },

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string; openaiConfigured: boolean }> {
    const response = await api.get('/api/health');
    return response.data;
  },
};

/**
 * Convert File to base64 string
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = (error) => reject(error);
  });
};
