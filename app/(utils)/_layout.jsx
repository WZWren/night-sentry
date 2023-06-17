import { Stack } from "expo-router";

export default function AuthRoot() {
    return (
        <Stack
            screenOptions={{
                headerTitle: "Before we start...",
                headerTitleAlign: "center",
            }}
        />
    );
}