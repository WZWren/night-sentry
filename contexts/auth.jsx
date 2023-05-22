import { useRouter, useSegments } from "expo-router";

import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

const AuthContext = createContext({});

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

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);

    // this sets up the useEffect hooks to redirect users to the correct page.
    useProtectedRoute(user);
    onAuthStateChanged(auth, (user) => {
        setUser(user);
        useProtectedRoute(user);
    });
}