import { apiClient } from './client';

export interface RegisterPayload {
  phone: string;
  firstName: string;
  lastName: string;
  password: string;
  termsAccepted: boolean;
  privacyPolicyAccepted: boolean;
  popiaConsent: boolean;
  accessibility?: {
    requiresAccessibleTier: boolean;
    disabilityType: string;
  };
}

export const authApi = {
  login: async (data: any) => {
    const response = await apiClient.post('/auth/login', data);
    return response.data;
  },
  registerPassenger: async (data: RegisterPayload) => {
    const response = await apiClient.post('/auth/register/passenger', data);
    return response.data;
  },
};
