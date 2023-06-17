import { useState, useEffect, createContext, useContext } from 'react';
import * as Location from 'expo-location';

import { LocalPermStatus } from './permissions-status';

const LocationContext = createContext({});

export function useLocation() {
    return useContext(LocationContext);
}

export function LocationProvider({children}) {
    const [permissionStatus, setPermissionStatus] = useState(null);
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
                let location = await Location.getCurrentPositionAsync({});
                setLocation(location);
                console.log(location.coords.latitude + ", " + location.coords.longitude);
            })();
        }
    }, [permissionStatus]);

    return (
        <LocationContext.Provider value={{ location, permissionStatus, setPermissionStatus }}>
            {children}
        </LocationContext.Provider>
    );
}