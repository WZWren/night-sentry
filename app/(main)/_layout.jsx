import { DrawerToggleButton } from "@react-navigation/drawer";
import { Drawer } from "../../ui/drawer";
import { useEffect, useState } from "react";
import { useSearchParams } from "expo-router";

export default function DrawerRoot() {
    const { title } = useSearchParams();

    useEffect(() => {
        console.log("Title is " + title);
    }, [title]);

    return (
        <Drawer
            screenOptions={{
                headerLeft: () => DrawerToggleButton({
                    tintColor: '#000000',
                })
            }}>
            <Drawer.Screen
                name="alert"
                options={{
                    drawerLabel: "Alert Dashboard",
                    title: "Send a Distress Signal",
                }}/>
            <Drawer.Screen
                name="contacts"
                options={{
                    drawerLabel: "User Settings",
                    title: "User Profile",
                }}/>
            <Drawer.Screen
                name="dashboard/index"
                options={{
                    drawerLabel: "NIGHTSENTRY Feed",
                    title: "Newsfeed for this Area",
                }}/>
            <Drawer.Screen
                name="details"
                options={{
                    title,
                    drawerItemStyle: { display: 'none' }
                }}/>
            <Drawer.Screen
                name="dashboard/focusedfeed"
                options={{
                    title,
                    drawerItemStyle: { display: 'none' }
                }}/>
            <Drawer.Screen
                name="dashboard/newpost"
                options={{
                    title: "Submit a New Feed",
                    drawerItemStyle: { display: 'none' }
                }}/>
        </Drawer>
    );
}