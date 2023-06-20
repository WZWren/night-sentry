import { Slot } from "expo-router";

import { AuthProvider } from "../contexts/auth";
import { NotificationsProvider } from "../contexts/notif";
import { LocationProvider } from "../contexts/location";
import { SnackbarProvider } from "../contexts/snackbar";

export default function RootLayout() {
    console.log("Root Layout loading...");
    return (
        <SnackbarProvider>
            <AuthProvider>
                <LocationProvider>
                    <NotificationsProvider>
                        <Slot />
                    </NotificationsProvider>
                </LocationProvider>
            </AuthProvider>
        </SnackbarProvider>
    )
}