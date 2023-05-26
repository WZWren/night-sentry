import { useState } from "react";
import { Dialog, Portal, TextInput, Button } from "react-native-paper";
import { useAuth } from "../../contexts/auth";
import { supabase } from "../../lib/supabase";

async function fetchEmail(user, email, setVisible) {
    const { data, error: emailError } = await supabase.from("user_info").select("id").eq("email", email);
    if (emailError) {
        console.log(emailError.message);
        return;
    } else if (data.length <= 0) {
        console.log("No such user found: " + data);
        return;
    }

    const { error: insertError } = await supabase.from("close_contacts").insert({
        subscriber: user.id,
        publisher: data[0].id,
        confirmed: false
    });
    if (insertError) {
        console.log(insertError.message);
    }
    setVisible(false);
}

export function CCDialog({ visible, setVisible }) {
    const { loggedIn } = useAuth();
    const [ email, setEmail ] = useState("");

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
                        onChangeText={setEmail} />
                </Dialog.Content>
                <Dialog.Actions>
                    <Button onPress={() => fetchEmail(loggedIn, email, setVisible)}>Submit</Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>
    )
}