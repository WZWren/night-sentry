import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { useCallback, useState, useRef, useEffect } from "react";
import { viewStyle } from "../../ui/style";
import { Text } from "react-native-paper";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
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
    const mapViewRef = useRef(null);

    useFocusEffect(
        useCallback(() => {
            fetchAlert(id).then((callback) => setAlert(callback));
            return () => setAlert(null);
        }, [id, setAlert])
    );

    useEffect(() => {
        if (alert && mapViewRef.current) {
            mapViewRef.current.animateToRegion({
                ...alert.location.coords,
                latitudeDelta: 0.1,
                longitudeDelta: 0.1
            }, 1000);
        }
    }, [alert]);

    return (
        <View style={viewStyle.colContainer}>
            <Text>Alert last received at: {epochToDate(alert)}</Text>
            <Text>{alert && JSON.stringify()}</Text>
            <MapView
                ref={mapViewRef}
                showsUserLocation
                provider={PROVIDER_GOOGLE}
                initialRegion={{
                    latitude: 1.359,
                    longitude: 103.808,
                    latitudeDelta: 0.1,
                    longitudeDelta: 0.1,
                }}
                style={{ width: '90%', height: '50%' }}>
                {alert && <Marker
                    tracksViewChanges
                    coordinate={alert.location.coords}
                    title={"Last Alert Location"}/>
                }
            </MapView>
        </View>
    );
}