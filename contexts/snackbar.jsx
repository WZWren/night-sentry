import { createContext, useContext, useState } from "react";
import { Snackbar } from "react-native-paper";

const SnackbarContext = createContext({});

export function useSnackbar() {
    return useContext(SnackbarContext);
}

export function SnackbarProvider({ children }) {
    const [message, setMessage] = useState("");
    console.log("SnackbarProvider loading...");

    const handleDismiss = () => {
        setMessage("");
    }

    return (
        <SnackbarContext.Provider value={{ setMessage }}>
            { children }
            <Snackbar
                visible={message}
                onDismiss={handleDismiss}
                duration={10000}
                action={{
                    label: "Close",
                    onPress: handleDismiss
                }}>
                {message}
            </Snackbar>
        </SnackbarContext.Provider>
    );
}