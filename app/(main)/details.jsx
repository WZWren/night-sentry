import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { useCallback, useState } from "react";
import { viewStyle } from "../../ui/style";
import { Text } from "react-native-paper";
import { supabase } from "../../lib/supabase";
import { epochToDate } from "../../lib/utils";

// we define a separate fetcher function here for when the user wants to get the most updated alert
// - we want to give the user enough time to read the original alert so the user will not be disrupted by
// listener updates.
async function fetchAlert(id) {
    const { data, error } = await supabase
        .from("user_info")
        .select("last_alert(location)")
        .eq("id", id);
    if (error) {
        console.log("Failed to retrieve alert.")
        return null;
    }
    return data[0].last_alert;
}

export default function AlertDetailsPage() {
    // payload is the query from userlist on the contacts page.
    // payload = { subscriber, info: { first_name, last_name, last_alert, alerts: {location} } }
    // location = { coords, timestamp, mocked? }, coords = { longitude, latitude, accuracy, ...rest }
    // location is an object.
    const { id } = useLocalSearchParams();
    const [ alert, setAlert ] = useState(null);

    useFocusEffect(
        useCallback(() => {
            fetchAlert(id).then((callback) => setAlert(callback));
        }, [id, setAlert])
    );

    return (
        <View style={viewStyle.colContainer}>
            <Text>{id}</Text>
            <Text>{alert && epochToDate(alert)}</Text>
        </View>
    );
}