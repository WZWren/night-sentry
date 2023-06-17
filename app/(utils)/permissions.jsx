import { useEffect } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { Text, Button } from "react-native-paper";

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
                ? <Text style={{ flex: 2 }}>Verifying...</Text>
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

export default function PermissionsPage() {
    const router = useRouter();
    const { permissionStatus: notifPerms, setPermissionStatus: setNotifPerms } = useNotif();
    const { permissionStatus: locationPerms, setPermissionStatus: setLocationPerms } = useLocation();

    // if you are on this page, you came from a login - we only check for notifPerms and locationPerms, and only
    // redirect to the alerts page.
    useEffect(() => {
        if (notifPerms == LocalPermStatus.GRANTED && locationPerms == LocalPermStatus.GRANTED) {
            router.replace('/alert');
        }
    }, [locationPerms, notifPerms, router]);

    const notifMessage = "We need notification permissions to push distress messages from your loved ones to you.";
    const locationMessage = "We need location permissions to find your location on the map " +
                            "and broadcast it to you emergency contacts.";

    return (
        <View style={viewStyle.colContainer}>
            <View style={{ justifyContent: "center", flex: 1 }}>
                <Text variant="headlineSmall">We need some additional permissions to best serve you.</Text>
            </View>
            <DisplayStatus
                perms={notifPerms}
                setPerms={setNotifPerms}
                type={"Notifications: "}
                message={notifMessage} />
            <DisplayStatus
                perms={locationPerms}
                setPerms={setLocationPerms}
                type={"Locations: "}
                message={locationMessage} />
            <View style={{ padding: 8, flex: 1 }}>
                <Text variant="bodyMedium">This will redirect to the app automatically once we have the permissions.</Text>
            </View>
        </View>
    );
}