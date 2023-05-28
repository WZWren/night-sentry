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
                name="alert"
                options={{
                    drawerLabel: "Alert Dashboard",
                    title: "Distress Signal",
                    swipeEnabled: !toggleDrawer
                }}/>
            <Drawer.Screen
                name="main"
                options={{
                    drawerLabel: "User Settings",
                    title: "User Profile",
                    swipeEnabled: !toggleDrawer
                }}/>
            <Drawer.Screen
                name="ccdialog"
                options={{
                    drawerItemStyle: { display: 'none' }
                }}/>
            <Drawer.Screen
                name="userlist"
                options={{
                    drawerItemStyle: { display: 'none' }
                }}/>
            <Drawer.Screen
                name="drawer"
                options={{
                    drawerItemStyle: { display: 'none' }
                }}/>
        </Drawer>
    );
}