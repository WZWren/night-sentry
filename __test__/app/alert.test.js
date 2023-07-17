import { screen, render, fireEvent } from "@testing-library/react-native";
import { rest } from "msw";
import { setupServer } from "msw/node";

import 'react-native-url-polyfill/auto';
import { createClient } from "@supabase/supabase-js";

import * as Location from "../../contexts/location";
import * as Auth from "../../contexts/auth";
import * as Recording from "../../contexts/recording";
import * as DB from "../../lib/supabase";
import AlertPage from "../../app/(main)/alert";

const URL = process.env.PROJECT_URL;
const KEY = process.env.PROJECT_KEY;

// this mirrors the internal implementation of resolveFetch for Supabase.
var _fetch = async (...args) => await (await import('cross-fetch')).fetch(...args);
const fetcher = (...args) => _fetch(...args);

const replacement = createClient(URL, KEY, {
    auth: {
        persistSession: false,
    },
    global: {
        fetch: fetcher,
    }
});

const server = setupServer(
    rest.post(`${URL}/rest/v1/alerts`, async (req, res, ctx) => {
        return res(
            ctx.status(401),
            ctx.json({
                "code": "42703",
                "details": null,
                "hint": null,
                "message": "Intercepted this message."
            })
        );
    }),
);

beforeAll(() => {
    server.listen();
    jest.replaceProperty(DB, "supabase", replacement);
    jest.useFakeTimers();
    jest.spyOn(Auth, "useAuth").mockImplementation(() => ({
        loggedIn: {
            // this is a randomly generated uuid not attached to any users.
            id: "aaa46c03-6d2a-4090-ace5-835808756c86"
        }
    }));
    jest.spyOn(Location, "useLocation").mockImplementation(() => ({
        location: {}
    }));
});

afterAll(() => {
    server.close();
    jest.useRealTimers();
    jest.restoreAllMocks();
});

it("should render properly", async () => {
    const renderPage = render(<AlertPage />);
    const distressBtn = await renderPage.findByText("Distress Signal");
    const recordingLabel = await renderPage.findByText("Tap to Record");
    expect(distressBtn).toBeTruthy();
    expect(recordingLabel).toBeTruthy();

    // expect the basic elements on the alert page to be present - if it is, proceed
    // with snapshot
    const tree = renderPage.toJSON();
    expect(tree).toMatchSnapshot();
    screen.unmount();
});

it("should attempt to send a message using Supabase REST protocol", async () => {
    const renderPage = render(<AlertPage />);
    const statusMsg = await renderPage.findByTestId("status_msg");
    expect(statusMsg.children[0]).toBe("Awaiting input...");

    const distressBtn = await renderPage.findByText("Distress Signal");
    fireEvent.press(distressBtn);

    // we cannot directly use statusMsg here - since the state for loading will
    // force a unload/reload of the component, the object changes.
    const newMsg = await renderPage.findByTestId("status_msg");
    expect(newMsg.children[0]).toBe("Intercepted this message.");
    screen.unmount();
});

// as the Recording object requires permissions, we bypass the need for permissions
// by supplying our own mocks for recording, etc.
it("should call startRecording when there is no recording object", async () => {
    const startMock = jest.fn();
    const stopMock = jest.fn();
    const spy = jest.spyOn(Recording, "useRecorder").mockImplementation(() => ({
        // when there is no recording object, it is falsy.
        recording: false,
        startRecording: startMock,
        stopRecording: stopMock
    }));
    
    const renderPage = render(<AlertPage />);
    const recordBtn = await renderPage.findByTestId("recordBtn");
    fireEvent.press(recordBtn);

    expect(startMock).toBeCalled();
    expect(stopMock).not.toBeCalled();

    spy.mockReset();
    screen.unmount();
});

// as the Recording object requires permissions, we bypass the need for permissions
// by supplying our own mocks for recording, etc.
it("should call stopRecording when there is a recording object", async () => {
    const startMock = jest.fn();
    const stopMock = jest.fn();
    const spy = jest.spyOn(Recording, "useRecorder").mockImplementation(() => ({
        recording: { test: "to make this object truthy" },
        startRecording: startMock,
        stopRecording: stopMock
    }));
    
    const renderPage = render(<AlertPage />);
    const recordBtn = await renderPage.findByTestId("recordBtn");
    fireEvent(recordBtn, "onLongPress");

    expect(startMock).not.toBeCalled();
    expect(stopMock).toBeCalled();

    spy.mockReset();
    screen.unmount();
});