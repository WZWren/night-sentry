import React from 'react';
import "react-native-url-polyfill/auto";
import { AlertWidget } from './widget/AlertWidget';
import * as Location from "expo-location";
import { createClient } from '@supabase/supabase-js';
import { epochToDate } from '../lib/utils';
import AsyncStorage from '@react-native-async-storage/async-storage';

const URL = process.env.PROJECT_URL;
const KEY = process.env.PROJECT_KEY;

const nameToWidget = {
    Alert: AlertWidget
};

export async function widgetTaskHandler(props) {
    const widgetInfo = props.widgetInfo;
    const Widget =
        nameToWidget[widgetInfo.widgetName];

    switch (props.widgetAction) {
        case 'WIDGET_ADDED':
            props.renderWidget(
                <Widget
                    {...widgetInfo}
                    timestamp={"No recent alerts sent from widget."}
                    isLocked={true}
                />
            );
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
            if (props.clickAction === "UNLOCK") {
                props.renderWidget(
                    <Widget
                        {...widgetInfo}
                        timestamp={props.clickActionData?.timestamp}
                        isLocked={false}
                        isLoading={false}
                    />
                );
            } else if (props.clickAction === "LOCK") {
                props.renderWidget(
                    <Widget
                        {...widgetInfo}
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
                        {...widgetInfo}
                        timestamp={props.clickActionData?.timestamp}
                        isLocked={false}
                        isLoading={true}
                    />
                );
                console.log("Rendered the loading screen.");

                const supabase = createClient(URL, KEY, {
                    auth: {
                        autoRefreshToken: false,
                        storage: AsyncStorage,
                    }
                });

                console.log("Client created.");

                const loginSession = await supabase.auth.getSession();
                if (loginSession.data.session == null) {
                    props.renderWidget(
                        <Widget
                            {...widgetInfo}
                            timestamp={"Alert failed to send - no active session."}
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
                            {...widgetInfo}
                            timestamp={error.message}
                            isLocked={true}
                            isLoading={false}
                        />
                    );
                } else {
                    props.renderWidget(
                        <Widget
                            {...widgetInfo}
                            timestamp={epochToDate(Date.now())}
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