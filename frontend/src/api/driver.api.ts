import { apiClient } from './client';

export interface VehiclePayload {
  make: string;
  model: string;
  year: number;
  registration: string;
  color: string;
  vehicleType: string;
  seatingCapacity: number;
  bootCapacityLitres: number;
  isWAV: boolean;
  wheelchairCapacity: number;
  accessibilityEquipment: string[];
}

export interface DocumentPayload {
  type: 'ID_DOCUMENT' | 'DRIVERS_LICENSE' | 'PDP' | 'VEHICLE_REGISTRATION' | 'OPERATING_PERMIT';
  fileUrl: string;
  expiryDate?: string;
}

export interface OnboardDriverPayload {
  licenseNumber: string;
  vehicle: VehiclePayload;
  documents: DocumentPayload[];
}

export const driverApi = {
  updateStatus: async (status: 'ONLINE' | 'OFFLINE') => {
    const response = await apiClient.patch('/drivers/status', { status });
    return response.data;
  },
  updateLocation: async (latitude: number, longitude: number, heading?: number) => {
    const response = await apiClient.post('/drivers/location', { latitude, longitude, heading });
    return response.data;
  },
  getUploadUrl: async (fileName: string, contentType: string) => {
    const response = await apiClient.get(`/drivers/documents/upload-url?fileName=${fileName}&contentType=${contentType}`);
    return response.data; // Returns { data: { uploadUrl: string, fileUrl: string } }
  },
  onboard: async (data: OnboardDriverPayload) => {
    const response = await apiClient.post('/drivers/onboard', data);
    return response.data;
  }
};
