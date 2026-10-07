import * as ImagePicker from 'expo-image-picker';

import { requestCameraAccess, requestPhotoLibraryAccess } from '@/utils/permissions';
import { AppError } from '@/utils/errors';

const PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  quality: 0.5,
};

export async function takeStormPhoto(): Promise<string | null> {
  const permission = await requestCameraAccess();
  if (permission !== 'granted') {
    throw new AppError('permission', 'Camera access is required to capture a storm photo.');
  }
  const result = await ImagePicker.launchCameraAsync(PICKER_OPTIONS);
  if (result.canceled) {
    return null;
  }
  return result.assets[0]?.uri ?? null;
}

export async function chooseStormPhoto(): Promise<string | null> {
  const permission = await requestPhotoLibraryAccess();
  if (permission !== 'granted') {
    throw new AppError('permission', 'Photo library access is required to choose an existing photo.');
  }
  const result = await ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS);
  if (result.canceled) {
    return null;
  }
  return result.assets[0]?.uri ?? null;
}
