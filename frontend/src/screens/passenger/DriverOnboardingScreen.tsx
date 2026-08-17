import React, { useState } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity, Switch, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import { UploadCloud, CheckCircle } from 'lucide-react-native';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { driverApi, DocumentPayload, VehiclePayload } from '../../api/driver.api';
import { useAuthStore } from '../../store/useAuthStore';
import { apiClient } from '../../api/client';

export const DriverOnboardingScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  
  const [licenseNumber, setLicenseNumber] = useState('');
  const [vehicle, setVehicle] = useState<Partial<VehiclePayload>>({
    make: '', model: '', year: 2020, registration: '', color: '', vehicleType: 'SEDAN', seatingCapacity: 4, bootCapacityLitres: 300, isWAV: false, wheelchairCapacity: 0, accessibilityEquipment: []
  });

  const [documents, setDocuments] = useState<DocumentPayload[]>([]);
  const [isUploading, setIsUploading] = useState<string | null>(null);

  // File Upload Logic utilizing the Backend Pre-signed URL abstraction
  const handleFileUpload = async (docType: DocumentPayload['type']) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: ['image/*', 'application/pdf'] });
      
      if (result.canceled || !result.assets || result.assets.length === 0) return;
      const file = result.assets[0];

      setIsUploading(docType);

      // 1. Get Pre-signed URL from Backend
      const { data } = await driverApi.getUploadUrl(file.name, file.mimeType || 'application/octet-stream');
      
      // 2. Upload file directly to Cloud Storage (Mocked in local env, functional in prod)
      // In a real app using S3, we would perform a direct PUT request here using axios or fetch.
      // For this phase, we assume the mock backend instantly provisions the fileUrl.
      
      const newDoc: DocumentPayload = {
        type: docType,
        fileUrl: data.fileUrl,
      };

      setDocuments(prev => [...prev.filter(d => d.type !== docType), newDoc]);
      Alert.alert('Upload Successful', `${docType.replace('_', ' ')} attached.`);
    } catch (error) {
      Alert.alert('Upload Failed', 'Could not upload the document.');
    } finally {
      setIsUploading(null);
    }
  };

  const hasDocument = (type: string) => documents.some(d => d.type === type);

  const handleSubmit = async () => {
    if (!licenseNumber || !vehicle.make || !vehicle.registration) {
      Alert.alert('Missing Fields', 'Please complete all vehicle information.');
      return;
    }
    if (!hasDocument('ID_DOCUMENT') || !hasDocument('DRIVERS_LICENSE') || !hasDocument('VEHICLE_REGISTRATION')) {
      Alert.alert('Missing Documents', 'You must upload your ID, Driver\'s License, and Vehicle Registration.');
      return;
    }

    setIsLoading(true);
    try {
      await driverApi.onboard({
        licenseNumber,
        vehicle: vehicle as VehiclePayload,
        documents
      });

      Alert.alert(
        'Application Submitted', 
        'Your driver application is under review. Please log in again once approved to access the Driver Dashboard.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      Alert.alert('Submission Failed', error.response?.data?.message || 'Could not submit application.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-cream">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView contentContainerStyle={{ padding: 24, flexGrow: 1 }}>
          <Text className="text-3xl font-bold text-brand-green mb-2" accessibilityRole="header">Drive with AfriRide</Text>
          <Text className="text-brand-neutral mb-8">Register your vehicle and upload your documents to start earning.</Text>

          {/* Vehicle Information */}
          <Text className="text-xl font-bold text-brand-green mb-4">Vehicle Details</Text>
          <Input label="Driver's License Number" value={licenseNumber} onChangeText={setLicenseNumber} placeholder="e.g. 123456789" />
          
          <View className="flex-row justify-between">
            <View className="flex-1 mr-2"><Input label="Make" value={vehicle.make} onChangeText={t => setVehicle({...vehicle, make: t})} placeholder="e.g. Toyota" /></View>
            <View className="flex-1 ml-2"><Input label="Model" value={vehicle.model} onChangeText={t => setVehicle({...vehicle, model: t})} placeholder="e.g. Corolla" /></View>
          </View>

          <View className="flex-row justify-between">
            <View className="flex-1 mr-2"><Input label="Year" keyboardType="numeric" value={vehicle.year?.toString()} onChangeText={t => setVehicle({...vehicle, year: parseInt(t) || 2020})} /></View>
            <View className="flex-1 ml-2"><Input label="License Plate" value={vehicle.registration} onChangeText={t => setVehicle({...vehicle, registration: t})} placeholder="e.g. ABC 123 GP" /></View>
          </View>

          {/* WAV Toggle */}
          <View className="bg-brand-white rounded-xl p-4 my-4 border border-brand-lightNeutral flex-row items-center justify-between">
            <View className="flex-1 mr-4">
              <Text className="text-brand-green font-bold text-lg">Wheelchair Accessible (WAV)</Text>
              <Text className="text-brand-neutral text-xs mt-1">Does this vehicle have a ramp or lift for wheelchairs?</Text>
            </View>
            <Switch 
              value={vehicle.isWAV} 
              onValueChange={v => setVehicle({...vehicle, isWAV: v})}
              trackColor={{ false: '#E5E5E5', true: '#1C4532' }}
            />
          </View>

          <View className="h-[1px] bg-brand-lightNeutral my-6" />

          {/* Document Uploads */}
          <Text className="text-xl font-bold text-brand-green mb-4">Mandatory Documents</Text>

          {[
            { type: 'ID_DOCUMENT', label: 'South African ID' },
            { type: 'DRIVERS_LICENSE', label: 'Driver\'s License' },
            { type: 'VEHICLE_REGISTRATION', label: 'Vehicle Registration (Disc)' },
            { type: 'PDP', label: 'PrDP (Optional for now)' }
          ].map((doc) => (
            <TouchableOpacity 
              key={doc.type}
              className={`flex-row items-center justify-between p-4 rounded-xl mb-3 border ${hasDocument(doc.type) ? 'bg-brand-white border-green-500' : 'bg-brand-white border-brand-lightNeutral'}`}
              onPress={() => handleFileUpload(doc.type as DocumentPayload['type'])}
              disabled={isUploading !== null}
            >
              <View className="flex-1">
                <Text className="font-bold text-brand-neutral">{doc.label}</Text>
                <Text className="text-brand-neutral text-xs mt-1">
                  {hasDocument(doc.type) ? 'Document Uploaded' : 'Tap to upload PDF or Image'}
                </Text>
              </View>
              {isUploading === doc.type ? (
                <Text className="text-brand-green font-bold">Uploading...</Text>
              ) : hasDocument(doc.type) ? (
                <CheckCircle color="#10B981" size={24} />
              ) : (
                <UploadCloud color="#1C4532" size={24} />
              )}
            </TouchableOpacity>
          ))}

          <View className="mt-8 mb-4">
            <Button title="Submit Application" onPress={handleSubmit} isLoading={isLoading} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
