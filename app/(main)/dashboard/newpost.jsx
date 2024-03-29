import { useState, useRef, useCallback } from "react";
import { useRouter, useFocusEffect } from "expo-router";
import { View, Image, ScrollView } from "react-native";
import { Text, Button, TextInput } from "react-native-paper";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from "expo-file-system";
import { decode } from 'base64-arraybuffer';

import { useSnackbar } from "../../../contexts/snackbar";
import { supabase } from "../../../lib/supabase";
import { viewStyle } from "../../../ui/style";

/**
 * onPress handler for the Image Picker.
 */
const pickImage = async (setImage) => {
    // WARNING: On iOS, ImagePicker needs MediaLibrary Permissions to call this function.
    let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
    });

    if (!result.canceled) {
        setImage(result.assets[0].uri);
    }
}

/**
 * onPress handler for uploading the post to the server.
 * @param {*} data The packaged object containing all the data variables for a post.
 * @param {*} hooks The related hook functions to discard, refresh and set error messages.
 * @returns 
 */
const uploadFile = async (data, hooks) => {
    // verify input
    if (data.title.replace(/\s/g, '') == "") {
        hooks.setMessage("You need to put a valid title!");
        return;
    } else if (data.body.replace(/\s/g, '') == "") {
        hooks.setMessage("You need to put a valid description!");
        return;
    } else if (data.coords == null) {
        hooks.setMessage("You must mark a location!");
        return;
    }

    const filetype = checkImageFiletype(data.image);

    if (filetype == "invalid") {
        hooks.setMessage("Uploaded images should be of JPEG/PNG formats!");
        return;
    }

    hooks.setRefresh(true);

    const { data: insertData, error: insertError } = await supabase.from("forum").insert({
        title: data.title.trim(),
        desc: data.body.trim(),
        coords: data.coords,
        has_image: filetype !== null
    }).select();

    if (insertError) {
        hooks.setMessage("Error creating post: " + insertError.message);
        hooks.setRefresh(false);
        return;
    }
    
    if (filetype == null) {
        hooks.setMessage("Forum post created!");
        hooks.setRefresh(false);
        hooks.discardChanges();
        return;
    }

    const imageToUpload = await FileSystem.readAsStringAsync(data.image, { encoding: FileSystem.EncodingType.Base64 });

    const { error: uploadError } = await supabase.storage.from("forum-image")
        .upload(`${insertData[0].id}.${filetype}`, decode(imageToUpload), {
            contentType: `image/${filetype}`
        });
    if (uploadError) {
        hooks.setMessage("Failed to upload image: " + uploadError.message);
        hooks.setRefresh(false);
        return;
    }
    hooks.setMessage("Forum post created with image!");
    hooks.setRefresh(false);
    hooks.discardChanges();
    return;
}

/**
 * The New Post page of the Forum Function. <br>
 * 
 * This is a simple post creation page that takes in a title, a body,
 * a location defined by the user, and optionally an image in the gallery.
 */
export default function NewPostPage() {
    const mapViewRef = useRef(null);
    const router = useRouter();
    const { setMessage } = useSnackbar();
    const [ title, setTitle ] = useState("");
    const [ body, setBody ] = useState("");
    const [ image, setImage ] = useState(null);
    const [ coords, setCoords ] = useState(null);
    const [ refresh, setRefresh ] = useState(false);

    const getCoords = (event) => {
        setCoords(event.nativeEvent.coordinate);
    }
    
    const discardChanges = () => {
        router.push("/dashboard");
    }

    // prepackage the hooks to curry into uploadFile.
    const data = { title, body, image, coords };
    const hooks = { discardChanges, setMessage, setRefresh };

    // on leaving the screen, cleanup the hooks.
    useFocusEffect(
        useCallback(() => {
            return () => {
                setTitle("");
                setBody("");
                setImage(null);
                setCoords(null);
                setRefresh(false);
            }
        }, [])
    );

    return (
        <View style={viewStyle.colContainerStart}>
            <View style={{ flex: 10 }}>
                <ScrollView
                    contentContainerStyle={{ alignItems: "center", rowGap: 4 }}
                    style={{ minWidth: "100%" }}
                    >
                    <TextInput
                        disabled={refresh}
                        autoCorrect
                        mode="outlined"
                        autoCapitalize="sentences"
                        value={title}
                        onChangeText={setTitle}
                        label="Title"
                        placeholder="Type your title here..."
                        style={{ width: "85%" }}
                        />
                    <TextInput
                        disabled={refresh}
                        autoCorrect
                        multiline
                        numberOfLines={6}
                        mode="outlined"
                        autoCapitalize="sentences"
                        value={body}
                        onChangeText={setBody}
                        label="Body"
                        placeholder="Type your description here..."
                        style={{ width: "85%" }}
                        />
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
                            { coords && <Marker
                                coordinate={ coords }
                                title={"Location of Incident"}/> }
                        </MapView>
                    <Text variant="headlineSmall">Attach an image:</Text>
                    <Button disabled={refresh} onPress={() => pickImage(setImage)}>Select Image</Button>
                    {image && <Image source={{ uri: image }} style={{ width: 240, height: 180 }} />}
                </ScrollView>
            </View>
            <View style={{ flexDirection: "row", columnGap: 12, alignItems: "center", flex: 1 }}>
                <Button disabled={refresh} mode="contained-tonal" onPress={discardChanges}>
                    Discard Changes
                </Button>
                <Button disabled={refresh} mode="contained" onPress={() => uploadFile(data, hooks)}>
                    Submit
                </Button>
            </View>
        </View>
    );
}

/**
 * Abstracted FileType checker for the upload protocol.
 * @param {*} uri 
 * @returns null if URI is null, invalid if the URI is not of png/jpeg type, and the filetype otherwise.
 */
function checkImageFiletype(uri) {
    if (uri == null) {
        return null;
    }
    // infer the filetype from URI
    const splitURIByDot = uri.split('.');
    const filetype = splitURIByDot[splitURIByDot.length - 1];
    const regExp = /^((jp(e?g))|(png))$/i;

    if (filetype.match(regExp) == null) {
        return "invalid";
    }
    return filetype;
}