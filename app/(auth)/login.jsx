import { useState } from "react";
import { View } from "react-native";
import { Text, TextInput, Button, ActivityIndicator, Snackbar } from "react-native-paper";
import { auth } from "../../lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

// TODO: Detach style elements from text input.
export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    // we can use errorMsg as a true/false check, as "" is falsey in JS.
    const handleDismiss = () => {
        setErrorMsg("");
    }

    const handleSubmit = async () => {
        signInWithEmailAndPassword(auth, email, password)
            .catch((error) => {
                setErrorMsg("Error: " + error.message);
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
            <Snackbar
                visible={errorMsg}
                onDismiss={handleDismiss}
                action={{
                    label: 'Dismiss',
                    onPress: handleDismiss,
                }}>
                    {errorMsg}
            </Snackbar>
        </View>
    );
}