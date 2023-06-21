import { useState } from "react";
import { View } from "react-native";
import { ActivityIndicator, Button, Text, IconButton, ProgressBar } from "react-native-paper";

import { viewStyle } from "../../ui/style";
import { useAuth } from "../../contexts/auth";
import { supabase } from "../../lib/supabase";
import { useLocation } from "../../contexts/location";
import { useRecorder } from "../../contexts/recording";

/**
 * Alert Page for the app. This will be the main page for the app, and is the first
 * page to appear to the user, as an emergency situation justifies being able to quickly
 * bring up the page to access the alert system.
 */
export default function AlertPage() {
    const { loggedIn } = useAuth();
    const { location } = useLocation();
    const { startRecording, stopRecording, recording } = useRecorder();
    const [ statusMessage, setMessage ] = useState("Awaiting input...");
    const [ loading, setLoading ] = useState(false);

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