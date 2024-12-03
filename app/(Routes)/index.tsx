import { Image, StyleSheet, Platform, View } from 'react-native';
// Import the global.css file in the index.js file:
import { Button } from '@/components/ui/Button';
import { Text } from "@/components/ui/Text";
import ThemeToggleButton from '@/components/custom/ThemeToggle';
import { EmojiHappy } from 'iconsax-react-native';
import WelcomeScreen from '@/features/Home/Components/welcomeScreeenSlider';
import { Link } from 'expo-router';

export default function HomeScreen() {
  return (
    <View className="flex-1 justify-center items-center gap-5">
      <ThemeToggleButton/>
    <Button>
      <Link href={'/welcome'}><Text className='flex gap-2 justify-center items-center'>Welcome Screen <EmojiHappy variant="Bulk" color={'yellow'} size={20} /></Text></Link>
      
    </Button>
    <Button variant="destructive">
      <Text>Destructive hae !</Text>
    </Button>
    <Button variant="destructive" disabled>
      <Text>Destructive disabled</Text>
    </Button>
    <Button variant="secondary">
      <Text>Secondary</Text>
    </Button>
    <Button variant="outline" size="lg">
      <Text>Outline lg</Text>
    </Button>
    <Button variant="outline" size="sm">
      <Text>Outline sm</Text>
    </Button>
    <Button variant="ghost">
      <Text>Ghost</Text>
    </Button>
    <Button variant="link" size="sm">
      <Text>Link sm</Text>
    </Button>
  </View>
  );
}
