// components/BackButton.tsx
import { useRouter } from 'expo-router';
import { TouchableOpacity, View, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface BackButtonProps {
  tintColor?: string;
  onPress?: () => void;
  showText?: boolean;
  iconSize?: number;
  style?: object;
}

const BackButton: React.FC<BackButtonProps> = ({ 
  tintColor = '#03346E', 
  onPress, 
  showText = true,
  iconSize = 24,
  style 
}) => {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.back();
    }
  };

  return (
    <TouchableOpacity 
      onPress={handlePress} 
      style={[styles.container, style]}
      accessibilityLabel="Volver atrás"
      accessibilityRole="button"
    >
      <Ionicons name="arrow-back" size={iconSize} color={tintColor} />
      {showText && (
        <Text style={[styles.text, { color: tintColor }]}>Atrás</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  text: {
    marginLeft: 8,
    fontSize: 16,
  },
});

export default BackButton;