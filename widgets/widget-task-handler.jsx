import React from 'react';
import "react-native-url-polyfill";
import { AlertWidget } from './widget/AlertWidget';
import * as Location from "expo-location";
import { createClient } from '@supabase/supabase-js';

const URL = process.env.PROJECT_URL;
const KEY = process.env.PROJECT_KEY;

const nameToWidget = {
    // Hello will be the **name** with which we will reference our widget.
    Alert: AlertWidget
};

export async function widgetTaskHandler(props) {
    const widgetInfo = props.widgetInfo;
    const Widget =
        nameToWidget[widgetInfo.widgetName];

    switch (props.widgetAction) {
        case 'WIDGET_ADDED':
            props.renderWidget(<Widget />);
            break;

        case 'WIDGET_UPDATE':
            // Not needed for now
            break;

        case 'WIDGET_RESIZED':
            // Not needed for now
            break;

        case 'WIDGET_DELETED':
            // Not needed for now
            break;

        case 'WIDGET_CLICK':
            if (props.clickAction === "DISTRESS") {
                // const supabase = createClient(URL, KEY, {
                //     auth: {
                //         autoRefreshToken: false,
                //         storage: AsyncStorage,
                //     }
                // });
                // const { error } = await supabase.from("alerts").insert({
                //     user_id: loggedIn.id,
                //     location: location,
                // });
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status == "granted") {
                    console.log("You pressed the widget button!");
                    console.log((await Location.getCurrentPositionAsync()).coords.longitude);
                } else {
                    console.log("Location fetching failed.");
                }
            }
            props.renderWidget(<Widget />);
            break;

        default:
            break;
    }
}