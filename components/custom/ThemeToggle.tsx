import React, { useEffect } from 'react';
import { useColorScheme } from "nativewind";
import { Button } from "@/components/ui/Button"
import { Text } from "@/components/ui/Text"

export default function ThemeToggleButton() {
  const { colorScheme, setColorScheme } = useColorScheme();

  useEffect(() => {
    setColorScheme('dark');
  }, []);

  const toggleColorScheme = () => {
    setColorScheme(colorScheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Button onPress={toggleColorScheme}>
      <Text>Toggle theme (Current: {colorScheme})</Text>
    </Button>
  );
}