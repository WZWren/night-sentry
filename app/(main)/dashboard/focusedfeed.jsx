import { useRef, useCallback } from "react";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { View, Image, ScrollView } from "react-native";
import { Text, Button } from "react-native-paper";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

import { viewStyle } from "../../../ui/style";
import { epochToDate } from "../../../lib/utils";

/**
 * The forum post details page of the app. <br>
 * 
 * This nests all the elements of a post into a ScrollView. The elements are obtained from the Local Search Parameters
 * of the Expo Router library, which is passed in to the page from the main forum dashboard.
 */
export default function FocusedFeedPage() {
    const mapViewRef = useRef(null);
    const router = useRouter();
    const { thread_id, title, desc, timestamp, image, coords } = useLocalSearchParams();
    const coordJSON = JSON.parse(coords);

    // this hook centers the map to the marker.
    useFocusEffect(
        useCallback(() => {
            if (coordJSON && mapViewRef.current) {
                mapViewRef.current.animateToRegion({
                    ...coordJSON,
                    latitudeDelta: 0.1,
                    longitudeDelta: 0.1
                }, 1000);
            }
        }, [coordJSON])
    );

    return (
        <View style={{ ...viewStyle.colContainerStart, paddingHorizontal: 12 }}>
            <View style={{ flex: 10 }}>
                <ScrollView contentContainerStyle={{ alignItems: "center", flexGrow: 1, rowGap: 4, paddingHorizontal: 8 }}>
                    <Text variant="headlineSmall" style={{ textAlign: "justify", flexWrap: "wrap" }}>{`${thread_id}: ${title}`}</Text>
                    { image && <Image style={{ width: "80%", maxHeight: "30%", minHeight: 240 }} source={{ uri: image }} /> }
                    <Text variant="labelLarge">{epochToDate(new Date(timestamp).getTime())}</Text>
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
                            coordinate={coordJSON}
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