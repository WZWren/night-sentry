import { Text, View } from "react-native";
import { screen, render, act, fireEvent } from "@testing-library/react-native";
import { renderRouter } from "expo-router/src/testing-library";

import * as Location from "../../contexts/location";
import * as Auth from "../../contexts/auth";
import * as Recording from "../../contexts/recording";
import AlertPage from "../../app/(main)/alert";

jest.useFakeTimers();

it("should render properly", () => {
    const renderPage = render(<AlertPage />);
    const distressBtn = renderPage.findByText("Distress Signal");
    const recordingLabel = renderPage.findByText("Tap to Record");
    expect(distressBtn).toBeTruthy();
    expect(recordingLabel).toBeTruthy();

    // expect the basic elements on the alert page to be present - if it is, proceed
    // with snapshot
    const tree = renderPage.toJSON();
    expect(tree).toMatchSnapshot();
});