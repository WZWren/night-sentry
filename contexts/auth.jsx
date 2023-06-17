import { useRouter, useSegments } from "expo-router";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { fetchPublishers, unsubClient } from "./alert";
import { Snackbar } from "react-native-paper";

const AuthContext = createContext({});

export function useAuth() {
    return useContext(AuthContext);
}

function useProtectedRoute(loggedIn) {
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        console.log("Entering protected route...");
        // this checks if the route is in the (auth) group of routes - in case
        // the user is somehow not on this route if the user is not logged in
        const inAuthGroup = segments[0] === "(auth)";
        if (!loggedIn && !inAuthGroup) {
            console.log("Routing to Login...");
            router.replace("/login");
        } else if (loggedIn && inAuthGroup) {
            console.log("Routing to Alert...");
            router.replace("/permissions");
        }
    }, [loggedIn, segments, router]);
}

/**
 * Parent component that provides the user value as part of its context.
 * 
 * @param {*} children - The Child Components of the AuthProvider
 * @returns The AuthContext.Provider component, encapsulating the user value.
 */
export function AuthProvider({ children }) {
    const [loggedIn, setLoggedIn] = useState(null);
    const [distress, setDistress] = useState("");
    console.log("AuthProvider loading...");

    useProtectedRoute(loggedIn);

    const handleDismiss = () => {
        setDistress("");
    }

    // this sets up the useEffect hooks to redirect users to the correct page.
    useEffect(() => {
        const { data } = supabase.auth.onAuthStateChange((event, session) => {
            console.log("User changed! " + event);
            if (event === "SIGNED_IN") {
                setLoggedIn(session.user);
                fetchPublishers(session.user, setDistress);
            } else if (event === "SIGNED_OUT") {
                setLoggedIn(null);
                unsubClient();
            }
        })
        return () => data.subscription.unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ loggedIn }}>
            { children }
            <Snackbar
                visible={distress}
                onDismiss={handleDismiss}
                duration={10000}>
                {distress}
            </Snackbar>
        </AuthContext.Provider>
    );
}