import React from 'react';
import "react-native-url-polyfill/auto";
import * as Location from "expo-location";
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { epochToDate } from '../lib/utils';
import { AlertWidget } from './widget/AlertWidget';
import { SimplifiedWidget } from './widget/SimplifiedWidget';

const URL = process.env.PROJECT_URL;
const KEY = process.env.PROJECT_KEY;

const nameToWidget = {
    Alert: AlertWidget,
    Simplified: SimplifiedWidget
};

export async function widgetTaskHandler(props) {
    const widgetInfo = props.widgetInfo;
    const Widget =
        nameToWidget[widgetInfo.widgetName];

    switch (props.widgetAction) {
        case 'WIDGET_ADDED':
            if (widgetInfo.widgetName === "Alert") {
                props.renderWidget(
                    <Widget
                        timestamp={"No alert sent yet!"}
                        isLocked={true}
                        isLoading={false}
                    />
                );
            } else {
                props.renderWidget(
                    <Widget
                        timestamp={"No alert sent."}
                        isLoading={false}
                    />
                );
            }
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
            // we do not need to differentiate the clicks between the 2 widgets, as the widgets function
            // the same with or without the additional props.
            if (props.clickAction === "UNLOCK") {
                props.renderWidget(
                    <Widget
                        timestamp={props.clickActionData?.timestamp}
                        isLocked={false}
                        isLoading={false}
                    />
                );
            } else if (props.clickAction === "LOCK") {
                props.renderWidget(
                    <Widget
                        timestamp={props.clickActionData?.timestamp}
                        isLocked={true}
                        isLoading={false}
                    />
                );
            } else if (props.clickAction === "DISTRESS") {
                // immediately set the widget to a loading state, while
                // the handler handles the rest of the widget process.
                props.renderWidget(
                    <Widget
                        timestamp={props.clickActionData?.timestamp}
                        isLocked={false}
                        isLoading={true}
                    />
                );

                // create the supabase client for the alert
                const supabase = createClient(URL, KEY, {
                    auth: {
                        autoRefreshToken: false,
                        storage: AsyncStorage,
                    }
                });

                // check if the supabase client has an active session obtained from AsyncStorage.
                const loginSession = await supabase.auth.getSession();
                if (loginSession.data.session == null) {
                    props.renderWidget(
                        <Widget
                            timestamp={"No Login Session Found."}
                            isLocked={true}
                            isLoading={false}
                        />
                    );
                    break;
                }

                const { error } = await supabase.from("alerts").insert({
                    user_id: loginSession.data.session.user.id,
                    location: await Location.getLastKnownPositionAsync(),
                });

                if (error) {
                    props.renderWidget(
                        <Widget
                            timestamp={"No Last Known Location Found."}
                            isLocked={true}
                            isLoading={false}
                        />
                    );
                } else {
                    props.renderWidget(
                        <Widget
                            timestamp={`Alert sent at ${epochToDate(Date.now())}`}
                            isLocked={true}
                            isLoading={false}
                        />
                    );
                }
            }
            break;

        default:
            break;
    }
}


/*
--- There is overlaps between usage of tasks and the tutorial on it for TaskManager ---
--- This is due to the incompatibility of Tasks with Android 13 that was discovered early on. ---
--- location.jsx, useEffect hook for LocationProvider ---
useEffect(() => {
    if (permissionStatus == LocalPermStatus.INIT) {
        (async () => {
            let { foregroundStatus } = await Location.requestForegroundPermissionsAsync();
            if (foregroundStatus !== LocalPermStatus.GRANTED) {
            console.log('Permission to access location was denied/not accepted yet.');
                setPermissionStatus(foregroundStatus);
                return;
            }
            let { backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
            setPermissionStatus(backgroundStatus);
            if (backgroundStatus !== LocalPermStatus.GRANTED) {
                console.log('Permissions not fully granted.');
                return;
            }

            Location.watchPositionAsync(
                LOCATION_SETTINGS,
                (callback) => setLocation(callback)
            );
        })();
    }
}, [permissionStatus]);

--- index.jsx, in Global JS Scope ---
TaskManager.defineTask(LOCATION_TASK_NAME, ({ data, error }) => {
    if (error) {
        console.error(error.message);
        return;
    }
    if (data) {
        const { locations } = data;
        console.log('Received new locations', locations);
        AsyncStorage.setItem("task-location", JSON.stringify(locations[0]));
        return;
    }
});

--- widget-task-handler.jsx, in CASE WIDGET CLICK ---
--- code for this section is experimental, but we were unable to get ---
--- the required background location permissions to test it ---
if (TaskManager.isTaskDefined(LOCATION_TASK_NAME)) {
    console.log("Task is defined");
}
await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
    accuracy: Location.Accuracy.Balanced,
});
if (await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME)) {
    console.log("Task is registered");
}
const location = await AsyncStorage.getItem("task-location");
const locJson = location == null ? {} : JSON.parse(location);
*/