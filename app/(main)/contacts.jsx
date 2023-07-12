import { View, FlatList } from 'react-native';
import { Text, Button, FAB, PaperProvider, ActivityIndicator } from "react-native-paper";
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';

import { supabase } from "../../lib/supabase";
import { viewStyle, textStyle } from '../../ui/style';
import { useAuth } from '../../contexts/auth'; 
import { CCDialog } from '../../ui/ccdialog';
import { PendingListItem, UserListItem, UserListArea } from '../../ui/userlist';

/**
 * Asynchronously fetches the list of subscribers, with the user as the publisher.
 * 
 * @param {*} setListButtons Setter for the Pending list buttons hook. During a fetch request for
 *                           the pending list, the list buttons should be disabled.
 * @param {*} setArray Setter for the arrays in the close contacts list.
 * @param {*} setRefresh Setter for the loading bars in the UI.
 * @param {*} user The current user of the app.
 * @param {*} confirm The confirmation status of the request. If true, this is the Contacts list.
 *                    Otherwise this is the Pending list.
 */
async function fetchSubscriber(setListButtons, setArray, setRefresh, user, confirm) {
    let query = "";
    if (confirm) {
        query = "subscriber, info:subscriber(first_name, last_name, last_alert, alerts(location))";
    } else {
        query = "subscriber, info:subscriber(first_name, last_name)";
    }
    const { data, error } = await supabase
        .from("close_contacts")
        .select(query)
        .eq("publisher", user.id)
        .is("confirmed", confirm);
    if (error) {
        console.log(error.message);
    } else {
        setArray(data);
    }
    setRefresh(false);
    if (!confirm) {
        setListButtons(false);
    }
}

/**
 * Contacts page for the app. Controls the user's contact list, and allows the user to log out.
 */
export default function ContactsPage() {
    const router = useRouter();
    // gets the user from the Auth context.
    const { loggedIn } = useAuth();
    // UI database info hooks
    const [ name, setName ] = useState('Placeholder');
    const [ contact, setContact ] = useState([]);
    const [ pending, setPending ] = useState([]);
    // Prevent multiple response hooks - for accept/decline buttons in user requests.
    const [ listButtons, setListButtons ] = useState(false);
    // Hook to show UI for adding new close contact.
    const [ dialog, setDialog ] = useState(false);
    // UI responsiveness hooks
    const [ refreshName, setRefreshName ] = useState(true);
    const [ refreshContact, setRefreshContact ] = useState(true);
    const [ refreshPending, setRefreshPending ] = useState(true);
    const [ loadingSignout, setLoadingSignout ] = useState(false);

    useEffect(() => {
        // this hook should only trigger if the user is actually logged in.
        if (loggedIn) {
            (async () => {
                const { data, error } = await supabase.from("user_info").select("first_name, last_name").eq("id", loggedIn.id);
                if (error) {
                    console.log(error.message);
                } else {
                    setName(data[0].first_name + " " + data[0].last_name);
                    setRefreshName(false);
                }
            })();
        }
    }, [loggedIn]);

    useEffect(() => {
        if (refreshContact) {
            fetchSubscriber(setListButtons, setContact, setRefreshContact, loggedIn, true);
        }
    }, [refreshContact, loggedIn]);

    useEffect(() => {
        if (refreshPending) {
            fetchSubscriber(setListButtons, setPending, setRefreshPending, loggedIn, false);
        }
    }, [refreshPending, loggedIn]);

    // the unsubscription on logout is handled collectively by a removeAllChannels call during logout.
    useEffect(() => {
        if (loggedIn) {
            console.log(`channel for request subscribed for ${loggedIn.id}`);
            supabase.channel('requests_channel')
                .on('postgres_changes',
                    { event: '*', schema: 'public', table: 'close_contacts', filter: `publisher=eq.${loggedIn.id}` },
                    (payload) => {
                        console.log(`${loggedIn.id} receives change in close contacts: ${payload}`);
                        setRefreshPending(true);
                        setRefreshContact(true);
                    }
                ).subscribe((status, error) => {
                    console.log(status);
                    if (error) {
                        console.log(error.message);
                    }
                });
        }
        return async () => await supabase.removeChannel('requests_channel');
    }, [loggedIn]);

    // Handles the user signout.
    const handleSignout = async () => {
        setLoadingSignout(true);
        supabase.auth.signOut()
            .then(() => {
                console.log("Logout successful.");
            }).catch((error) => {
                console.log("Error: " + error.message);
            });
        setLoadingSignout(false);
    }

    return (
        <PaperProvider>
            <View style={viewStyle.colContainerStart}>
                <View style={viewStyle.rowView}>
                    {!refreshName && <Text variant="headlineSmall">Hello, {name}</Text>}
                    {(refreshName || loadingSignout) && <ActivityIndicator/>}
                    {!loadingSignout && <Button onPress={ handleSignout } labelStyle={ textStyle.standard }>Sign Out</Button>}
                </View>
                <UserListArea name="Current Close Contacts" setRefresh={setRefreshContact} refresh={refreshContact}>
                    { contact.length == 0
                    ? <Text variant="headlineSmall">You have no close contacts...</Text>
                    : <FlatList
                        data={ contact }
                        renderItem={ ({ item }) => UserListItem({ item }, router) }
                        refreshing={ refreshContact } />
                    }
                </UserListArea>
                <UserListArea name="Pending connections..." setRefresh={setRefreshPending} refresh={refreshPending}>
                    { pending.length == 0
                    ? <Text variant="headlineSmall">You have no pending connections.</Text>
                    : <FlatList
                        data={ pending }
                        renderItem={({ item }) => PendingListItem(
                            { item }, loggedIn, setRefreshContact, setRefreshPending, listButtons, setListButtons
                        )}
                        refreshing={ refreshPending } />
                    }
                </UserListArea>
                <FAB
                    icon="plus"
                    label="Add close contact"
                    onPress={() => setDialog(true)}
                    styles={{ 
                        position: "absolute",
                        margin: 16
                    }}
                />
            </View>
            <CCDialog visible={dialog} setVisible={setDialog} />
        </PaperProvider>
    );
}