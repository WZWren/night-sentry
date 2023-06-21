import { useState, useEffect, createContext, useContext } from 'react';
import * as Location from 'expo-location';

import { LocalPermStatus } from './permissions-status';

const LocationContext = createContext({});

export function useLocation() {
    return useContext(LocationContext);
}

export function LocationProvider({children}) {
    const [permissionStatus, setPermissionStatus] = useState(LocalPermStatus.INIT);
    const [location, setLocation] = useState(null);

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