import { View } from "react-native";
import { Text, Card, IconButton, ActivityIndicator } from "react-native-paper";
import { useAuth } from "../../contexts/auth";
import { supabase } from "../../lib/supabase";
import { useState } from "react";

export function UserListArea({ name, setRefresh, refresh, children }) {
    return(
        <View style={{ width: "80%", height: "40%", gap: 5 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 45 }}>
                <Text variant="titleLarge">{name}</Text>
                {!refresh && <IconButton icon="reload" size={16} onPress={setRefresh} mode="outlined"/>}
                {refresh && <ActivityIndicator/>}
            </View>
            { children }
        </View>
    );
}

export function UserListItem({ item }) {
    return (
        <Card mode="outlined">
            <Card.Title
                title={item.name.first_name + " " + item.name.last_name}
                subtitle="This is where you would show the last alert."/>
        </Card>
    );
}

export function PendingListItem({ item }, loggedIn, refreshContact, refreshPending) {
    const [ loading, setLoading ] = useState(false);
    // publisher and subscribers are both passed in as IDs - publisher is the curr user,
    // and subscriber is the ID of the requester, given in the form of item
    async function handleReject(publisher, subscriber, refreshPending) {
        setLoading(true);
        const { error } = await supabase.from("close_contacts")
            .delete()
            .eq("publisher", publisher)
            .eq("subscriber", subscriber);
        if (error) {
            console.log(error.message);
        }
        refreshPending(true);
        setLoading(false);
    }

    async function handleAccept(publisher, subscriber, refreshContact, refreshPending) {
        setLoading(true);
        const { error: updateError } = await supabase.from("close_contacts")
            .update({ confirmed: true })
            .eq("publisher", publisher)
            .eq("subscriber", subscriber);
        const { error: insertError } = await supabase.from("close_contacts").insert({
            publisher: subscriber,
            subscriber: publisher,
            confirmed: true
        });
        if (updateError || insertError) {
            console.log(updateError);
            console.log(insertError);
        }
        refreshContact(true);
        refreshPending(true);
        setLoading(false);
    }
    
    return (
        <Card mode="outlined">
            <Card.Title
                title={item.name.first_name + " " + item.name.last_name}/>
            <Card.Actions>
                <IconButton
                    disabled={loading}
                    icon="check"
                    mode="outlined"
                    onPress={() => handleAccept(loggedIn.id, item.subscriber, refreshContact, refreshPending)}/>
                <IconButton
                    disabled={loading}
                    icon="close"
                    mode="outlined"
                    onPress={() => handleReject(loggedIn.id, item.subscriber, refreshPending)}/>
            </Card.Actions>
        </Card>
    );
}