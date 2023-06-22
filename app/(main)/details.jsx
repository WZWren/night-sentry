import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { useCallback, useState, useRef, useEffect } from "react";
import { Button, Text } from "react-native-paper";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { Audio } from "expo-av";

import { supabase } from "../../lib/supabase";
import { epochToDate } from "../../lib/utils";
import { viewStyle } from "../../ui/style";
import Slider from "@react-native-community/slider";

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

async function fetchAudio(id) {
    const { data, error } = await supabase.storage
        .from("audio")
        .list(id, {
            limit: 3,
            offset: 0,
            sortBy: { column: 'name', order: 'desc' },
        });
    if (error) {
        console.log(`Failed to retrieve audio. ${error.message}`);
        return [];
    }
    return data.map((fileObject) => `${id}/${fileObject.name}`);
}

async function getSignedUrl(file) {
    const { data, error } = await supabase.storage
        .from("audio")
        .createSignedUrl(file, 60 * 60 * 24);
    if (error) {
        console.log(`Failed to get signed link. ${error.message}`);
        return;
    }
    console.log(data);
}

function MediaPlayer(props) {
    return (
        <View style={viewStyle.rowViewCenter}>
            <Slider style={{width: 200, height: 40}}/>
        </View>
    );
}



export default function AlertDetailsPage() {
    // payload is the query from userlist on the contacts page.
    // payload = { subscriber, info: { first_name, last_name, last_alert, alerts: {location} } }
    // location = { coords, timestamp, mocked? }, coords = { longitude, latitude, accuracy, ...rest }
    // location is an object.
    const { id } = useLocalSearchParams();
    const [ alert, setAlert ] = useState(null);
    const [ audio, setAudio ] = useState([]);
    const mapViewRef = useRef(null);
    // const playbackObject = new Audio.Sound();

    useFocusEffect(
        useCallback(() => {
            fetchAlert(id).then((callback) => setAlert(callback));
            fetchAudio(id).then((callback) => setAudio(callback));
            return () => { setAlert(null); setAudio([]) };
        }, [id])
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

    useEffect(() => {
        if (audio.length > 0) {
            console.log(audio[0]);
        }
    }, [audio]);

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
            <Button onPress={() => getSignedUrl(audio[0])}>Test Url Grabbing</Button>
            <MediaPlayer/>
        </View>
    );
}