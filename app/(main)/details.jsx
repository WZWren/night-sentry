import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { useCallback, useState, useRef, useEffect } from "react";
import { Button, IconButton, Menu, PaperProvider, Text } from "react-native-paper";
import Slider from "@react-native-community/slider";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { Audio } from "expo-av";

import { supabase } from "../../lib/supabase";
import { extractTimestamp } from "../../lib/utils";
import { viewStyle } from "../../ui/style";

const playbackObject = new Audio.Sound();

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

/**
 * Gets the signed URL of the Audio File.
 * @param {*} file The file in the Supabase Storage.
 * @returns The signed URL to the file.
 */
async function getSignedUrl(file) {
    const { data, error } = await supabase.storage
        .from("audio")
        .createSignedUrl(file, 60 * 60 * 24);
    if (error) {
        console.log(`Failed to get signed link. ${error.message}`);
        return;
    }
    return data.signedUrl;
}

/**
 * The Media Player component on the details page.
 * @param {*} props Contains the boolean flags for unload, playing, buffer, ended, progress and loading,
 *                  as well as the hooks for setEnded and setLoading.
 */
function MediaPlayer(props) {
    async function handleMenuPress(index) {
        props.mediaHooks.setLoading(true);
        const unloadPromise = props.audio.unloadAsync();
        props.mediaHooks.setEnded(false);
        props.index.setIndex(index);
        props.menu.setVisible(false);
        const signedUrlPromise = getSignedUrl(props.url[index]);
        await unloadPromise;
        await signedUrlPromise.then((url) => props.audio.loadAsync({ uri: url }));
        props.mediaHooks.setLoading(false);
    }

    async function handlePlay() {
        props.mediaHooks.setLoading(true);
        await props.audio.playAsync();
        props.mediaHooks.setLoading(false);
    }

    async function handlePause() {
        props.mediaHooks.setLoading(true);
        await props.audio.pauseAsync();
        props.mediaHooks.setLoading(false);
    }

    async function handleStop() {
        props.mediaHooks.setLoading(true);
        await props.audio.stopAsync();
        props.mediaHooks.setLoading(false);
    }

    async function handleReplay() {
        props.mediaHooks.setLoading(true);
        await props.audio.replayAsync({});
        props.mediaHooks.setEnded(false);
        props.mediaHooks.setLoading(false);
    }

    return (
        <View style={{...viewStyle.colContainerStart, flex: 0 }}>
            <Text>Audio Recordings of the 3 Latest Clips in descending order</Text>
            <View style={{...viewStyle.rowViewCenter, width: '80%'}}>
                <View style={{ flex: 4 }}>
                    <Menu
                        visible={props.menu.visible}
                        onDismiss={() => props.menu.setVisible(false)}
                        anchor={
                            <Button
                                disabled={
                                    props.url.length == 0
                                    || props.mediaHooks.loading
                                }
                                mode="contained"
                                onPress={() => props.menu.setVisible(true)}>
                                Playback
                            </Button>
                        }
                        anchorPosition="top">
                        {props.url.map((url, index) => {
                            return (
                                <Menu.Item
                                    key={index}
                                    onPress={() => handleMenuPress(index)}
                                    title={`Audio ${index + 1}`}
                                />
                            );
                        })}
                    </Menu>
                </View>
                <View style={{ flex: 1 }}/>
                <Text variant="labelLarge" style={{ flex: 5 }}>
                    {props.index.index != null && `Selected Audio: ${props.index.index + 1}`}
                </Text>
            </View>
            <View style={{...viewStyle.rowViewCenter, padding: 0}}>
                <IconButton
                    disabled={
                        props.url.length == 0
                        || props.mediaHooks.unload
                        || props.mediaHooks.loading
                    }
                    icon={
                        props.mediaHooks.playing
                        ? "pause"
                        : props.mediaHooks.ended
                        ? "replay"
                        : "play"
                    }
                    mode="contained-tonal" 
                    onPress={
                        props.mediaHooks.playing
                        ? handlePause
                        : props.mediaHooks.ended
                        ? handleReplay
                        : handlePlay
                    }
                    onLongPress={props.mediaHooks.playing ? handleStop : () => {}}/>
                <Slider
                    disabled
                    value={props.mediaHooks.progress}
                    style={{width: 250, height: 40}}/>
            </View>
        </View>
    );
}

