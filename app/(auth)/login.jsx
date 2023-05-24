import { useState } from "react";
import { View } from "react-native";
import { Text, TextInput, Button, ActivityIndicator, Snackbar } from "react-native-paper";
import { auth } from "../../lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Link } from "expo-router";
import { authStyles } from "./style";

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    // we can use errorMsg as a true/false check, as "" is falsey in JS.
    const handleDismiss = () => {
        setErrorMsg("");
    }

    // handles the submission of email and password to the firebase client.
    const handleSubmit = async () => {
        signInWithEmailAndPassword(auth, email, password)
            .catch((error) => {
                setErrorMsg("Error: " + error.message);
            })
    }

    // we do not abstract the text input elements as they are only used 2 times in this instance.
    return (
        <View style={ authStyles.colContainer }>
            <Text variant="headlineLarge">Log in...</Text>
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
            <Button onPress={handleSubmit} labelStyle={ authStyles.textStandard }>Login</Button>
            <View style={ authStyles.rowContainer }>
                <Text style={ authStyles.textStandard }>Don't have an account?</Text>
                <Link href="/register" style={ authStyles.textLink }>Sign up</Link>
            </View>
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