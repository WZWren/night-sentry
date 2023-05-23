import { View } from 'react-native';
import { Text, Button } from "react-native-paper";
import { auth } from "../lib/firebase";
import { signOut } from "firebase/auth";

const handleSignout = async () => {
    signOut(auth)
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
            <Text>You should actually see this now :D</Text>
            <Button onPress={ handleSignout }>Sign Out</Button>
        </View>
    );
}