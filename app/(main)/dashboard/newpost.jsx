import { useState, useRef, useCallback } from "react";
import { useRouter, useFocusEffect } from "expo-router";
import { View, Image, ScrollView } from "react-native";
import { Text, Button, TextInput } from "react-native-paper";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as ImagePicker from 'expo-image-picker';
import { viewStyle } from "../../../ui/style";

export default function NewPostPage() {
    const router = useRouter();
    const mapViewRef = useRef(null);
    const [ image, setImage ] = useState(null);
    const [ coord, setCoord ] = useState(null);

    const pickImage = async () => {
        // WARNING: On iOS, ImagePicker needs MediaLibrary Permissions to call this function.
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    }

    const getCoords = (event) => {
        setCoord(event.nativeEvent.coordinate);
    }

    const discardChanges = () => {
        router.push("/dashboard");
    }

    // on leaving the screen, cleanup the hooks.
    useFocusEffect(
        useCallback(() => {
            return () => {
                setImage(null);
                setCoord(null);
            }
        }, [])
    );

    return (
        <View style={viewStyle.colContainerStart}>
            <View style={{ flex: 10 }}>
                <ScrollView contentContainerStyle={{ alignItems: "center", rowGap: 4, width: "100%" }}>
                    <TextInput
                        autoCorrect
                        mode="outlined"
                        autoCapitalize="sentences"
                        // value={email}
                        // onChangeText={setEmail}
                        label="Title"
                        placeholder="Type your title here..."
                        style={{ width: "100%" }} />
                    <TextInput
                        autoCorrect
                        multiline
                        numberOfLines={6}
                        mode="outlined"
                        autoCapitalize="sentences"
                        // value={email}
                        // onChangeText={setEmail}
                        label="Body"
                        placeholder="Type your description here..."
                        style={{ width: "100%" }} />
                    <Text variant="headlineSmall">Long-Press to Select Location</Text>
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
                            style={{ width: 340, height: 200 }}
                            onLongPress={getCoords} >
                            { coord && <Marker
                                coordinate={ coord }
                                title={"Location of Incident"}/> }
                        </MapView>
                    <Text variant="headlineSmall">Attach an image:</Text>
                    <Button onPress={pickImage}>Select Image</Button>
                    {image && <Image source={{ uri: image }} style={{ width: 240, height: 180 }} />}
                </ScrollView>
            </View>
            <View style={{ flexDirection: "row", columnGap: 12, alignItems: "center", flex: 1 }}>
                <Button mode="contained-tonal" onPress={discardChanges}>
                    Discard Changes
                </Button>
                <Button mode="contained">
                    Submit
                </Button>
            </View>
        </View>
    );
}