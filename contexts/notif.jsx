// TODO: Move Notifications to its separate context.

import { createContext, useContext, useEffect, useState, useRef } from "react";
import { Platform } from "react-native";
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

import { supabase } from "../lib/supabase";
import { useAuth } from "./auth";
import { useRecorder } from "./recording";
import { LocalPermStatus } from "./permissions-status";
import { useRouter } from "expo-router";

const NotificationsContext = createContext({});

export function useNotif() {
    return useContext(NotificationsContext);
}

// we handle the notification signup in the layout slot.
// notifications taken directly from the expo-notifications example.
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    })
});

async function registerForPushNotificationsAsync(setPermissionStatus) {
    let token;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== LocalPermStatus.GRANTED) {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        setPermissionStatus(finalStatus);
        if (finalStatus !== LocalPermStatus.GRANTED) {
            console.log('Failed to get push token for push notification!');
            return;
        }
        token = (await Notifications.getExpoPushTokenAsync({ projectId: process.env.EAS_KEY })).data;
        console.log(token);
    } else {
        console.log('Must use physical device for Push Notifications');
    }

    return token;
}

export function NotificationsProvider({ children }) {
    const { stopRecording } = useRecorder();
    const router = useRouter();
    const { loggedIn } = useAuth();
    // exposes the status of the permissions fetch request
    const [ permissionStatus, setPermissionStatus ] = useState(null);
    // expoPushToken is to be pushed to the supabase user_info table.
    const [ expoPushToken, setExpoPushToken ] = useState("");
    // notification is the physical notification from the app
    const [ notification, setNotification ] = useState(null);
    const notificationListener = useRef();
    const responseListener = useRef();

    useEffect(() => {
        if (permissionStatus == LocalPermStatus.INIT) {
            registerForPushNotificationsAsync(setPermissionStatus).then(token => setExpoPushToken(token));
            
            notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
                setNotification(notification);
                console.log("Notification received! " + notification.request.content.title);
            });
        
            responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
                if (response.notification.request.identifier == "recording") {
                    router.push("/alert");
                    console.log(response.notification.request.content.subtitle);
                    stopRecording();
                } else {
                    router.push("/contacts");
                }
            });
        }
    }, [permissionStatus, router, stopRecording]);

    useEffect(() => {
        if (loggedIn && expoPushToken) {
            console.log("Updating user token: " + expoPushToken);
            (async () => {
                const { error } = await supabase.from("user_info")
                    .update({ expo_token: expoPushToken })
                    .eq("id", loggedIn.id);
                if (error) {
                    console.log(error.message);
                }
            })();
        }
    }, [loggedIn, expoPushToken]);

    return (
        <NotificationsContext.Provider value={{ notification, permissionStatus, expoPushToken, setPermissionStatus }}>
            {children}
        </NotificationsContext.Provider>
    );
}