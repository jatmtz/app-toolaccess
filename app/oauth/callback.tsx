import { View, Text } from "react-native";

export default function OAuthCallback() {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Autenticación completada. Redirigiendo...</Text>
        </View>
    );
}