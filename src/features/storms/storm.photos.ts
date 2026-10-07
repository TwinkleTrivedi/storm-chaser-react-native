import { Directory, File, Paths } from 'expo-file-system';

const STORM_DIRECTORY = 'storms';

/** Copy a picker URI into app documents so the report survives a cache purge. */
export async function persistStormPhoto(id: string, sourceUri: string): Promise<string> {
  try {
    const directory = new Directory(Paths.document, STORM_DIRECTORY);
    if (!directory.exists) {
      directory.create({ intermediates: true, idempotent: true });
    }
    const destination = new File(directory, `${id}.jpg`);
    const source = new File(sourceUri);
    await source.copy(destination);
    return destination.uri;
  } catch {
    const dataUrl = await uriToDataUrl(sourceUri);
    return dataUrl ?? sourceUri;
  }
}

export function deleteStormPhoto(uri: string): void {
  if (uri.startsWith('data:')) {
    return;
  }
  try {
    const file = new File(uri);
    if (file.exists) {
      file.delete();
    }
  } catch {
    // A missing file should not block deleting the report row.
  }
}

async function uriToDataUrl(uri: string): Promise<string | null> {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(typeof reader.result === 'string' ? reader.result : null);
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}
