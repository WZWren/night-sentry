import { Text, View } from "react-native";
import { screen, renderRouter } from "expo-router/src/testing-library";
import { render } from "@testing-library/react-native";
import { AuthProvider, useAuth } from "../../contexts/auth";
import { supabase } from "../../lib/supabase";

const TestAuthComponent = () => {
    const { loggedIn } = useAuth();
    return (
        <View>
            <Text testID="log_value">{loggedIn?.id}</Text>
            <Text>testhere</Text>
        </View>
    );
}

test("render the application", async () => {
    renderRouter();
    const signInText = await screen.findByText("Log in...");
    expect(signInText).toBeTruthy();
});

describe("AuthProvider", () => {
    it('provides logged-in data to the context as expected', async () => {
        

        const { getByText } = render(
            <AuthProvider>
                <TestAuthComponent />
            </AuthProvider>
        );

        await supabase.auth.signInWithPassword({ email: process.env.TESTEMAIL, password: process.env.TESTPASSWORD });

        const textElement = getByText("test_id_here");
        console.log(textElement);
        expect(textElement.props).toBeTruthy();

        mock.mockRestore();
    });
});