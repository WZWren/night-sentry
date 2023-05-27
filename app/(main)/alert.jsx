import { View } from "react-native";
import { ActivityIndicator, Button, Text } from "react-native-paper";
import { styles } from "../../lib/style";
import { useAuth } from "../../contexts/auth";
import { supabase } from "../../lib/supabase";
import { useState } from "react";

export default function AlertPage() {
    const { loggedIn } = useAuth();
    const [ statusMessage, setMessage ] = useState("Awaiting input...");
    const [ loading, setLoading ] = useState(false);

    const handleDistress = async () => {
        setLoading(true);
        const { error } = await supabase.from("alerts").insert({
            user_id: loggedIn.id,
        });
        setLoading(false);
        setMessage(error ? error.message : "Alert sent!");
    }

    return (
        <View style={styles.colContainer}>
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