import { useState } from "react";
import { View } from "react-native";
import { Text, TextInput, Button, ActivityIndicator, Snackbar } from "react-native-paper";
import { Link } from "expo-router";

import { supabase } from "../../lib/supabase";
import { viewStyle, textStyle } from "../../ui/style";

/**
 * Login page for the app. This page is the main page to redirect to when a user first
 * opens the app without an active sign-in. <br>
 * 
 * This page will redirect users to the (main)/alert page on sign-in or the (auth)/register
 * page if the user presses the sign-up button.
 */
export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [loading, setLoading] = useState(false);

    // we can use errorMsg as a true/false check, as "" is falsey in JS.
    const handleDismiss = () => {
        setErrorMsg("");
    }

    // handles the submission of email and password to the firebase client.
    const handleSubmit = async () => {
        if (email == "") {
            setErrorMsg("Email field cannot be empty.");
            return;
        }
        if (password == "") {
            setErrorMsg("Password field cannot be empty.");
            return;
        }
        // supabase differs from firebase in that the promise returns the error, bundled in the response.
        // therefore, to get the actual error, you need to extract it directly and handle explicitly, or
        // handle the error in the then block.
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({email, password});
        setLoading(false);
        if (error) {
            setErrorMsg(error.message);
            return;
        }
    }

    // we do not abstract the text input elements as they are only used 2 times in this instance.
    return (
        <View style={ viewStyle.colContainer }>
            <Text variant="headlineLarge">Log in...</Text>
            <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="emailAddress"
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                style={ viewStyle.spaceOnSides } />
            <TextInput
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="password"
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                style={ viewStyle.spaceOnSides }/>
            {!loading && <Button onPress={handleSubmit} labelStyle={ textStyle.standard }>Login</Button>}
            {loading && <ActivityIndicator size="small" style={{ marginTop: 4 }}/>}
            <View style={ viewStyle.rowView }>
                <Text style={ textStyle.standard }>No account?</Text>
                <Link href="/register" style={ textStyle.link }>Sign up</Link>
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