import { useState, useEffect, createContext, useContext } from 'react';
import * as Location from 'expo-location';

const LocationContext = createContext({});

export function useNotif() {
    return useContext(LocationContext);
}

export function LocationProvider({children}) {
    const [permissionStatus, setPermissionStatus] = useState(false);
    const [location, setLocation] = useState(null);

    // TODO: Fix logic of getting the permission, and create a screen to have the user approve
    // the permissions requested.
    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            setPermissionStatus(status == 'granted');
            if (!permissionStatus) {
              console.log('Permission to access location was denied/not accepted yet.');
              return;
            }
            let location = await Location.getCurrentPositionAsync({});
            setLocation(location);
            console.log(location.coords.latitude + ", " + location.coords.longitude);
        })();
    }, []);

    return (
        <LocationContext.Provider value={location}>
            {children}
        </LocationContext.Provider>
    );
}