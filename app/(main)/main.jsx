import { View, FlatList } from 'react-native';
import { Text, Button } from "react-native-paper";
import { supabase } from "../../lib/supabase";
import { useState, useEffect } from 'react';
import { styles } from '../../lib/style';
import { useAuth } from '../../contexts/auth'; 

const handleSignout = async () => {
    supabase.auth.signOut()
        .then((success) => {
            console.log("Logout successful.")
        }).catch((error) => {
            console.log("Error: " + error.message)
        });
}

export default function HomeScreen() {
    const { loggedIn } = useAuth();
    const [firstName, setFirstName] = useState('Placeholder');
    const [lastName, setLastName] = useState('Placeholder');
    const [contactList, setContactList] = useState([]);
    const [refreshing, setRefreshing] = useState(true);
    console.log("Index loading...");

    useEffect(() => {
        (async () => {
            const { data, error } = await supabase.from("user_info").select("first_name, last_name");
            if (error) {
                console.log(error.message);
            } else {
                setFirstName(data[0].first_name);
                setLastName(data[0].last_name);
            }
        })();
        (async () => {
            const { data, error } = await supabase
                .from("close_contacts")
                .select("subscriber, name:subscriber(first_name, last_name)")
                .eq("publisher", loggedIn.id)
                .is("confirmed", true);
            if (error) {
                console.log(error.message);
            } else {
                setContactList(data);
                setRefreshing(false);
            }
        })();
    }, []);

    return (
        <View style={styles.colContainerStart}>
            <View style={styles.rowView}>
                <Text variant="headlineSmall">Hello, {firstName} {lastName}</Text>
                <Button onPress={ handleSignout } labelStyle={ styles.textStandard }>Sign Out</Button>
            </View>
            <View>
                { contactList.length == 0
                ? <Text variant="headlineSmall">You have no close contacts...</Text>
                : <FlatList data={ contactList } renderItem={({item}) => <Text>{item.name.first_name} {item.name.last_name}</Text>} refreshing={ refreshing }/> } 
            </View>
        </View>
    );
}