/**
 * The Alerts Details Page of the app.
 */
export default function AlertDetailsPage() {
    // payload is the query from userlist on the contacts page.
    // payload = { subscriber, info: { first_name, last_name, last_alert, alerts: {location} } }
    // location = { coords, timestamp, mocked? }, coords = { longitude, latitude, accuracy, ...rest }
    // location is an object.
    const { id } = useLocalSearchParams();
    const mapViewRef = useRef(null);
    const [ alert, setAlert ] = useState(null);
    const [ audio, setAudio ] = useState([]);
    const [ visible, setVisible ] = useState(false);
    const [ index, setIndex ] = useState(null);
    // hooks for the media player
    const [ loading, setLoading ] = useState(false);
    const [ unload, setUnload ] = useState(true);
    const [ playing, setPlaying ] = useState(false);
    const [ buffer, setBuffer ] = useState(false);
    const [ ended, setEnded ] = useState(false);
    const [ progress, setProgress ] = useState(0);
    const mediaHooks = { unload, playing, buffer, ended, progress, setEnded, loading, setLoading };

    // skeleton code for onPlaybackStatusUpdate listener, from Expo AV docs
    const _onPlaybackStatusUpdate = playbackStatus => {
        if (!playbackStatus.isLoaded) {
            // Update your UI for the unloaded state
            setProgress(0);
            setUnload(true);
            if (playbackStatus.error) {
                console.log(`Encountered a fatal error during playback: ${playbackStatus.error}`);
            }
        } else {
            // Update your UI for the loaded state
            setUnload(false);
            if (playbackStatus.isPlaying) {
                // Update your UI for the playing state
                setProgress(playbackStatus.positionMillis / playbackStatus.durationMillis);
                setPlaying(true);
            } else {
                // Update your UI for the paused state
                setProgress(playbackStatus.positionMillis / playbackStatus.durationMillis);
                setPlaying(false);
            }

            if (playbackStatus.isBuffering) {
                // Update your UI for the buffering state
                setBuffer(true);
            } else {
                setBuffer(false);
            }

            if (playbackStatus.didJustFinish && !playbackStatus.isLooping) {
                // The player has just finished playing and will stop. Maybe you want to play something else?
                setProgress(1);
                setPlaying(false);
                setEnded(true);
            }
        }
    };

    // when the page is focused on by the user, fetch the alert and audio files from the DB.
    // when the page is navigated away from, reset the audio hooks and unload the audio object.
    useFocusEffect(
        useCallback(() => {
            playbackObject.unloadAsync();
            fetchAlert(id).then((callback) => setAlert(callback));
            fetchAudio(id).then((callback) => setAudio(callback));
            return () => {
                playbackObject.unloadAsync();
                setIndex(null);
                setUnload(true);
                setEnded(false);
                setAlert(null);
                setAudio([])
            };
        }, [id])
    );

    useEffect(() => {
        // Load the playbackObject and obtain the reference.
        playbackObject.setOnPlaybackStatusUpdate(_onPlaybackStatusUpdate);
    }, []);

    // this hook centers the map to the marker.
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
        <PaperProvider>
            <View style={viewStyle.colContainer}>
                <MediaPlayer
                    menu={{ visible, setVisible }}
                    index={{ index, setIndex }}
                    url={audio}
                    audio={playbackObject}
                    mediaHooks={mediaHooks} />
                <Text>Alert last received at: {extractTimestamp(alert)}</Text>
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
        </PaperProvider>
    );
}