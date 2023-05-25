import { View } from "react-native";
import { Text, Switch, Avatar } from "react-native-paper";
import { Drawer } from "./drawer";
import { useState } from "react";

function DrawerToggle({ toggleDrawer, setToggleDrawer }) {
    return (
        <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
            <Text>Lock Swipe Drawer</Text>
            <Switch value={ toggleDrawer } onValueChange={ setToggleDrawer } />
        </View>
    );
}

function IconReplace() {
    return (
        <View style={{ padding: 10 }}>
            <Avatar.Icon size={30} icon="cctv"/>
        </View>
    );
}

export default function DrawerRoot() {
    const [toggleDrawer, setToggleDrawer] = useState(false);

    return (
        <Drawer
            screenOptions={{
                headerLeft: IconReplace,
                headerRight: () => DrawerToggle({toggleDrawer, setToggleDrawer}),
            }}>
            <Drawer.Screen
                name="main"
                options={{
                    drawerLabel: "Dashboard",
                    title: "Welcome",
                    swipeEnabled: !toggleDrawer
                }}/>
        </Drawer>
    );
}