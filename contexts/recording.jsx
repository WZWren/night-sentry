import { createContext, useContext, useEffect, useState } from "react";
import { Audio } from "expo-av";
import { decode } from 'base64-arraybuffer';
import * as Notifications from 'expo-notifications';
import * as FileSystem from "expo-file-system";

import { useAuth } from "./auth";
import { supabase } from "../lib/supabase";
import { LocalPermStatus } from "./permissions-status";

const RecorderContext = createContext({});

export function useRecorder() {
    return useContext(RecorderContext);
}

export function RecorderProvider({children}) {
    const { loggedIn } = useAuth();
    const [ recording, setRecording ] = useState(null);
    const [ permissionStatus, setPermissionStatus ] = useState(null);

    useEffect(() => {
        if (permissionStatus == LocalPermStatus.INIT) {
            (async () => {
                let { status } = await Audio.requestPermissionsAsync();
                setPermissionStatus(status);
                if (status !== LocalPermStatus.GRANTED) {
                  console.log('Permission to access microphone was denied/not accepted yet.');
                  return;
                }
            })();
        }
    }, [permissionStatus])

    async function startRecording() {
        try {
            console.log('Requesting permissions..');
            await Audio.requestPermissionsAsync();
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });
    
            console.log('Starting recording..');
            const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: "Recording in progress...",
                    subtitle: "Tap to go to alerts page.",
                    autoDismiss: true,
                },
                identifier: "recording",
                trigger: null
            });
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
        Notifications.dismissNotificationAsync("recording");
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

    return (
        <RecorderContext.Provider value={{permissionStatus, setPermissionStatus, startRecording, stopRecording, recording}}>
            {children}
        </RecorderContext.Provider>
    );
}