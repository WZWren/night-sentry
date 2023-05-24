import { Slot } from "expo-router";
import { AuthProvider } from "../contexts/auth";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function RootLayout() {
    console.log("Root Layout loading...");
    return (
        // We comment out the SafeAreaProvider as the alternative navigation panes provided by expo handles it for us.
        // <SafeAreaProvider>
        //     <SafeAreaView style={{flex: 1, justifyContent: 'center'}}>
        <AuthProvider>
            <Slot />
        </AuthProvider>
        //     </SafeAreaView>
        // </SafeAreaProvider>
    )
}