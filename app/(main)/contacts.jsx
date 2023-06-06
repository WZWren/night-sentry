import { View, FlatList } from 'react-native';
import { Text, Button, FAB, PaperProvider, ActivityIndicator } from "react-native-paper";
import { supabase } from "../../lib/supabase";
import { useState, useEffect } from 'react';
import { styles } from '../../lib/style';
import { useAuth } from '../../contexts/auth'; 
import { CCDialog } from '../../ui/ccdialog';
import { PendingListItem, UserListItem, UserListArea } from '../../ui/userlist';

// TODO: Clean up functions
async function fetchSubscriber(setListButtons, setArray, setRefresh, user, confirm) {
    let query = "subscriber, name:subscriber(first_name, last_name)";
    if (confirm) {
        query = "subscriber, name:subscriber(first_name, last_name), last_alert:subscriber(last_alert)";
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

export default function HomeScreen() {
    const { loggedIn } = useAuth();
    const [ name, setName ] = useState('Placeholder');
    const [ contact, setContact ] = useState([]);
    const [ pending, setPending ] = useState([]);
    const [ refreshName, setRefreshName ] = useState(true);
    const [ refreshContact, setRefreshContact ] = useState(true);
    const [ refreshPending, setRefreshPending ] = useState(true);
    const [ listButtons, setListButtons ] = useState(false);
    const [ loadingSignout, setLoadingSignout ] = useState(false);
    const [ dialog, setDialog ] = useState(false);

    console.log("Index loading...");

    useEffect(() => {
        (async () => {
            const { data, error } = await supabase.from("user_info").select("first_name, last_name").eq("id", loggedIn.id);
            if (error) {
                console.log(error.message);
            } else {
                setName(data[0].first_name + " " + data[0].last_name);
                setRefreshName(false);
            }
        })();
    }, []);

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
            <View style={styles.colContainerStart}>
                <View style={styles.rowView}>
                    {!refreshName && <Text variant="headlineSmall">Hello, {name}</Text>}
                    {(refreshName || loadingSignout) && <ActivityIndicator/>}
                    {!loadingSignout && <Button onPress={ handleSignout } labelStyle={ styles.textStandard }>Sign Out</Button>}
                </View>
                <UserListArea name="Current Close Contacts" setRefresh={setRefreshContact} refresh={refreshContact}>
                    { contact.length == 0
                    ? <Text variant="headlineSmall">You have no close contacts...</Text>
                    : <FlatList
                        data={ contact }
                        renderItem={ ({ item }) => UserListItem({ item }) }
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