import * as Linking from 'expo-linking';
import { router } from 'expo-router';

export const handleDeepLink = (url: string) => {
  console.log('Deep link received:', url);
  
  try {
    const parsed = Linking.parse(url);
    console.log('Parsed URL:', parsed);
    // Handle library post links (new functionality)
    if (parsed.hostname === 'library') {
      const libraryId = parsed.path?.replace('/', '');
      if (libraryId) {
        router.push(`/library/${libraryId}` as any);
      }
    }
  } catch (error) {
    console.error('Error parsing deep link:', error);
  }
};

export const createLibraryDeepLink = (contentId: string) => {
  return `baserti://library/${contentId}`;
};