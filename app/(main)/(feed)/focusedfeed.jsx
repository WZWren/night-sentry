import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { Text } from "react-native-paper";

export default function FocusedFeedPage() {
    const { thread_id } = useLocalSearchParams();

    console.log(thread_id);

    return (
        <View>
            <Text>Test Page</Text>
        </View>
    );
}