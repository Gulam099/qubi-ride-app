import { TabTriggerSlotProps } from 'expo-router/ui';
import { ComponentProps, Ref, forwardRef } from 'react';
import { Text, Pressable, View } from 'react-native';
import { Home } from 'iconsax-react-native'; // Example: Import your desired icons from iconsax-react-native

type IconProps = ComponentProps<typeof Home>; // Replace `Home` with a generic icon for better reuse.

export type TabButtonProps = TabTriggerSlotProps & {
  icon: React.FC<IconProps>; // Accepts any Iconsax icon component
};

export const TabButton = forwardRef(
  ({ icon: Icon, children, isFocused, ...props }: TabButtonProps, ref: Ref<View>) => {
    return (
      <Pressable
        ref={ref}
        {...props}
        style={[
          {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexDirection: 'column',
            gap: 5,
            padding: 10,
          },
          isFocused ? { backgroundColor: 'white' } : undefined,
        ]}>
        <Icon size={24} color={isFocused ? 'green' : 'gray'} />
        <Text style={[{ fontSize: 16 }, isFocused ? { color: 'green' } : { color: 'gray' }]}>
          {children}
        </Text>
      </Pressable>
    );
  }
);
