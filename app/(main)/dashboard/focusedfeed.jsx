import { useRef } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { View, Image, ScrollView } from "react-native";
import { Text, Button } from "react-native-paper";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { viewStyle } from "../../../ui/style";
import { epochToDate } from "../../../lib/utils";

export default function FocusedFeedPage() {
    const mapViewRef = useRef(null);
    const router = useRouter();
    const { thread_id, title, desc, timestamp, image, coords } = useLocalSearchParams();
    const coordJSON = JSON.parse(coords);
    console.log(coordJSON);

    return (
        <View style={{ ...viewStyle.colContainerStart, paddingHorizontal: 12 }}>
            <View style={{ flex: 10 }}>
                <ScrollView contentContainerStyle={{ alignItems: "center", flexGrow: 1, rowGap: 4, paddingHorizontal: 8 }}>
                    <Text variant="headlineSmall" style={{ textAlign: "justify", flexWrap: "wrap" }}>{`${thread_id}: ${title}`}</Text>
                    { image && <Image style={{ width: "80%", maxHeight: "30%", minHeight: 240 }} source={{ uri: image }} /> }
                    <Text variant="labelLarge">{epochToDate(Number(timestamp))}</Text>
                    <Text variant="bodyMedium" style={{ textAlign: "justify", flexWrap: "wrap" }}>{desc}</Text>
                    <Text variant="headlineSmall" style={{ textAlign: "justify" }}>Location on Map</Text>
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
                        style={{ width: 340, height: 200 }}>
                        <Marker
                            coordinate={{ latitude: 1.359, longitude: 103.808 }}
                            title={"Location of Incident"}/>
                    </MapView>
                </ScrollView>
            </View>
            <View style={{ flex: 1 }}>
                <Button mode="contained" onPress={() => router.push("/dashboard")}>Return to Dashboard</Button>
            </View>
        </View>
    );
}