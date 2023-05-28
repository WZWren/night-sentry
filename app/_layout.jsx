import { Slot } from "expo-router";
import { AuthProvider } from "../contexts/auth";

export default function RootLayout() {
    console.log("Root Layout loading...");
    return (
        <AuthProvider>
            <Slot />
        </AuthProvider>
    )
}