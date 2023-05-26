import { View, FlatList } from 'react-native';
import { Text, Button, Card, FAB, IconButton, Portal, Dialog, PaperProvider } from "react-native-paper";
import { supabase } from "../../lib/supabase";
import { useState, useEffect } from 'react';
import { styles } from '../../lib/style';
import { useAuth } from '../../contexts/auth'; 
import { CCDialog } from './ccdialog';

const handleSignout = async () => {
    supabase.auth.signOut()
        .then((success) => {
            console.log("Logout successful.")
        }).catch((error) => {
            console.log("Error: " + error.message)
        });
}

async function fetchSubscriber(setArray, setRefresh, user, confirm) {
    const { data, error } = await supabase
        .from("close_contacts")
        .select("subscriber, name:subscriber(first_name, last_name)")
        .eq("publisher", user.id)
        .is("confirmed", confirm);
    if (error) {
        console.log(error.message);
    } else {
        setArray(data);
    }
    setRefresh(false);
}

function UserListArea({ name, refresh, children }) {
    return(
        <View style={{ width: "80%", height: "40%", gap: 5 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Text variant="titleLarge">{name}</Text>
                <IconButton icon="reload" size={16} onPress={refresh} mode="outlined"/>
            </View>
            { children }
        </View>
    );
}

function UserListItem({ item }) {
    return (
        <Card mode="outlined">
            <Card.Title
                title={item.name.first_name + " " + item.name.last_name}
                subtitle="This is where you would show the last alert."/>
        </Card>
    );
}

function PendingListItem({ item }) {
    return (
        <Card mode="outlined">
            <Card.Title
                title={item.name.first_name + " " + item.name.last_name}/>
            <Card.Actions>
                <IconButton icon="check" mode="outlined"/>
                <IconButton icon="close" mode="outlined"/>
            </Card.Actions>
        </Card>
    );
}

export default function HomeScreen() {
    const { loggedIn } = useAuth();
    const [name, setName] = useState('Placeholder');
    const [contact, setContact] = useState([]);
    const [pending, setPending] = useState([]);
    const [refreshContact, setRefreshContact] = useState(true);
    const [refreshPending, setRefreshPending] = useState(true);
    const [dialog, setDialog] = useState(false);

    console.log("Index loading...");

    useEffect(() => {
        (async () => {
            const { data, error } = await supabase.from("user_info").select("first_name, last_name").eq("id", loggedIn.id);
            if (error) {
                console.log(error.message);
            } else {
                setName(data[0].first_name + " " + data[0].last_name);
            }
        })();
    }, []);

    useEffect(() => {
        if (refreshContact) {
            fetchSubscriber(setContact, setRefreshContact, loggedIn, true);
        }
    }, [refreshContact]);

    useEffect(() => {
        if (refreshPending) {
            fetchSubscriber(setPending, setRefreshPending, loggedIn, false);
        }
    }, [refreshPending]);

    return (
        <PaperProvider>
            <View style={styles.colContainerStart}>
                <View style={styles.rowView}>
                    <Text variant="headlineSmall">Hello, {name}</Text>
                    <Button onPress={ handleSignout } labelStyle={ styles.textStandard }>Sign Out</Button>
                </View>
                <UserListArea name="Current Close Contacts" refresh={setRefreshContact}>
                    { contact.length == 0
                    ? <Text variant="headlineSmall">You have no close contacts...</Text>
                    : <FlatList
                        data={ contact }
                        renderItem={ UserListItem }
                        refreshing={ refreshContact } />
                    }
                </UserListArea>
                <UserListArea name="Pending connections..." refresh={setRefreshPending}>
                    { pending.length == 0
                    ? <Text variant="headlineSmall">You have no pending connections.</Text>
                    : <FlatList
                        data={ pending }
                        renderItem={ PendingListItem }
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