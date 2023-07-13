import React from "react";
import renderer from "react-test-renderer";
import { render } from "@testing-library/react-native";
import { Text, View } from "react-native";
import Expo from "expo-router";
import { supabase } from "../../lib/supabase";
import { AuthProvider } from "../../contexts/auth";

jest.mock("expo-router");
Expo.useSegments.mockResolvedValue([0]);
Expo.useRouter.mockResolvedValue({ replace: () => {}});

const TestAuthComponent = () => {
    const {loggedIn} = Auth.useAuth();
    return (
        <View>
            <Text id="loggedIn">{loggedIn?.id}</Text>
        </View>
    );
}

describe("AuthProvider", () => {
    it('provides logged-in data to the context as expected', () => {
        const mock = jest.spyOn(supabase.auth, 'onAuthStateChange');
        mock.mockImplementation((callback) => {
            const event = LOGGED_IN;
            const session = {
                user: {
                    id: "test_id_here",
                },
            }
            callback(event, session);
            return { data: {} };
        });

        const { getByTestId } = render(
            <AuthProvider>
                <TestAuthComponent />
            </AuthProvider>
        );

        expect(getByTestId("loggedIn").textContent).toEqual("test_id_here");

        mock.mockRestore();
    });
});