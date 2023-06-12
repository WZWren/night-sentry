import { Slot } from "expo-router";

import { AuthProvider } from "../contexts/auth";
import { NotificationsProvider } from "../contexts/notif";

export default function RootLayout() {
    console.log("Root Layout loading...");
    return (
        <AuthProvider>
            <NotificationsProvider>
                <Slot />
            </NotificationsProvider>
        </AuthProvider>
    )
}