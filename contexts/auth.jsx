import { useRouter, useSegments } from "expo-router";

import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

const AuthContext = createContext({});

/**
 * Parent component that provides the user value as part of its context.
 * 
 * @param {*} children - The Child Components of the AuthProvider
 * @returns The AuthContext.Provider component, encapsulating the user value.
 */
export function AuthProvider({ children }) {
    const segments = useSegments();
    const router = useRouter();
    const [loggedIn, setLoggedIn] = useState(null);
    console.log("AuthProvider loading...");

    // this sets up the useEffect hooks to redirect users to the correct page.
    onAuthStateChanged(auth, (user) => {
        console.log("User changed! " + user);
        setLoggedIn(user);
    });

    useEffect(() => {
        console.log("Entering protected route...");
        // this checks if the route is in the (auth) group of routes - in case
        // the user is somehow not on this route if the user is not logged in
        const inAuthGroup = segments[0] === "(auth)";
        if (!loggedIn && !inAuthGroup) {
            console.log("Routing to Login...");
            router.replace("/login");
        } else if (loggedIn && inAuthGroup) {
            console.log("Routing to Root...");
            router.replace("/");
        }
    }, [loggedIn]);

    return (
        <AuthContext.Provider value={{ loggedIn }}>{ children }</AuthContext.Provider>
    );
}