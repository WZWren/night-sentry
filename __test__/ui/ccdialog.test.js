import { screen, render, fireEvent, act } from "@testing-library/react-native";
import { rest } from "msw";
import { setupServer } from "msw/node";

import 'react-native-url-polyfill/auto';
import { createClient } from "@supabase/supabase-js";

import { CCDialog } from "../../ui/ccdialog";
import * as Auth from "../../contexts/auth";
import * as DB from "../../lib/supabase";
import { PaperProvider } from "react-native-paper";

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
    rest.post(`${URL}/rest/v1/close_contacts`, async (req, res, ctx) => {
        const reqJson = await req.json();
        if (reqJson.publisher == reqJson.subscriber) {
            // if the publisher = subscriber, the backend will respond with an error code.
            return res(
                ctx.status(400),
                ctx.json({
                    "code": "23514",
                    "details": "Failing row contains -snip-.",
                    "hint": null,
                    "message": "new row for relation \"close_contacts\" violates check constraint \"close_contacts_check\""
                })
            );
        } else {
            // otherwise it will successfully insert.
            return res(
                ctx.status(201)
            );
        }
    })
);

// NOTE: As the only test that should calls setVisible is the one at the back, we make no reset
// attempt on this mock. Should more tests be necessary, a afterEach handler to reset the mock
// as cleanup should be created.
const setVisible = jest.fn();

beforeAll(() => {
    jest.useFakeTimers();
    server.listen();
    jest.replaceProperty(DB, "supabase", replacement);
    jest.spyOn(Auth, "useAuth").mockImplementation(() => ({
        loggedIn: {
            // this is a randomly generated uuid not attached to any users.
            id: "aaa46c03-6d2a-4090-ace5-835808756c86"
        }
    }));
});

afterAll(() => {
    server.close();
    jest.useRealTimers();
    jest.restoreAllMocks();
});

it("should render properly", async () => {
    const renderPage = render(
        <PaperProvider>
            <CCDialog visible={true} setVisible={setVisible}/>
        </PaperProvider>
    );
    const submitBtn = await renderPage.findByText("Submit");
    const errMsg = await renderPage.findByTestId("error_msg");
    expect(submitBtn).toBeTruthy();
    expect(errMsg.children[0]).toBeFalsy();

    const tree = renderPage.toJSON();
    expect(tree).toMatchSnapshot();
    renderPage.unmount();
});

it("should not call Supabase API if field is empty", async () => {
    const spy = jest.spyOn(DB.supabase, "from");
    const renderPage = render(
        <PaperProvider>
            <CCDialog visible={true} setVisible={setVisible}/>
        </PaperProvider>
    );
    const submitBtn = await renderPage.findByText("Submit");
    await act(() => {
        fireEvent.press(submitBtn);
    });

    const errMsg = await renderPage.findByTestId("error_msg");
    expect(spy).not.toBeCalled();
    expect(errMsg.children[0]).toBe("Fields should not be empty.");
    renderPage.unmount();
    spy.mockReset();
});

it("should resolve an error if a non-user email is supplied", async () => {
    server.use(
        rest.get(`${URL}/rest/v1/user_info`, (req, res, ctx) => {
            // on the backend, the get request returns nothing if email is not in DB.
            return res.once(
                ctx.status(200),
                ctx.json([])
            );
        })
    );

    const renderPage = render(
        <PaperProvider>
            <CCDialog visible={true} setVisible={setVisible}/>
        </PaperProvider>
    );

    const inputField = await renderPage.findByPlaceholderText("Enter Close Contact Email");
    const submitBtn = await renderPage.findByText("Submit");
    fireEvent.changeText(inputField, "placeholder");
    fireEvent.press(submitBtn);

    const errMsg = await renderPage.findByTestId("error_msg");
    expect(errMsg.children[0]).toBe("No such user found!");
    renderPage.unmount();
});

it("should resolve an error on insertion attempt failure", async () => {
    // we use the non-reflexivity relation of close-contact for this, as it is the easiest to
    // spoof.
    server.use(
        rest.get(`${URL}/rest/v1/user_info`, (req, res, ctx) => {
            // on the backend, the get request returns nothing if email is not in DB.
            return res.once(
                ctx.status(200),
                ctx.json([{
                    "id": "aaa46c03-6d2a-4090-ace5-835808756c86"
                }])
            );
        })
    );

    const renderPage = render(
        <PaperProvider>
            <CCDialog visible={true} setVisible={setVisible}/>
        </PaperProvider>
    );

    const inputField = await renderPage.findByPlaceholderText("Enter Close Contact Email");
    const submitBtn = await renderPage.findByText("Submit");
    fireEvent.changeText(inputField, "placeholder");
    fireEvent.press(submitBtn);

    const errMsg = await renderPage.findByTestId("error_msg");
    // we just need some error message to be made, since ccdialog handles the error with a
    // default error message if it is uncaught.
    expect(errMsg.children[0]).toBeTruthy();
    // we also expect that the dialog should not attempt to close on failure.
    expect(setVisible).not.toBeCalled();
    renderPage.unmount();
});

it("should attempt to close the dialog on success", async () => {
    server.use(
        rest.get(`${URL}/rest/v1/user_info`, (req, res, ctx) => {
            // on the backend, the get request returns nothing if email is not in DB.
            return res.once(
                ctx.status(200),
                ctx.json([{
                    "id": "cc17eedf-4060-415e-b2a9-4366626f2349"
                }])
            );
        })
    );

    const renderPage = render(
        <PaperProvider>
            <CCDialog visible={true} setVisible={setVisible}/>
        </PaperProvider>
    );

    const inputField = await renderPage.findByPlaceholderText("Enter Close Contact Email");
    const submitBtn = await renderPage.findByText("Submit");
    fireEvent.changeText(inputField, "placeholder");
    fireEvent.press(submitBtn);

    const errMsg = await renderPage.findByTestId("error_msg");
    // we expect the errMsg to be blank.
    expect(errMsg.children[0]).toBeFalsy();
    // we also expect that the dialog to close.
    expect(setVisible).toBeCalled();
    renderPage.unmount();
});

// handler for get requests - supabase seems to encrypt its search params, so we define the interceptor as runtime
// this is the backup code for making sense of the logic.
/*
rest.get(`${URL}/rest/v1/user_info`, (req, res, ctx) => {
    console.log("intercepted!");
    console.log(req);
    if (req.params.email === "nonsense") {
        // on the backend, the get request returns nothing if email is not in DB.
        return res(
            ctx.status(200),
            ctx.json([])
        );
    } else if (req.params.email === "self") {
        return res(
            ctx.status(200),
            ctx.json([{
                "id": "aaa46c03-6d2a-4090-ace5-835808756c86"
            }])
        );
    } else { // this is other email that is not self that is valid.
        return res(
            ctx.status(200),
            ctx.json([{
                "id": "cc17eedf-4060-415e-b2a9-4366626f2349"
            }])
        );
    }
}),
*/