import { View } from "react-native";
import { Text, Button } from "react-native-paper";
import { styles } from "../../lib/style";
import { useAuth } from "../../contexts/auth";
import { supabase } from "../../lib/supabase";

export default function AlertPage() {
    const { loggedIn } = useAuth();

    const handleDistress = async () => {
        const { error } = await supabase.from("alerts").insert({
            user_id: loggedIn.id,
        });
        console.log(error ? error.message : "Alert inserted.");
    }

    return (
        <View style={styles.colContainer}>
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