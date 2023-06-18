import { useState } from "react";
import { View } from "react-native";
import { ActivityIndicator, Button, Text } from "react-native-paper";

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
        </View>
    );
}