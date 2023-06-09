import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Text, TextInput, Button, ActivityIndicator, Snackbar } from "react-native-paper";

import { supabase } from "../../lib/supabase";
import { viewStyle, textStyle } from "../../ui/style";

/**
 * Register page for the app. This page is the onboarding page for new users. <br>
 * 
 * On successful signup, users will be automatically signed-in to the app, redirecting
 * directly to the (main)/alert page.
 */

export default function Register() {
    // field react hooks
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [verify, setVerify] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    // ui error message hook
    const [errorMsg, setErrorMsg] = useState('');
    // ui responsiveness hook
    const [loading, setLoading] = useState(false);

    // we can use errorMsg as a true/false check, as "" is falsey in JS.
    const handleDismiss = () => {
        setErrorMsg("");
    }

    const handleSubmit = async () => {
        if (email == "" || password == "" || verify == "" || firstName == "" || lastName == "") {
            setErrorMsg("Fields cannot be empty.");
            return;
        }
        if (password != verify) {
            setErrorMsg("Passwords must match!");
            return;
        }
        // see comments at login to see differences from firebase
        setLoading(true);
        const { error } = await supabase.auth.signUp({
            email,
            password,
            // adjusted the signup process, as we shouldn't have to send 2 separate requests to
            // signup - instead, we package the firstName/lastName info in the metadata of the user.
            options: {
                data: {
                    first_name: firstName,
                    last_name: lastName
                }
            }
        });
        if (error) {
            setErrorMsg(error.message);
        }
        setLoading(false);
    }
    
    return (
        <View style={ viewStyle.colContainer }>
            <Text variant="headlineLarge">Sign-up...</Text>
            <TextInput
                placeholder="Email"
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="emailAddress"
                value={email}
                onChangeText={setEmail}
                style={ viewStyle.spaceOnSides } />
            <View style={ viewStyle.rowView }>
                <TextInput
                    placeholder="First Name"
                    textContentType="namePrefix"
                    value={firstName}
                    onChangeText={setFirstName}
                    style={ nativeStyle.padHalfInput }
                    />
                <TextInput
                    placeholder="Last Name"
                    textContentType="nameSuffix"
                    value={lastName}
                    onChangeText={setLastName}
                    style={ nativeStyle.padHalfInput }
                    />
            </View>
            <TextInput
                placeholder="Password"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="password"
                value={password}
                onChangeText={setPassword}
                style={ viewStyle.spaceOnSides }/>
            <TextInput
                placeholder="Re-enter Password"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="password"
                value={verify}
                onChangeText={setVerify}
                style={ viewStyle.spaceOnSides }/>
            {!loading && <Button onPress={handleSubmit} labelStyle={ textStyle.standard }>Sign-up</Button>}
            {loading && <ActivityIndicator size="small" style={{ marginTop: 4 }}/>}
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

const nativeStyle = StyleSheet.create({
    padHalfInput: {
        width: '40%',
    }
});