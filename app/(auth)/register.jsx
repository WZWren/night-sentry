import { useState } from "react";
import { View } from "react-native";
import { Text, TextInput, Button, ActivityIndicator, Snackbar } from "react-native-paper";
import { supabase } from "../../lib/supabase";
import { styles } from "../../lib/style";

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [verify, setVerify] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

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
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) {
            setErrorMsg(error.message);
            return;
        } else {
            // otherwise the signup was successful.
            const { error } = await supabase.from("user_info").insert({
                id: data.user.id,
                first_name: firstName,
                last_name: lastName,
                email: data.user.email,
            });
            console.log(error ? error.message : "Insertion successful.");
        }
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
            <View style={ styles.rowView }>
                <TextInput
                    placeholder="First Name"
                    textContentType="namePrefix"
                    value={firstName}
                    onChangeText={setFirstName}
                    style={{ width: '40%' }}
                    />
                <TextInput
                    placeholder="Last Name"
                    textContentType="nameSuffix"
                    value={lastName}
                    onChangeText={setLastName}
                    style={{ width: '40%' }}
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