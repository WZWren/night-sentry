import { useState } from "react";
import { View } from "react-native";
import { Text, TextInput, Button, ActivityIndicator, Snackbar } from "react-native-paper";
import { auth } from "../../lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { styles } from "../../lib/style";

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [verify, setVerify] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    // we can use errorMsg as a true/false check, as "" is falsey in JS.
    const handleDismiss = () => {
        setErrorMsg("");
    }

    // handles sign-in submission to firebase - includes a password confirmation
    // check as well
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
        <View style={ styles.colContainer }>
            <Text variant="headlineLarge">Sign-up...</Text>
            <TextInput
                placeholder="Email"
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="emailAddress"
                value={email}
                onChangeText={setEmail}
                style={{ width: '80%' }} />
            <TextInput
                placeholder="Password"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="password"
                value={password}
                onChangeText={setPassword}
                style={{ width: '80%' }}/>
            <TextInput
                placeholder="Re-enter Password"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="password"
                value={verify}
                onChangeText={setVerify}
                style={{ width: '80%' }}/>
            <Button onPress={handleSubmit} labelStyle={ styles.textStandard }>Sign-up</Button>
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