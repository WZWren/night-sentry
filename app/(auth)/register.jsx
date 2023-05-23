import { useState } from "react";
import { View } from "react-native";
import { Text, TextInput, Button, ActivityIndicator, Snackbar } from "react-native-paper";
import { auth } from "../../lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "expo-router";

export default function Register() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [verify, setVerify] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    // we can use errorMsg as a true/false check, as "" is falsey in JS.
    const handleDismiss = () => {
        setErrorMsg("");
    }

    const handleSubmit = async () => {
        if (email == "") {
            setErrorMsg("Email field cannot be empty.");
            return;
        }
        if (password == "" || verify == "") {
            setErrorMsg("Password fields cannot be empty.");
            return;
        }
        if (password != verify) {
            setErrorMsg("Passwords must match!");
            return;
        }
        createUserWithEmailAndPassword(auth, email, password)
            .then((success) => {
                // Firebase automatically logs you in after a signup.
                console.log("Sign-up successful!");
            })
            .catch((error) => {
                setErrorMsg("Error: " + error.message);
            })
    }
    
    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <Text style={{ fontSize: 20 }}>Sign-up for an account:</Text>
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
            <TextInput
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="password"
                value={verify}
                onChangeText={setVerify}
                placeholder="Re-enter Password"
                style={{ width: '80%' }}/>
            <Button onPress={handleSubmit}>Sign-up</Button>
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