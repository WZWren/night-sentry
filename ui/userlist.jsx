import { View } from "react-native";
import { Text, Card, IconButton, ActivityIndicator } from "react-native-paper";

import { viewStyle } from "./style.js";
import { supabase } from "../lib/supabase";

function epochToDate(alert) {
    if (alert == null) {
        return "No alerts yet!";
    }
    const date = new Date(alert.location.timestamp);
    return `${date.getDate()}/${date.getMonth()}/${date.getFullYear()}, at ${date.getHours()}:${date.getMinutes()}`;
}

/**
 * User area list renders the main list area for the individual items.
 * 
 * @param {*} {name} The label of the List area.
 * @param {*} {setRefresh} The hook responsible for rendering the loading bar.
 * @param {*} {refresh} Boolean item to show the loading bar.
 * @param {*} {children} The JSX elements to render in the list area.
 */
export function UserListArea({ name, setRefresh, refresh, children }) {
    return(
        <View style={{ ...viewStyle.spaceOnSides, height: "40%", gap: 5 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 45 }}>
                <Text variant="titleLarge">{name}</Text>
                {!refresh && <IconButton icon="reload" size={16} onPress={setRefresh} mode="outlined"/>}
                {refresh && <ActivityIndicator/>}
            </View>
            { children }
        </View>
    );
}

/**
 * Item for the FlatList, that does not render internal buttons.
 * 
 * @param {*} {item} The object to render as an item of a given list. Item contains
 *                   the name object wrapping first_name and last_name, and the
 *                   last_alert object wrapping last_alert.
 */
export function UserListItem({ item }) {
    return (
        <Card mode="outlined">
            <Card.Title
                title={item.info.first_name + " " + item.info.last_name}
                subtitle={"Last alert: " + epochToDate(item.info.alerts)}/>
        </Card>
    );
}

/**
 * Item for the FlatList, that renders internal buttons.
 * 
 * @param {*} {item} The object to render as an item of a given list. Item contains
 *                   the name object wrapping first_name and last_name, and the
 *                   last_alert object wrapping last_alert.
 * @param {*} loggedIn The current user to render.
 * @param {*} refreshContact Setter to refresh the ContactList with.
 * @param {*} refreshPending Setter to refresh the PendingList with.
 * @param {*} disabled The hook to control whether the internal buttons are disabled or not.
 * @param {*} setDisabled Setter for the param hook disabled.
 */
export function PendingListItem({ item }, loggedIn, refreshContact, refreshPending, disabled, setDisabled) {
    // publisher and subscribers are both passed in as IDs - publisher is the curr user,
    // and subscriber is the ID of the requester, given in the form of item
    async function handleReject(publisher, subscriber, refreshPending) {
        setDisabled(true);
        const { error } = await supabase.from("close_contacts")
            .delete()
            .eq("publisher", publisher)
            .eq("subscriber", subscriber);
        if (error) {
            console.log(error.message);
        }
        refreshPending(true);
    }

    async function handleAccept(publisher, subscriber, refreshContact, refreshPending) {
        setDisabled(true);
        // TODO: Move the insertion to the backend.
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
    }
    
    return (
        <Card mode="outlined">
            <Card.Title
                title={item.info.first_name + " " + item.info.last_name}/>
            <Card.Actions>
                <IconButton
                    disabled={disabled}
                    icon="check"
                    mode="outlined"
                    onPress={() => handleAccept(loggedIn.id, item.subscriber, refreshContact, refreshPending)}/>
                <IconButton
                    disabled={disabled}
                    icon="close"
                    mode="outlined"
                    onPress={() => handleReject(loggedIn.id, item.subscriber, refreshPending)}/>
            </Card.Actions>
        </Card>
    );
}