import { useRouter, useSegments } from "expo-router";

import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

const AuthContext = createContext({});

/**
 * Helper function to redirect the user to the appropriate route. <br>
 * 
 * In the original skeleton code from the Mission Control, this uses
 * the useEffect React Hook. However, as Firebase provides its own listeners
 * for changes in users, this is the Observer we pass into the onAuthStateChanged
 * listener.
 * 
 * @param {import("firebase/auth").User} user 
 */
function useProtectedRoute(user) {
    const segments = useSegments();
    const router = useRouter();

    // this checks if the route is in the (auth) group of routes - in case
    // the user is somehow not on this route if the user is not logged in
    const inAuthGroup = segments[0] === "(auth)";
    if (!user && !inAuthGroup) {
        router.replace("/login");
    } else if (user && inAuthGroup) {
        router.replace("/");
    }
}

/**
 * Parent component that provides the user value as part of its context.
 * 
 * @param {*} children - The Child Components of the AuthProvider
 * @returns The AuthContext.Provider component, encapsulating the user value.
 */
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);

    // this sets up the useEffect hooks to redirect users to the correct page.
    useProtectedRoute(user);
    onAuthStateChanged(auth, (user) => {
        setUser(user);
        useProtectedRoute(user);
    });

    return (
        <AuthContext.Provider value={{ user }}>{ children }</AuthContext.Provider>
    );
}