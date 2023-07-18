import { View } from "react-native";
import { Text, Switch } from "react-native-paper";
import { DrawerToggleButton } from "@react-navigation/drawer";
import { Drawer } from "../../ui/drawer";
import { useEffect, useState } from "react";
import { useSearchParams } from "expo-router";

function DrawerToggle({ toggleDrawer, setToggleDrawer }) {
    return (
        <View style={{ flexDirection: "column", justifyContent: "center", alignItems: "center", gap: -4, margin: 8, marginBottom: 16 }}>
            <Switch value={ toggleDrawer } onValueChange={ setToggleDrawer } />
            <Text variant="labelSmall">Lock Drawer</Text>
        </View>
    );
}

export default function DrawerRoot() {
    const { title } = useSearchParams();
    const [toggleDrawer, setToggleDrawer] = useState(false);

    useEffect(() => {
        console.log("Title is " + title);
    }, [title]);

    return (
        <Drawer
            screenOptions={{
                headerLeft: () => DrawerToggleButton({
                    tintColor: toggleDrawer ? '#FF0000' : '#000000',
                    disabled: toggleDrawer,
                }),
                headerRight: () => DrawerToggle({toggleDrawer, setToggleDrawer}),
            }}>
            <Drawer.Screen
                name="alert"
                options={{
                    drawerLabel: "Alert Dashboard",
                    title: "Distress Signal",
                    swipeEnabled: !toggleDrawer
                }}/>
            <Drawer.Screen
                name="contacts"
                options={{
                    drawerLabel: "User Settings",
                    title: "User Profile",
                    swipeEnabled: !toggleDrawer
                }}/>
            <Drawer.Screen
                name="widget_preview"
                options={{
                    drawerLabel: "Preview Widget Page (REMOVE ON PRODUCTION)",
                    title: "Widget Preview",
                    swipeEnabled: !toggleDrawer
                }}/>
            <Drawer.Screen
                name="details"
                options={{
                    title,
                    drawerItemStyle: { display: 'none' }
                }}/>
        </Drawer>
    );
}