import { screen, renderRouter } from "expo-router/testing-library";

test("render the application", async () => {
    renderRouter();
    const signInText = await screen.findByText("Log In...");
    expect(signInText).toBeTruthy();
});