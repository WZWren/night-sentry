import { useEffect, useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { Text, Button, ActivityIndicator } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";

import { viewStyle } from "../../ui/style";
import { useNotif } from "../../contexts/notif";
import { useLocation } from "../../contexts/location";
import { LocalPermStatus } from "../../contexts/permissions-status";

function DisplayStatus(props) {
    const prompt = "We cannot request for the permission from the app. " +
        "Go to Settings > Apps > night-sentry to enable the permission, then press Retry.";

    return (
        <View style={{ ...viewStyle.rowViewCenter, flex: 1 }}>
            <Text variant="labelLarge" style={{ flex: 1, margin: 8 }}>{props.type}</Text>
            {
                props.perms == LocalPermStatus.INIT
                ? <ActivityIndicator size="large" style={{ flex: 2 }}/>
                : props.perms == LocalPermStatus.GRANTED
                ? <Text style={{ flex: 2 }}>All in order!</Text>
                : (
                    <View style={{ flexDirection: "column", flex: 2 }}>
                        <Text>{props.message}</Text>
                        { props.perms == LocalPermStatus.DENIED && <Text>{prompt}</Text> }
                        <Button onPress={() => props.setPerms(LocalPermStatus.INIT)}>Retry</Button>
                    </View>
                )
            }
        </View>
    );
}

function AskPermissions(props) {
    const notifMessage = "We need notification permissions to push distress messages from your loved ones to you.";
    const locationMessage = "We need location permissions to find your location on the map " +
                            "and broadcast it to you emergency contacts.";
    const micMessage = "(Optional) Enabling this allows us to record audio and help note down what might be going on" +
                       "in your surroundings";
    return (
        <View style={viewStyle.colContainer}>
            <View style={{ justifyContent: "center", flex: 1 }}>
                <Text variant="headlineSmall">We need some additional permissions to best serve you.</Text>
            </View>
            <DisplayStatus
                perms={props.perms.notifPerms}
                setPerms={props.setPerms.setNotifPerms}
                type={"Notifications: "}
                message={notifMessage} />
            <DisplayStatus
                perms={props.perms.locationPerms}
                setPerms={props.setPerms.setLocationPerms}
                type={"Locations: "}
                message={locationMessage} />
            <DisplayStatus
                perms={props.perms.micPerms}
                setPerms={props.setPerms.handleMicPerms}
                type={"Microphone: "}
                message={micMessage} />
            <View style={{ flexDirection:'row', padding: 8, flex: 1, alignItems: "center" }}>
                <View style={{ padding: 8, flex: 3, alignItems: "center", justifyContent: "center" }}>
                    <Text variant="bodyMedium">
                        This redirects automatically after the first launch once the mandatory permissions are approved.
                    </Text>
                </View>
                <Button 
                    disabled={
                        props.perms.notifPerms != LocalPermStatus.GRANTED
                            || props.perms.locationPerms != LocalPermStatus.GRANTED
                    }
                    onPress={() => props.onPress(false)}
                    style={{flex: 1}}>
                    Continue
                </Button>
            </View>
        </View>
    );
}

function Splash() {
    return (
        <View style={viewStyle.colContainer}>
            <ActivityIndicator size='large' />
        </View>
    );
}

async function checkIfFirstLaunch() {
    try {
        const hasLaunched = await AsyncStorage.getItem("has_launched");
        if (hasLaunched === null) {
            return true;
        }
        return false;
    } catch (error) {
        return false;
    }
}

// we will use this PermissionsPage as a pseudo-splash page.
export default function PermissionsPage() {
    const router = useRouter();
    const [ firstLaunch, setFirstLaunch ] = useState(true);
    const [ splash, setSplash ] = useState(true);
    const [ micPerms, setMicPerms ] = useState(LocalPermStatus.INIT);
    const { permissionStatus: notifPerms, setPermissionStatus: setNotifPerms } = useNotif();
    const { permissionStatus: locationPerms, setPermissionStatus: setLocationPerms } = useLocation();

    const handleMicPerms = async () => {
        const { status } = await Audio.requestPermissionsAsync();
        setMicPerms(status);
    }

    useEffect(() => {
        (async () => {
            const firstLaunch = await checkIfFirstLaunch();
            setFirstLaunch(firstLaunch);
            if (firstLaunch) {
                setSplash(false);
                return;
            }
            if (micPerms == LocalPermStatus.INIT) {
                setMicPerms(await Audio.getPermissionsAsync());
            }
            // both notif and location are initialized as null - if one is null the other is also null.
            if (notifPerms == null || locationPerms == null) {
                setLocationPerms(LocalPermStatus.INIT);
                setNotifPerms(LocalPermStatus.INIT);
            }
            if (notifPerms == LocalPermStatus.UNDETERMINED || notifPerms == LocalPermStatus.DENIED ||
                locationPerms == LocalPermStatus.UNDETERMINED || locationPerms == LocalPermStatus.DENIED) {
                setSplash(false);
            }
        })();
    }, [micPerms, notifPerms, locationPerms, setNotifPerms, setLocationPerms]);

    // if you are on this page, you came from a login - we only check for notifPerms and locationPerms, and only
    // redirect to the alerts page.
    useEffect(() => {
        if (notifPerms == LocalPermStatus.GRANTED && locationPerms == LocalPermStatus.GRANTED && !firstLaunch) {
            AsyncStorage.setItem("has_launched", "true");
            setSplash(true);
            router.replace('/alert');
        }
    }, [locationPerms, notifPerms, firstLaunch, router]);

    return (
        <View style={viewStyle.colContainer}>
            {
                splash
                ? <Splash />
                : <AskPermissions 
                    perms={{ notifPerms, locationPerms, micPerms }}
                    setPerms={{ setNotifPerms, setLocationPerms, handleMicPerms }}
                    onPress={setFirstLaunch} />
            }
        </View>
    );
}