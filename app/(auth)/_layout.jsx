import { Stack } from "expo-router";

export default function AuthRoot() {
    return (
        <Stack
            screenOptions={{
                headerTitle: "Authentication",
                headerTitleAlign: "center",
            }}
        />
    );
}