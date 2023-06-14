import { Slot } from "expo-router";

import { AuthProvider } from "../contexts/auth";
import { NotificationsProvider } from "../contexts/notif";
import { LocationProvider } from "../contexts/location";

export default function RootLayout() {
    console.log("Root Layout loading...");
    return (
        <AuthProvider>
            <LocationProvider>
                <NotificationsProvider>
                    <Slot />
                </NotificationsProvider>
            </LocationProvider>
        </AuthProvider>
    )
}