import { useState, useEffect, createContext, useContext } from 'react';
import * as Location from 'expo-location';

import { LocalPermStatus } from './permissions-status';

const LocationContext = createContext({});

export function useLocation() {
    return useContext(LocationContext);
}

/**
 * Parent component that provides the location and its permission status as part of its context.
 * 
 * @param {*} children - The Child Components of the LocationProvider
 * @returns The LocationContext.Provider component, encapsulating the user's location and permission status.
 */
export function LocationProvider({children}) {
    const [permissionStatus, setPermissionStatus] = useState(null);
    const [location, setLocation] = useState(null);

    // useEffect hook to listen to changes in location every 3 seconds.
    useEffect(() => {
        if (permissionStatus == LocalPermStatus.INIT) {
            (async () => {
                let { status } = await Location.requestForegroundPermissionsAsync();
                setPermissionStatus(status);
                if (status !== LocalPermStatus.GRANTED) {
                  console.log('Permission to access location was denied/not accepted yet.');
                  return;
                }

                Location.watchPositionAsync(
                    LOCATION_SETTINGS,
                    (callback) => setLocation(callback)
                );
            })();
        }
    }, [permissionStatus]);

    return (
        <LocationContext.Provider value={{ location, permissionStatus, setPermissionStatus }}>
            {children}
        </LocationContext.Provider>
    );
}

const LOCATION_SETTINGS = {
    accuracy: Location.Accuracy.High,
    timeInterval: 3000,
    distanceInterval: 0,
};