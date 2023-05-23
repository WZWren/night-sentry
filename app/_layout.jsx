import { Slot } from "expo-router";
import { AuthProvider } from "../contexts/auth";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function RootLayout() {
    console.log("Root Layout loading...");
    return (
        <SafeAreaProvider>
            <SafeAreaView>
                <AuthProvider>
                    <Slot />
                </AuthProvider>
            </SafeAreaView>
        </SafeAreaProvider>
    )
}