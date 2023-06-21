import { useState } from "react";
import { View } from "react-native";
import { ActivityIndicator, Button, Text, IconButton, ProgressBar } from "react-native-paper";
import { Audio } from "expo-av";
import { decode } from 'base64-arraybuffer';
import * as Notifications from 'expo-notifications';
import * as FileSystem from "expo-file-system";

import { viewStyle } from "../../ui/style";
import { useAuth } from "../../contexts/auth";
import { supabase } from "../../lib/supabase";
import { useLocation } from "../../contexts/location";

/**
 * Alert Page for the app. This will be the main page for the app, and is the first
 * page to appear to the user, as an emergency situation justifies being able to quickly
 * bring up the page to access the alert system.
 */
export default function AlertPage() {
    const { loggedIn } = useAuth();
    const { location } = useLocation();
    const [ recording, setRecording ] = useState(null);
    const [ statusMessage, setMessage ] = useState("Awaiting input...");
    const [ loading, setLoading ] = useState(false);

    async function startRecording() {
        try {
            console.log('Requesting permissions..');
            await Audio.requestPermissionsAsync();
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });
    
            console.log('Starting recording..');
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: "Recording in progress...",
                    subtitle: "Tap to stop the recording.",
                    data: { onPress: stopRecording },
                    autoDismiss: true,
                },
                identifier: "recording",
                trigger: null
            });
            const { recording } = await Audio.Recording.createAsync( Audio.RecordingOptionsPresets.HIGH_QUALITY);
            setRecording(recording);
            console.log('Recording started');
        } catch (err) {
            console.error('Failed to start recording', err);
        }
    }

    async function stopRecording() {
        console.log('Stopping recording..');
        setRecording(undefined);
        await recording.stopAndUnloadAsync();
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
        });
        const uri = recording.getURI();
        console.log('Recording stopped and stored at', uri);
        const file = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
        const { data, error } = await supabase.storage.from("audio").upload(`${loggedIn.id}/${Date.now()}.m4a`, decode(file), {
            contentType: 'audio/mpeg'
        });
        if (error) {
            console.log("failed to upload. " + error.message);
        }
        console.log(data);
    }

    const handleDistress = async () => {
        setLoading(true);
        const { error } = await supabase.from("alerts").insert({
            user_id: loggedIn.id,
            location: location,
        });
        setLoading(false);
        setMessage(error ? error.message : "Alert sent!");
    }

    return (
        <View style={viewStyle.colContainer}>
            <View style={{ minHeight: 40 }}>
                {!loading && <Text variant="headlineSmall">{statusMessage}</Text>}
                {loading && <ActivityIndicator/>}
            </View>
            <Button
                buttonColor="#101010"
                rippleColor="#404040"
                textColor="#a0a0a0"
                mode="contained-tonal"
                onPress={handleDistress}
                labelStyle={{ padding: 12, fontSize: 30 }}
                contentStyle={{ height: 250 }}
            >
                Distress Signal
            </Button>
            <View style={viewStyle.rowViewCenter}>
                <View style={{flex: 1}} />
                <IconButton
                    icon={recording ? "stop" : "record"}
                    mode="outlined"
                    size={48}
                    iconColor="#880000"
                    onPress={recording ? (() => {}) : startRecording}
                    onLongPress={recording ? stopRecording : (() => {})}
                    style={{ flex: 1 }} />
                <View style={{...viewStyle.colContainer, flex: 3, gap: 12}}>
                    <ProgressBar indeterminate={recording} color="#880000" style={{ width: 150 }}/>
                    <Text variant="labelLarge">{recording ? "Hold to Stop Recording" : "Tap to Record"}</Text>
                </View>
                <View style={{flex: 1}} />
            </View>
        </View>
    );
}