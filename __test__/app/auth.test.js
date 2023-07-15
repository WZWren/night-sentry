import { Text, View } from "react-native";
import { screen, render, act, fireEvent } from "@testing-library/react-native";
import { renderRouter } from "expo-router/src/testing-library";
import { AuthProvider, useAuth } from "../../contexts/auth";
import * as Snackbar from "../../contexts/snackbar";
import { supabase } from "../../lib/supabase";
import LoginPage from "../../app/(auth)/login";
import Register from "../../app/(auth)/register";

const URL = process.env.PROJECT_URL;

const TestAuthComponent = () => {
    const { loggedIn } = useAuth();
    return (
        <View>
            <Text testID="log_value">{loggedIn?.id}</Text>
            <Text>testhere</Text>
        </View>
    );
}

test("Render the Login Page", async () => {
    const renderPage = render(<LoginPage/>);
    const tree = renderPage.toJSON();
    const signInText = await screen.findByText("Log in...");
    const signInBtn = await screen.findByText("Login");
    expect(signInText).toBeTruthy();
    expect(signInBtn).toBeTruthy();
    expect(tree).toMatchSnapshot();
    renderPage.unmount();
});

it("should not make a call to the server if fields are blank", async () => {
    const snackbar = jest.spyOn(Snackbar, "useSnackbar").mockImplementation(() => ({
        setMessage: (input) => {}
    }));
    const spy = jest.spyOn(supabase.auth, "signInWithPassword");
    const renderPage = render(<LoginPage/>);
    const input = "placeholder";

    const signInBtn = await screen.findByText("Login");
    fireEvent.press(signInBtn);

    expect(spy).not.toHaveBeenCalled();
})

it("should make a call to the supabase server on login", async () => {
    const snackbar = jest.spyOn(Snackbar, "useSnackbar").mockImplementation(() => ({
        setMessage: (input) => {}
    }));
    const spy = jest.spyOn(supabase.auth, "signInWithPassword");
    const renderPage = render(<LoginPage/>);
    const input = "placeholder";

    const mailField = await screen.findByPlaceholderText("Email");
    const passField = await screen.findByPlaceholderText("Password");
    const signInBtn = await screen.findByText("Login");
    fireEvent.changeText(mailField, input);
    fireEvent.changeText(passField, input);
    fireEvent.press(signInBtn);

    expect(spy).toHaveBeenCalled();

    renderPage.unmount();
    jest.clearAllMocks();
});

describe("Signup Page", () => {
    beforeAll(async () => {
        const snackbar = jest.spyOn(Snackbar, "useSnackbar").mockImplementation(() => ({
            setMessage: (input) => {}
        }));
    });

    it("should go to signup page when signup link is pressed", async () => {
        const renderPage = renderRouter();
        const signUpLink = await screen.findByText("Sign up");
        fireEvent.press(signUpLink);

        expect(renderPage.getSegments()[1]).toBe("register");
    });

    it("should not call supabase with empty inputs", async () => {
        render(<Register />);
        const spy = jest.spyOn(supabase.auth, "signUp");
        const signUpBtn = await screen.findByText("Sign-up");
        fireEvent.press(signUpBtn);

        expect(spy).not.toBeCalled();
        spy.mockReset();
    });

    it("should not call supabase if passwords do not match", async () => {
        render(<Register />);
        const spy = jest.spyOn(supabase.auth, "signUp");
        const input = "placeholder";
        const differingInput = "holderplace";
        const mailField = await screen.findByPlaceholderText("Email");
        const firstName = await screen.findByPlaceholderText("First Name");
        const lastName  = await screen.findByPlaceholderText("Last Name");
        const passField = await screen.findByPlaceholderText("Password");
        const repwField = await screen.findByPlaceholderText("Re-enter Password");
        fireEvent.changeText(mailField, input);
        fireEvent.changeText(firstName, input);
        fireEvent.changeText(lastName , input);
        fireEvent.changeText(passField, input);
        fireEvent.changeText(repwField, differingInput);

        const signUpBtn = await screen.findByText("Sign-up");
        fireEvent.press(signUpBtn);

        expect(spy).not.toBeCalled();

        fireEvent.changeText(mailField, "");
        fireEvent.changeText(firstName, "");
        fireEvent.changeText(lastName , "");
        fireEvent.changeText(passField, "");
        fireEvent.changeText(repwField, "");
        spy.mockReset();
    });

    it("should call the supabase server on signup, if all client-side regex passes", async () => {
        render(<Register />);
        const spy = jest.spyOn(supabase.auth, "signUp");
        const input = "placeholder";
        const mailField = await screen.findByPlaceholderText("Email");
        const firstName = await screen.findByPlaceholderText("First Name");
        const lastName  = await screen.findByPlaceholderText("Last Name");
        const passField = await screen.findByPlaceholderText("Password");
        const repwField = await screen.findByPlaceholderText("Re-enter Password");
        fireEvent.changeText(mailField, input);
        fireEvent.changeText(firstName, input);
        fireEvent.changeText(lastName , input);
        fireEvent.changeText(passField, input);
        fireEvent.changeText(repwField, input);

        const signUpBtn = await screen.findByText("Sign-up");
        fireEvent.press(signUpBtn);

        expect(spy).toBeCalled();

        fireEvent.changeText(mailField, "");
        fireEvent.changeText(firstName, "");
        fireEvent.changeText(lastName , "");
        fireEvent.changeText(passField, "");
        fireEvent.changeText(repwField, "");
        spy.mockReset();
    })
});


describe("AuthProvider", () => {
    it('provides logged-in data to the context as expected', async () => {
        const spy = jest.spyOn(global, 'fetch').mockImplementation(
            async (input) => {
                return new Response(JSON.stringify(response));
            }
        )

        const { getByTestId } = render(
            <AuthProvider>
                <TestAuthComponent />
            </AuthProvider>
        );

        await act(async () => {
            const { data } = await supabase.auth.signInWithPassword({ email: process.env.TEST_MAIL, password: "password" });
            if (data) {
                console.log(data);
            }
        });

        const textElement = getByTestId("log_value");
        console.log(textElement.children[0]);
        expect(textElement.children[0]).toBeTruthy();
    }, 20000);
});

const response = {
    access_token:process.env.TEST_JWT,
    token_type:"bearer",
    expires_in:3600,
    refresh_token:"testrefresh",
    user:{
        id:"test_id_here",
        aud:"authenticated",
        role:"authenticated",
        email:process.env.TEST_MAIL,
        email_confirmed_at:"2023-05-26T15:00:39.404616Z",
        phone:"",
        confirmed_at:"2023-05-26T15:00:39.404616Z",
        last_sign_in_at:"2023-07-15T09:53:41.745610054Z",
        app_metadata:{
            provider:"email",
            providers:["email"]
        },
        user_metadata:{},
        identities:[{
            id:"test_id_here",
            user_id:"test_id_here",
            identity_data:{
                email:process.env.TEST_MAIL,
                sub:"test_id_here",
            },
            provider:"email",
            last_sign_in_at:"2023-05-26T15:00:39.403327Z",
            created_at:"2023-05-26T15:00:39.40336Z",
            updated_at:"2023-05-26T15:00:39.40336Z"
        }],
        created_at:"2023-05-26T15:00:39.401139Z",
        updated_at:"2023-07-15T09:53:41.753379Z"
    }
}