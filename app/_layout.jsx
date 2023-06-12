import { Slot } from "expo-router";
import { ThemeProvider as NavProvider, DarkTheme } from "@react-navigation/native";
import { PaperProvider, MD3DarkTheme } from "react-native-paper"
import { AuthProvider } from "../contexts/auth";

export default function RootLayout() {
    console.log("Root Layout loading...");
    return (
        <PaperProvider theme={MD3DarkTheme}>
            <NavProvider value={DarkTheme}>
                <AuthProvider>
                    <Slot />
                </AuthProvider>
            </NavProvider>
        </PaperProvider>
    )
}