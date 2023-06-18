import { useEffect, useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { Text, Button, ActivityIndicator } from "react-native-paper";

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
    return (
        <View style={viewStyle.colContainer}>
            <View style={{ justifyContent: "center", flex: 1 }}>
                <Text variant="headlineSmall">We need some additional permissions to best serve you.</Text>
            </View>
            <DisplayStatus
                perms={props.perms.notifPerms}
                setPerms={props.setPerms.setNotifPerms}
                type={"Notifications: "}
                message={props.message.notifMessage} />
            <DisplayStatus
                perms={props.perms.locationPerms}
                setPerms={props.setPerms.setLocationPerms}
                type={"Locations: "}
                message={props.message.locationMessage} />
            <View style={{ padding: 8, flex: 1 }}>
                <Text variant="bodyMedium">This will redirect to the app automatically once we have the permissions.</Text>
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

// we will use this PermissionsPage as a pseudo-splash page.
export default function PermissionsPage() {
    const router = useRouter();
    const [ splash, setSplash ] = useState(true);
    const { permissionStatus: notifPerms, setPermissionStatus: setNotifPerms } = useNotif();
    const { permissionStatus: locationPerms, setPermissionStatus: setLocationPerms } = useLocation();

    useEffect(() => {
        // both notif and location are initialized as null - if one is null the other is also null.
        if (notifPerms == null || locationPerms == null) {
            setLocationPerms(LocalPermStatus.INIT);
            setNotifPerms(LocalPermStatus.INIT);
        }
        if (notifPerms == LocalPermStatus.UNDETERMINED || notifPerms == LocalPermStatus.DENIED ||
            locationPerms == LocalPermStatus.UNDETERMINED || locationPerms == LocalPermStatus.DENIED) {
            setSplash(false);
        }
    }, [notifPerms, locationPerms, setNotifPerms, setLocationPerms]);

    // if you are on this page, you came from a login - we only check for notifPerms and locationPerms, and only
    // redirect to the alerts page.
    useEffect(() => {
        if (notifPerms == LocalPermStatus.GRANTED && locationPerms == LocalPermStatus.GRANTED) {
            setSplash(true);
            router.replace('/alert');
        }
    }, [locationPerms, notifPerms, router]);

    const notifMessage = "We need notification permissions to push distress messages from your loved ones to you.";
    const locationMessage = "We need location permissions to find your location on the map " +
                            "and broadcast it to you emergency contacts.";

    return (
        <View style={viewStyle.colContainer}>
            {
                splash
                ? <Splash />
                : <AskPermissions 
                    perms={{ notifPerms, locationPerms }}
                    setPerms={{ setNotifPerms, setLocationPerms }}
                    message={{ notifMessage, locationMessage }} />
            }
        </View>
    );
}