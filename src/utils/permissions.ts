import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

export type PermissionResult = 'granted' | 'denied';

export async function requestLocationAccess(): Promise<PermissionResult> {
  const current = await Location.getForegroundPermissionsAsync();
  if (current.granted) {
    return 'granted';
  }
  const next = await Location.requestForegroundPermissionsAsync();
  return next.granted ? 'granted' : 'denied';
}

export async function requestCameraAccess(): Promise<PermissionResult> {
  const current = await ImagePicker.getCameraPermissionsAsync();
  if (current.granted) {
    return 'granted';
  }
  const next = await ImagePicker.requestCameraPermissionsAsync();
  return next.granted ? 'granted' : 'denied';
}

export async function requestPhotoLibraryAccess(): Promise<PermissionResult> {
  const current = await ImagePicker.getMediaLibraryPermissionsAsync();
  if (current.granted) {
    return 'granted';
  }
  const next = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return next.granted ? 'granted' : 'denied';
}
