import { useState } from "react";
import { Dialog, Portal, TextInput, Button, Text, ActivityIndicator } from "react-native-paper";
import { useAuth } from "../contexts/auth";
import { supabase } from "../lib/supabase";
import { View } from "react-native";

async function fetchEmail(user, email, setVisible, setLoading, setError) {
    if (email == "") {
        setError("Fields should not be empty.");
        return;
    }
    setLoading(true);
    setError("");
    const { data, error: emailError } = await supabase.from("user_info").select("id").eq("email", email);
    if (emailError) {
        setError(emailError.message);
        setLoading(false);
        return;
    } else if (data.length <= 0) {
        setError("No such user found!");
        setLoading(false);
        return;
    }

    const { error: insertError } = await supabase.from("close_contacts").insert({
        subscriber: user.id,
        publisher: data[0].id,
        confirmed: false
    });
    if (!insertError) {
        setLoading(false);
        setVisible(false);
        return;
    }
    switch(insertError.code) {
        case "23505":
            setError("Request for close contact already exists.");
            break;
        case "23514":
            setError("Cannot be a close contact of yourself.");
            break;
        default:
            setError(`Unknown error: ${insertError.message}`);
    }
    setLoading(false);
}

export function CCDialog({ visible, setVisible }) {
    const { loggedIn } = useAuth();
    const [ email, setEmail ] = useState("");
    const [ loading, setLoading ] = useState(false);
    const [ error, setError ] = useState("");

    return (
        <Portal>
            <Dialog visible={ visible } onDismiss={ () => setVisible(false) }>
                <Dialog.Title>Add a close contact...</Dialog.Title>
                <Dialog.Content>
                    <TextInput
                        placeholder="Enter Close Contact Email"
                        autoCapitalize="none"
                        autoCorrect={false}
                        textContentType="emailAddress"
                        value={email}
                        onChangeText={setEmail}
                        style={{ margin: 4 }}/>
                    <View style={{ minHeight: 30, alignItems: "center"}}>
                        {!loading && <Text variant="labelLarge">{error}</Text>}
                        {loading && <ActivityIndicator/>}
                    </View>
                </Dialog.Content>
                <Dialog.Actions>
                    <Button onPress={() => fetchEmail(loggedIn, email, setVisible, setLoading, setError)}>Submit</Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>
    )
}