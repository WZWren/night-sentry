import { View } from 'react-native';
import { Text } from "react-native-paper";

export default function HomeScreen() {
    console.log("Index loading...");

    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <Text>You should not see this.</Text>
        </View>
    );
}