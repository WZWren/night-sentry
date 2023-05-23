import { useState } from "react";
import { View } from "react-native";
import { Text, TextInput, Button, ActivityIndicator } from "react-native-paper";
import { auth } from "../../lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async () => {
        signInWithEmailAndPassword(auth, email, password)
            .then((credentials) => {
                console.log("Login Successful.");
            }).catch((error) => {
                console.log("Error: " + error.message);
            })
    }

    console.log("Login Page loading...");
    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <Text style={{ fontSize: 20 }}>Login to your account:</Text>
            <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="emailAddress"
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                style={{ width: '80%' }} />
            <TextInput
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="password"
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                style={{ width: '80%' }}/>
            <Button onPress={handleSubmit}>Login</Button>
        </View>
    );
}