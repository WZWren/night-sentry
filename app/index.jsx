import { View } from 'react-native';
import { Text, Button } from "react-native-paper";
import { supabase } from "../lib/supabase";

const handleSignout = async () => {
    supabase.auth.signOut()
        .then((success) => {
            console.log("Logout successful.")
        }).catch((error) => {
            console.log("Error: " + error.message)
        });
}

export default function HomeScreen() {
    console.log("Index loading...");

    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <Text>You should not see this.</Text>
            <Button onPress={ handleSignout }>Sign Out</Button>
        </View>
    );
}