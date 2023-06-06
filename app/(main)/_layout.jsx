import { View } from "react-native";
import { Text, Switch } from "react-native-paper";
import { DrawerToggleButton } from "@react-navigation/drawer";
import { Drawer } from "../../ui/drawer";
import { useState } from "react";

function DrawerToggle({ toggleDrawer, setToggleDrawer }) {
    return (
        <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
            <Text>Lock Swipe Drawer</Text>
            <Switch value={ toggleDrawer } onValueChange={ setToggleDrawer } />
        </View>
    );
}

export default function DrawerRoot() {
    const [toggleDrawer, setToggleDrawer] = useState(false);

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
        </Drawer>
    );
}