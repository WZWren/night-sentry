**NIGHTSENTRY || Final Level of Achievement: GEMINI**

**Important Notice**

As the project has been concluded, this is unlikely to get further updates/maintenance. The release build may not work, as it is possible the Supabase instance involved with this is disabled due to being on the free plan.

If you wish to run the app, you would need to create a Google Cloud Project and Supabase Instance, and add the respective files/API keys to a local .env file.

**Motivation**

One of the collaborators of this project has a cousin living overseas, who expressed their concern over safety on the streets in Europe, especially when walking home at night. Inspired by this, as well as the recent rise in emphasis on personal security worldwide, we felt that we wanted to make an app that could allow its users to ask for help and check on dangers in their area.

The app, while built and tested in the Singapore setting, is aimed to be usable in other parts of the world as well. The average user would be able to use the app to report and read up on a crowdsourced feed, and if in a threatening situation, send an alert to their selected close contacts and record audio of their surrounding area, if need be.

**Aim**

An app that can help the user identify what they should be looking out for in an area, and leave a paper trail in case something might happen to them.

**User Stories**

1. As a user who has plans to travel at night, I want to be alerted about potential crime hotspots throughout my route, and know if someone is able to assist me when I need help.
1. As a family living in a neighbourhood, I want to know what dangers there might be around me and how it might change.
1. As a person of authority with this app, I want to be notified of nearby alerts going on and be prepared to help those facing danger.
1. As a parent, I want to know that my children are safe at any point of their journey.

**Overview of Core Features**

Alert System [Implemented]

\+ Allow users to specify close contacts on the Dashboard page via email address. Users will have to accept or reject the requests accordingly before they can receive alerts.

\+ Through the alerts page, users can send distress signals to their close contacts. If they are active in the app, they will receive an alert on their phone.

\+ If the user is a close contact, they will receive a push notification for the distresee who sent an alert. Navigating to the close contacts screen allows you to see the alert, location and where it was sent from, as well as the audio file associated with the distresee.

Widget [Implemented]

\+ Using the react-native-android-libraries, we have implemented widgets to allow users to push alerts without having to open the app as long as they have an active login to the app.

\+ As the app login is persisted, this should allow users to quickly send an alert to their close contacts with an attached last known location.

\+ While the widget is fully implemented in the library, due to the library being relatively new, it is subject to bugs. As an extension, we hope to port the widget to a native code implementation on Kotlin.

Camera Function [Reworked into Recorder Function]

~~- When the app was activated, the phone camera would have been turned on and would record your surroundings, like a car camera recorder. These clips would be stored in a database and would come in use should a malicious case occur. Users can choose to delete the clips when they reach their destination safely.~~

\+ Due to concerns with size constraints and usability of the function, this function has been reworked to only use the microphone instead. Functionally, this would still be turned on and record your surroundings while you move.

\+ Playback can be performed from close contacts in the details screen.

Crowdsourced Feed [Implemented]

\+ Through a user-maintained database, we hope to be able to inform users of active crime alerts in the area, to warn users of previous crimes that might have happened in the area.

\+ A live map linked to the Google Maps API will show where the active crime alerts are, and would also show where close contacts are sending their distress signals from.

\+ Through this, we hope that people who peruse the posts by other users can note down locations to avoid while on route to an unfamiliar area.

\+ As an extension, we will implement a nearby location feature to the crowdsourced feed to let users be able to filter for context-relevant information.

**Program Flowchart**

![](README/media/001.png)

**Features**

**Authenticated Login**

As the alerts feature requires close contact relationships with other users of the app, it was clear that we needed to provide an identity to each of our users in the database. To that end, we used Supabase’s Authentication System.

At signup, the user will input their email and name info, which would be used for identification later on. Each email can only be assigned to one account. Regardless of sign-up or log-in, on a successful signup, the screen will bring you to the permissions page if no permissions have been granted yet, or the alerts page if all permissions have been granted.

*Implementation Details*

For most of the authentication process, its implementation is black-boxed by Supabase. However, as the auth.user table of Supabase is not accessible, and should not be accessible, by non-admin users, we need to expose certain elements of the users table. To do this, we implement a PLPGSQL trigger function for insertion events into the auth.user table. This trigger will insert a new row into an exposed public.user\_info table.

![](README/media/002.png)

**Close Contacts Page**

To allow the alerts feature to function, the close contacts page is necessary to create a relationship between 2 users. This page will directly show you who you are connected to, which people are asking to be your close contacts and the ability to create new close contacts. Functionally, this is a friends list from a conventional messaging/networking app.

To this end, a dialog popup is used to send the request to the other users, and FlatLists are used to render your incoming requests and existing connections. This page will also link you to a page that renders out the details of the close contacts, if they have an alert.

*Implementation Details*

In order to add a close contact, the user must open a dialog popup, where they input the email address of the user they want to connect to. This works better than using something like a name, as an email address is a guaranteed unique identifier of the user in the system that is hard to mistype and hit another user.

![](README/media/003.png)

From the table above, we see that the publisher and subscriber keys are not unique by themselves, but the combination of the keys are unique. Design-wise, we want the request to function like a handshake. The initial request comes from the subscriber and goes to the publisher, but is flagged as unconfirmed. This keeps the subscriber from getting alerts immediately without the publisher first accepting the request.

For Milestone 2, on acceptance, the acceptee would update the original request to have the confirmed status to send a ‘handshake’ insertion into the table with the publishers and subscribers reversed. However, while this implementation works, an edge-case of having each user send a request to another without accepting the other’s request breaks an invariant - if the publisher and subscriber have a symmetric relation, the confirmed status should be true on both requests.

There is also a flaw in the program flow, where a theoretical failure in update request to the handshake after a successful insertion request would result in one side of the handshake having a confirmed status of true while the other having a confirmed status of false. Therefore, for Milestone 3, we opt to implement a trigger in Supabase.

```
Trigger Function Implementation:
-- This function triggers before insertion.
CREATE OR REPLACE FUNCTION handle_close_contact() RETURNS trigger AS $$
BEGIN
-- Case 1: It is not a fresh insertion.
-- The request has either already been accepted, or a request is
-- currently ongoing.
  IF EXISTS (
    SELECT 1 FROM public.close_contact WHERE (
      publisher=new.publisher AND subscriber=new.subscriber
    )
  ) THEN RAISE EXCEPTION 'Close contact request already exists!';
  END IF;
  -- Case 2: This is a fresh insertion. There is a handshake
  -- already in the DB. This can trigger from updating, or a fresh
  -- insert.
  IF EXISTS (
    SELECT 1 FROM public.close_contacts WHERE (
      publisher=new.subscriber AND subscriber=new.publisher
    )
  ) THEN
    UPDATE public.close_contacts
    SET confirmed=true
    WHERE (publisher=new.subscriber AND subscriber=new.publisher);
    new.confirmed:=true;
    RETURN new;
  END IF;
  -- Case 3: This is a true fresh insertion. Just return the new
  -- insertion value directly.
  RETURN new;
END;
$$ LANGUAGE plpgsql;
```

By converting the 2-step update-insert protocol to a 1-step insert protocol on the front end, we reduce the likelihood of failure due to a frontend error, and enable us to handle the edge case of having a symmetric but unconfirmed close contact relationship.

**Alerts**

The alerts functionality is a key aspect of the app, as other users need to be able to receive this notification in a timely manner, and multiple users may be required to receive it at once. While it is true that one can pull up their messenger to send a distress call/message, this method is often limited by the number of people they can reach at once and the possible ambiguity of the message. We hope that with a unified button that is specifically set up in case of emergency, we can have users clearly send out emergency signals to get help.

*Implementation Details*

The app receives alerts in 2 ways - it can receive a push notification from the server when a new alert is created, and it can receive a SnackBar alert at the bottom of the screen when an alert is sent.

For the push notification, the expo-notification library is used. This contacts the Expo Notification API service to fetch a device-app specific Expo token, and then updates the user-info table with the token for the backend to facilitate the posting process. The Supabase backend has a trigger that pushes the Expo notification to all the close contacts of the alert creator after the alerts table has a new row inserted into it.

```
Trigger Function Implementation:
CREATE OR REPLACE FUNCTION update_last_alert() RETURNS trigger AS $$
DECLARE
  _id_array uuid[];
  _id uuid;
  _token text;
  _firstname text;
  _lastname text;
BEGIN
  -- this creates a quick link to the user
  UPDATE public.user_info
  SET last_alert = new.id
  WHERE id = new.user_id;
  -- this fetches the name of the user
  SELECT first_name, last_name
  FROM public.user_info
  WHERE (id = new.user_id)
  INTO _firstname, _lastname;
  SELECT ARRAY(
    SELECT subscriber
    FROM public.close_contacts
    WHERE (publisher = new.user_id AND confirmed = true)
  ) INTO _id_array;
  FOREACH _id IN ARRAY _id_array LOOP
    SELECT expo_token
    FROM public.user_info
    WHERE id = _id
    INTO _token;
    IF _token IS NOT NULL THEN
      PERFORM FROM http_post(
        'expo link here',
        jsonb_build_object(...)
      );
    END IF;
  END LOOP;
  RETURN new;
END;
$$ LANGUAGE plpgsql;
```

We use a simple loop to handle this posting logic - while it may be costly to perform this synchronous http operation when the number of close contacts balloons up, this should be fine, as design-wise the number of close contacts an average person would have would not exceed the single digits threshold.

For the SnackBar alert, the app first fetches the list of close contacts from the supabase server on login. Then, it subscribes to the publisher’s channel on the PubSub stream, listening for changes to the alerts table. This allows any number of subscriber apps to handle the alert on their end directly, splitting the workload of deploying the distress signal.

In both implementation cases, the publisher sends the alert by directly inserting into the alerts table a new row, which has the following implementation.

![](README/media/004.png)

The alert also contains location data that is derived directly from the phone’s GPS sensors.

**Recording Function**

This is a replacement function for the intended Camera ‘dashcam’ function. On further consideration, the original use of video is deemed unfeasible - for one, the directionality of a video recording would require the user to significantly alter the way they use their phones. Even if they do account for this issue, we foresee that a ‘dashcam’ function like this would be most useful at night, where light levels are low and lower resolution footage is rendered unusable. Changes in resolution dramatically inflates the size of a video file. As a comparison, audio is omnidirectional, and has the advantage of being significantly lighter on storage.

*Implementation Details*

On the alerts page, we create a Recorder instance using the expo-av library, that we keep in a context that can be retrieved from outside the alerts page. This allows us to continue recording audio on separate pages without losing state information on the alerts page. After the recording ends, it is inserted into the storage bucket inside Supabase, on its Supabase Storage API.

The lack of playback for your audio recording is intentional. While it may seem weird to be unable to access your own recordings, the recordings functionally do not serve a purpose to the user who creates them, and it is unlikely for the user to be able to play it back during an emergency. Therefore, no recording playback is retained by the user.

**Details Page**

After settling the receiving of alerts, we needed a way for users to see the specifics of the alerts coming their way. For this, we create a details page, a dynamic page that we can use to display the alerts coming from the user.

*Implementation Details*

The only way you can access this page is from the close contacts page, where each card displaying a close contact also stores the user’s ID and name information. On press, we handle this name to dynamically change the title of the page using the expo-router library, and send an API call to Supabase to fetch alert details for the user. Location data is important to display graphically, as LatLong coordinates are not usually a human-readable format. Therefore, we make use of the Google Maps API, using the react-native-maps library as an intermediary to create the map layout.

On this page, users can also perform audio playback of the recordings that the close contacts upload onto the Supabase servers. Using the expo-av library allows us to perform playback on audio files from a url. By making an API call to the Supabase server, we can obtain a list of the last 3 audio files uploaded by the close contact, which we can reference later to make a second API call to fetch a signed URL link to the audio file.

As the storage buckets in Supabase have RLS enabled, and the default behaviour does not account for another user to access their storage folder, we implement the following policy to the storage bucket.


```
CREATE POLICY "..." ON storage.objects AS PERMISSIVE FOR SELECT
  //this means that the requester must be logged in
  TO authenticated USING ((
    EXISTS (
      SELECT 1 FROM close_contacts
      WHERE (
        (close_contacts.subscriber = auth.uid())
        AND (close_contacts.publisher = objects.owner)
        AND (close_contacts.confirmed = true)
      )
    )
  ))
```

**Widgets**

One of the user feedbacks in Milestone 2 that stood out to us was that the alternative to the app, which was to open a messaging app and send a message to a family group, had a similar time to access compared to using NIGHTSENTRY. While our app had its advantages of sending an unambiguous message to the registered close contacts without spending too much time crafting the message, it was true that opening the app could be rather cumbersome in an emergency.

Therefore, we implement a widget to allow users to directly send an alert from the homescreen, bypassing the issue.

*Implementation Details*

Due to the use of EAS-Expo Workflow, most conventional methods of creating a widget are not easily accessible to us. As a result, we instead opt to use the relatively new react-native-android-widget library, as it can be integrated into the EAS workflow easily. The library creates the widget by rendering a React Native element in the background, generating an image snapshot of this element and displaying it within the bounding box of the widget space provided by the android launcher. The widget handlers then align the interaction zones on the widget according to the coordinate values provided by the launcher.

The original plan for the widget to also feature a lockscreen. Due to how widgets are functionally always on, the time to unlock a widget will always be faster than the time to open an app, assuming that they are in the same location on the launcher screen, and the advantage of this lockscreen is that users would minimise the chance of accidentally pressing the widget.


|Concept Sketchup![](README/media/005.png)|
| :- |

However, when using the library, we encountered several problems. User testing reveals that the widget acts inconsistently on different phones/launchers, causing cropping of the generated image snapshot in the bounding box, misalignment of interaction zones and in the worst case completely replacing certain interaction zones with opening the app instead. On investigation, we discover that it is a known issue with the library we had used - as the library depends on the bounding box given by the android launcher, it only properly renders if the bounding box given to the library is truthful. However, several launcher apps for different phones will give inconsistent coordinate values which misaligns and improperly scales the widget.

This had been a massive setback to us - in the process of using a simpler-to-integrate library, we had inadvertently caused more problems. To properly fix this issue, we would have to move the widget side of the codebase to Kotlin and work in the native environment. However, this solution was not feasible in the short amount of time we had left. Therefore, we instead opt to work around the flaws of the library.

During the user testing, we had observed that the top left corner of the widget will always align properly with the app. Additionally, we have also found that the interaction zones will properly align with the UI elements, even if they are cropped. Therefore, we instead intend for the widget to be a full-body button with updating text elements. To let us hide the cropping issue, we also opted for sharp corners instead of the recommended rounded corner design from the Material UX paradigm.


|Concept Sketchup + Comparison with previous widget![](README/media/006.png)|
| :- |

While some phones will still cut off the widget text/UI for the alternative widget, the new design is a marked improvement over the previous one. A caveat of the design is that we do not get the lock screen anymore, but considering that the previous widget had cases where the lock screen could be accidentally disabled from the interaction zones breaking, it is a fair trade-off for a working widget.

We had also run into the issue with location data. Every alert must be sent with a compulsory JSON element containing location data. However, as the widget must always be able to send location data, it needs to be able to access background location permissions. Starting from Android 10+, background location permissions need explicit approval from Google by submitting a form through official channels and waiting on their approval message. As a result, we were limited to using the getLastKnownLocation method provided by the Expo library. This can cause the occasional bug where an alert fails to send due to a null value in the location column of the alert due to the Expo library not possessing a last known location yet. Usually, it can be solved by sending an Alert through the main app.

*Known Issues*

- The Widget may be cropped or improperly rendered. A workaround version of the widget is implemented called the Simplified Widget.
- When a Widget is first added, it may become transparent and unusable, even though that screen slot is still filled by the Widget. This is a direct result of the library’s Widget Task Handler needing to wind up on first install. To solve this, the invisible widget needs to be removed and readded again.

**Crowdsourced Feed**

While the app as it stands serves its purpose as a reactive response, we want the app to serve a bigger purpose outside of its niche use. The hope is to use a forum type system to display a user-generated feed and keep both locals and visitors updated of events happening around the neighbourhood, such as active crime alert boards, a witnessed robbery, harassment cases, active fires, etc.

While the ideal implementation also adds a nearby feed function using the grid system previously mentioned in Milestone 2, our widget and Jest testing has taken more time to implement than expected, and we were unable to implement this in time. We aim to have this feature up and working after Milestone 3.

*Implementation Details*

The Crowdsourced Feed comes down to 3 main components - the main forum board page, the page to read more about a post, and the page to add a new post. On the forum board, the UI navigation elements, such as the page tabs, refresh button and new post button, are located on at the top of the screen, above the FlatList forum section - this is where the user tends to look at when they first open a new page, so having these elements here helps the user locate the navigation buttons.

The feed itself will first fetch the array of feed items, ordered descendingly by ID, which is generated incrementally in chronological order. This allows the FlatList element on the feed to render the array out, placing the latest feed items at the top of the list. An additional PubSub channel listening to changes in the forum table will add the new element to the array via the setter hook: **setData((oldArray) => [payload, …oldArray])**.

Each feed item is generated based on the forum table implementation below as of MS3.

![](README/media/007.png)

When creating a new post, the image cannot and should not be encoded directly into the row. Therefore, we instead have 2 cases for our insertion request.

1. The post we create does not have an image - the insertion request is done with the has\_image flag set to false. The PubSub listener listens to INSERT operations on the table with the constraint has\_image=false.
1. The post we create has an image - the insertion request is done with the has\_image flag set to true, and a secondary insertion request starts on the forum-images bucket, named directly after the ID of the forum row. After the insertion request finishes on the bucket, a trigger function updates the row of the post using this ID with the path to the image - this is an inbuilt redundancy for if the image fails to upload, which prevents the app from crashing due to a Null Pointer. The PubSub listener then listens to UPDATE operations in the table.

The trigger function simply updates the row as such:

|CREATE OR REPLACE FUNCTION handle\_forum\_post() RETURNS trigger AS $$BEGIN`  `IF new.bucket\_id='forum-image' THEN`	`UPDATE public.forum SET image=new.name WHERE id=(`  	  `SELECT SPLIT\_PART(new.name, '.', 1)::int8`	`);`  `END IF;`  `RETURN new;END;$$LANGUAGE plpgsql;|
| :- |

After MS3, the nearby feed functionality has been added. This adds the additional column **coord\_grid** to the forum table. Before forum post upload, a trigger function runs to classify the forum post to a grid, specified in the extensions section below.

```
CREATE OR REPLACE FUNCTION handle_forum_classification() RETURNS trigger AS $$
DECLARE
  _lat_degree numeric;
  _lat_minute numeric;
  _long_degree numeric;
  _long_minute numeric;
BEGIN
  -- trunc(decimal latlng\*60/5)\*5 is equivalent to converting to
  -- DCM and getting the floor of the multiple of 5
  -- adjusted to floor to account for -ve values
  SELECT FLOOR(
    (new.coords->>'latitude')::numeric
  ) INTO _lat_degree;
  SELECT (FLOOR(
    ((new.coords->>'latitude')::numeric - _lat_degree)*12)*5
  ) INTO _lat_minute;
  
  -- ... repeat this for long_degree and minute ...
  
  new.coord_grid := { -- pseudocode for readability
    latitude: { degree: _lat_degree, minute: _lat_minute },
    longitude: { degree: _long_degree, minute: _long_minute }
  };
  return new;
END;
$$ LANGUAGE plpgsql;
```

On the frontend, the coord\_grid is fetched, and if the filter option is active, the card render is skipped if the coord\_grid is not adjacent to the current location.

**Other Design Decisions**

**Use of React Native over Native Languages for Android Development**

We have purposefully made this app in React Native instead of Flutter, Kotlin or Java, even though the app was currently exclusively running on Android. This was an intentional decision, as we wanted to keep the pathway open to easily implement an iOS port in the future. Our original vision was to create an iOS version of the app to keep the alert app as accessible to everyone as possible, but we did not have the ability to test it on iOS. By keeping it on React Native instead of directly coding on the Android Programming Languages, we can make simple adjustments to port the program to iOS in the future when we gain access to test it on the platform.

**Permissions Screen as a stand-in for a Splash Screen**

Due to the nature of the app, permissions for notifications, location and microphone are needed to have the app function properly. While we can simply ask for the required permissions when the app is first started, we have decided to explicitly ask for the permission from the user after the user logs in for the first time.

This allows us to justify the reason for why we need to obtain the permissions in the first place, before they receive the prompt to get the permissions - which lowers the chances of the user denying the permissions and having to go to the settings page to enable permissions themselves. The Splash Screen is a perfect page to have the Permissions Screen replaced, since it allows the app to consolidate permissions before the rest of the app loads. No specific React Native/Expo library is installed for this, as the libraries responsible for the use of these permissions carry their own methods to obtain these permissions from the user.

**Upgrade to Expo 49 from Expo 48 for Jest**

The app currently uses Expo Router, which helps wrap the Navigation object for React Native and responds with its own logic. In order to help facilitate testing, we have opted to upgrade to Expo 49, which lets Expo Router upgrade and come with its own testing library for use in Jest. However, this upgrade also breaks Expo Router’s own recommended way for handling session retention, as well as Supabase Client’s Session detection. While the exact reasoning for this is unclear, we managed to workaround this issue by wrapping the initial router.push methods in a setImmediate Promise wrapper. Additionally, we also update our Supabase listener for Auth changes.


```
supabase.auth.onAuthStateChange((event, session) => {
  ...
  if (event === "INITIAL_SESSION") {
    if (session) {
      setLoggedIn(session.user);
      fetchPublishers(session.user, setDistress);
    }
  } else if (event === "SIGNED_IN") {
    ...
  }
  ...
});
...
```

**Database Overall Design**

![](README/media/008.png)

**Testing**

**User Testing**

In Milestone 2, we distributed an internal build to 7 people not involved in the app’s development to get an outside perspective on the app.


|User Test|Result|Remarks|
| :- | :- | :- |
|How many users can successfully log into the system?|7/7 passed the test.|NIL|
|Can the users successfully add a close contact without prompting?|3/7 passed the test.|Most have cited a lack of clarity in the use of the app.|
|After adding a close contact, did users manage to send a distress signal to the target user?|6/7 passed the test.|The single user who failed cited that they did not realise that the distress button was a button.|
|After a day has passed, an alert was sent from the test account to the user. Do the users successfully receive the alert?|7/7 received the notification.|All the users had managed to receive an additional notification after a week, even if they did not log in.|

Owing to time constraints, we were unfortunately unable to address some of the issues.

In Milestone 3, we distributed an internal build to 7 people to get a perspective on the Widget and Crowdsourced Feed functions.


|User Test|Result|Remarks|
| :- | :- | :- |
|Does the listeners on the close contacts screen properly refresh the list and update accordingly?|3/3 passed the test.|Not all the users were able to do this test, as some of these were done remotely without a second phone.|
|Were users able to access the crowdsourced feed?|7/7 passed the test.|-|
|Were users able to create a new post?|7/7 passed the test.|One user remarked that they managed to create a double post because they had thought the app did not detect the press.Feedback was given to let users mark their current position with a shortcut.|
|Were users able to open the individual forum posts?|7/7 passed the test.|All elements of the posts were rendered properly too.A majority of user feedback pointed out that the 3 dots felt more like a settings slot rather than to open the post, and opening the post should be handled by pressing the card itself.|
|Were users able to see the feed update with their new post without needing to refresh the list?|7/7 passed the test.|-|
|Were users able to add the widget to the homescreen?|5/7 passed the test.|1 user tried to add the widget to the home screen and encountered the invisible widget bug without realising.The other user did not know how to add widgets to the homescreen, and could not add it without prompting.|
|Did the alert widget render properly?|2/7 passed the test.|The library for the widget crops the UI of the widget.|
|Do all the buttons on the alert widget work properly?|1/3 passed the test.|The distress and unlock buttons work as intended.The cancel button breaks in different ways for different devices, ranging from opening the app instead to simply not doing anything on press.|

Additionally, it was noticed during user testing that the app’s session retention feature for Supabase was not working for the main app, even though the user could send an alert through the widget. On investigation, this was due to the upgrade to Expo 49, and has since been fixed. To fix the widget issues, we implemented a workaround widget and performed a second user test on a group of 5 people.


|Does the workaround widget render properly?|4/5 passed the test.|The user that it failed to render properly on had a custom font size enabled on their phone, which rendered the status text in a way that was cut off but readable.|
| :- | :- | :- |
|Does the workaround widget button send an alert on press?|4/5 passed the test.|The user that it failed on had an issue with the last known location - it worked immediately after an alert was sent on the main app.|

**Unit Testing**

For our unit test, we make use of Jest to automate our testing for the Authentication, parts of the Alert system, adding of our close contacts and some utility functions. As the Notification services are hard to test in a Jest environment, we skip the testing on the Notification component on the Alerts function.

During the Jest testing, we encountered issues with mocking Supabase calls. Conventionally, database calls can be mocked using an interception library like Nock or MSW. However, the Supabase client does not interface with the traditional mocking libraries. This is possibly due to the introduction of a native fetch method in Node 18+, which the Jest environment runs on. This fetch method is implemented in Undici instead of the more traditional http protocols that Nock and MSW interface on. While MSW has a compatible version with the native fetch method, it is on the @next branch of the release, which is experimental and not on the official release.

To overcome this issue, we looked through the open-source implementation of the Supabase client. From this we found that the react native library cross-fetch is used as a polyfill for fetch methods, meaning that cross-fetch’s handling of the data aligns with how supabase would handle it normally. Additionally, the Supabase client can take in a custom implementation of fetch if you pass it in as a property. Since cross-fetch can interact properly with MSW, for the tests, we create a new Supabase client to replace the supabase object imported by our components.


```
Implementation:
// at imports section:
import * as DB from ‘.../lib/supabase’
...
// this mirrors the internal implementation of resolveFetch for Supabase.
var _fetch = async (...args) => 
  await(
    await import('cross-fetch')
  ).fetch(...args);
const fetcher = (...args) => _fetch(...args);

const replacement = createClient(URL, KEY, {
  auth: {
    persistSession: false,
  }, global: {
    fetch: fetcher,
  }
});

// in the tests
// jest.replaceProperty(DB, "supabase", replacement);|
```

By doing so, we can properly mock the database response using the MSW service client. Below this lists the implemented unit tests for the app.



<table><tr><th colspan="1" valign="top">Test</th><th colspan="1" valign="top">Methodology</th><th colspan="1" valign="top">Justification</th></tr>
<tr><td colspan="1" valign="top">Login Page:</td><td colspan="1" valign="top">—</td><td colspan="1" valign="top">—</td></tr>
<tr><td colspan="1" valign="top">— should render</td><td colspan="1" valign="top">> Directly Rendered Login Page.> Checked if the evergreen components of Login and Text Prompt Components were present.> After checking, create a Snapshot.</td><td colspan="1" valign="top">- for comparison with future builds in case of changes to other components that trickle down to this page.</td></tr>
<tr><td colspan="1" valign="top">— should not make a call to the server if fields are empty</td><td colspan="1" valign="top">> Directly Rendered Login Page and spied on Supabase’s signInWithPassword method.> Searched for Sign-in Button Component.> Fired Event for pressing Button.> Expect sign-in to not be called</td><td colspan="1" rowspan="2" valign="top">- this checks if the field verification system is successfully blocking calls to the API.- this also checks if our field verification is not too sensitive in blocking calls to the API.- as we depend on the API to do most of the heavy lifting, we use placeholder text for this.</td></tr>
<tr><td colspan="1" valign="top">— should make a call to the server otherwise</td><td colspan="1" valign="top">> Directly Rendered Login Page and spied on Supabase’s signInWithPassword method.> Searched for Sign-in Button, Text Field Components.> Filled in Text Fields with Placeholder Text, and Fired Event for pressing Button.> Expect sign-in to be called</td></tr>
<tr><td colspan="1" valign="top">— should go to sign in page when link is pressed</td><td colspan="1" valign="top">> Rendered the full Expo Router setup, which should load into the Login Page.> Find the matching sign-up text component and press it.> Check if the segment in the Router matches “register”.</td><td colspan="1" valign="top">- this will help check if the Expo Router loads the Login Page properly as the entry point.- this also checks if the Expo Router is hooked properly to the Register page.</td></tr>
<tr><td colspan="1" valign="top">Signup Page:</td><td colspan="1" valign="top">—</td><td colspan="1" valign="top">—</td></tr>
<tr><td colspan="1" valign="top">— should not call the server if fields are empty</td><td colspan="1" valign="top">> Directly Rendered Signup Page and spied on Supabase’s signup method.> Searched for Sign-up Button Component.> Fired Event for pressing Button.> Expect sign-up to not be called</td><td colspan="1" rowspan="3" valign="top">- this helps check if the field verification systems and password matching systems are working as intended, and is not over-aggressively deny calls to the API.</td></tr>
<tr><td colspan="1" valign="top">— should not call the server if passwords do not match</td><td colspan="1" valign="top">> Directly Rendered Signup Page and spied on Supabase’s signup method.> Searched for Sign-up Button, and all Text Field Components.> Fill non-password fields with Placeholder text.> Fill password fields with 2 distinct placeholder text.> Fired Event for pressing Button.> Expect sign-up to not be called</td></tr>
<tr><td colspan="1" valign="top">— should call the server otherwise</td><td colspan="1" valign="top">> Directly Rendered Signup Page and spied on Supabase’s signup method.> Searched for Sign-up Button, and all Text Field Components.> Fill non-password fields with the same Placeholder text.> Fired Event for pressing Button.> Expect sign-up to be called</td></tr>
<tr><td colspan="1" valign="top">AuthProvider should provide logged-in data down to its children.</td><td colspan="1" valign="top">> Replace the entire Supabase client property with a custom implementation of Supabase with an exposed fetcher.> Intercept calls to the server by returning a custom created JWT token containing mocked user data.> Create a test component that gets the loggedIn data from the AuthContext.> Render the test component in an AuthProvider and call Supabase’s signInWithPassword method.> Check if log-in is successfully passed down to its children</td><td colspan="1" valign="top">- This tests if the hook logic for Supabase login works successfully.</td></tr>
<tr><td colspan="1" valign="top">Alert Page</td><td colspan="1" valign="top">—</td><td colspan="1" valign="top">—</td></tr>
<tr><td colspan="1" valign="top">— should render properly</td><td colspan="1" valign="top">> Directly Rendered Alert Page.> Checked if the evergreen components of Distress Button and Recording Label Components were present.> After checking, create a Snapshot.</td><td colspan="1" valign="top">- for comparison with future builds in case of changes to other components that trickle down to this page.</td></tr>
<tr><td colspan="1" valign="top">— should send alert after button press</td><td colspan="1" valign="top">> Directly Rendered Alert Page.> Replaced Supabase property with custom implementation with an exposed fetcher.> Set up an interception server in MSW.> Find and press Distress Button component.> Find the status message component.> Expect the status message to be the intercepted message.</td><td colspan="1" valign="top">- checks if the distress button successfully calls the API service on the correct service link.</td></tr>
<tr><td colspan="1" valign="top">— should start and stop recording when appropriate state is pressed</td><td colspan="1" valign="top">> Mocked the state of the Recording object.> Check if the record button successfully calls the appropriate function on press.</td><td colspan="1" valign="top">- we assume that the recording will be saved properly by the Expo AV library.- checks if the logic of the UI element works properly and calls on the correct function</td></tr>
<tr><td colspan="1" valign="top">Close Contacts</td><td colspan="1" valign="top">—</td><td colspan="1" valign="top">—</td></tr>
<tr><td colspan="1" valign="top">— dialog should render properly</td><td colspan="1" valign="top">> Directly render the CCDialog component> Check if evergreen components are present> Save a snapshot after checking.</td><td colspan="1" valign="top">- for comparison with future builds in case of changes to other components that trickle down to this page.</td></tr>
<tr><td colspan="1" valign="top">FOR ALL TESTS IN THIS SECTION,</td><td colspan="1" valign="top">> Replaced the Supabase property with a custom implementation with an exposed fetcher> Started an MSW server instance.> Rendered CCDialog component directly> Searched for Submit button component</td><td colspan="1" valign="top">- see discussion above for details</td></tr>
<tr><td colspan="1" valign="top">— should not call API if field is empty</td><td colspan="1" valign="top">> Spy on Supabase’s REST API function.> Fired event for Submit button press.> Check if REST API method was called.> Check if the component attempts to close the dialog when it should not.</td><td colspan="1" rowspan="4" valign="top">- this checks if the field verification logic is working as intended, and if the error handling of the component is working as intended.</td></tr>
<tr><td colspan="1" valign="top">— should resolve error if non-user email is supplied</td><td colspan="1" valign="top">> Spy on Supabase’s REST API function.> Created an interception case to throw an invalid email error when any request is made.> Fired event for Submit button press with text field filled in with placeholder text.> Check if the component resolves the error in the intended way.> Check if the component attempts to close the dialog when it should not.</td></tr>
<tr><td colspan="1" valign="top">— should resolve error if insertion fails</td><td colspan="1" valign="top">> Spy on Supabase’s REST API function.> Created an interception case to throw a standard insertion error when any request is made.> Fired event for Submit button press with text field filled in with placeholder text.> Check if the component resolves the error.> Check if the component attempts to close the dialog when it should not.</td></tr>
<tr><td colspan="1" valign="top">— should close dialog on success</td><td colspan="1" valign="top">> Spy on Supabase’s REST API function.> Created an interception case to return success when any request is made.> Fired event for Submit button press with text field filled in with placeholder text.> Check if the component resolves the error when it shouldn’t.> Check if the component attempts to close the dialog.</td></tr>
<tr><td colspan="1" valign="top">Utility Function</td><td colspan="1" valign="top">—</td><td colspan="1" valign="top">—</td></tr>
<tr><td colspan="1" valign="top">epochToDate</td><td colspan="1" valign="top">—</td><td colspan="1" valign="top">—</td></tr>
<tr><td colspan="1" valign="top">— returns valid baseline</td><td colspan="1" valign="top">> Pass in Epoch 0 into the test, in Singapore Standard Time environment.> Check if the value is returned as 1/1/1970 0730.</td><td colspan="1" valign="top">- This checks if the epochToDate conversion is sound and uses the Epoch standard.</td></tr>
<tr><td colspan="1" valign="top">— returns properly padded minute value in string.</td><td colspan="1" valign="top">> Pass in Epoch 1672502700000, which translates to 1/1/2023, 5 minutes past midnight in SST.> Check if the value returned properly pads the minute value with a 0 in the tens digit slot.</td><td colspan="1" valign="top">- This checks if epochToDate properly pads out the minute value into a human readable format.</td></tr>
<tr><td colspan="1" valign="top">latlngToDMS</td><td colspan="1" valign="top">—</td><td colspan="1" valign="top">—</td></tr>
<tr><td colspan="1" valign="top">— should return the trivial values in DMS for 0 values of LatLng.</td><td colspan="1" valign="top">> Pass in LatLng 0 into latlngToDMS.> Check if the value returned has the DMS value 0° 0’.</td><td colspan="1" rowspan="3" valign="top">Basic functionality check of latlngToDMS.</td></tr>
<tr><td colspan="1" valign="top">— should properly floor the LatLng value to a multiple of 5</td><td colspan="1" valign="top">> Pass in an array of LatLng objects.> Array includes LatLng 1.5 - exactly 1° 30’, LatLng 1.583, which floors to 1° 30’, and LatLng 1.584, which floors to 1° 35’.</td></tr>
<tr><td colspan="1" valign="top">— operations on LatLng should not have rounding errors</td><td colspan="1" valign="top">> Pass in LatLng of 1.999999…, 1.00…01.> Check if values round to the correct DMS value.</td></tr>
<tr><td colspan="1" valign="top">— should classify the -ve values in an appropriate way.</td><td colspan="1" valign="top">> Pass in an array of LatLng objects using -ve values.> Check if the value returned is correctly converted.</td><td colspan="1" valign="top">NOTE: the original conversion was intended to store the direction vector as a positive/negative value in the degree, but it was found that minute does not change direction in the -ve axis.However, as this value isn’t exposed, this implementation was kept to simplify the implementation of comparison.</td></tr>
<tr><td colspan="2" valign="top">compareDMSGrid</td><td colspan="1" valign="top">—</td></tr>
<tr><td colspan="1" valign="top">— should pass adjacency in the given positive test cases</td><td colspan="1" valign="top">> Engineer a set of test cases where the comparison should succeed, including reflexivity, direct adjacency and diagonal adjacency.> In cases where the test cases are NOT identical, the test should be symmetric.</td><td colspan="1" rowspan="5" valign="top">Basic functionality test for compareDMSGrid.</td></tr>
<tr><td colspan="1" valign="top">— should not be transitive</td><td colspan="1" valign="top">> Pass in 3 test cases, x, y and z.> The squares xy and yz are adjacent such that x and z are not adjacent.> Check if xz are adjacent.</td></tr>
<tr><td colspan="1" valign="top">— should register adjacency at -ve values.</td><td colspan="1" valign="top">> Pass in adjacent SW test cases.> Check if test cases returns truthy values.</td></tr>
<tr><td colspan="1" valign="top">— should register adjacency at the 0 axis border.</td><td colspan="1" valign="top">> Pass in the test case for 0°0’N,0°0’E and 0°5’S,0°5’E.> Check if the test case returns truthy values.</td></tr>
<tr><td colspan="1" valign="top">— should not register adjacency in negative test cases</td><td colspan="1" valign="top">> Engineer a set of test cases that will fail, including for negative values.> Check if the test cases return falsy values.</td></tr>
</table>

**Github Usage**

For version control and development of the app, we made use of Git and Github to keep track of the app’s progress. Early on into the development, Git was used to start multiple branches of development as a base-point - when we wanted to create a new feature, we would create a new branch to code in the feature, before performing a direct merge back into the master branch, resolving any conflicts if they were present. However, we had found that this method of versioning had resulted in ambiguous tracking of features, as later on during development, it was not easy to track down which commit added a certain feature.

Therefore, we moved on to using Pull requests to merge branches. This allows us to provide a summary of the changes we would combine into the branches as an explicit note on Github, which allows us to better track what happens per merge. We also leveraged the Issues tab for Github to track major problems and bugs in the code, allowing us to better communicate problems that need resolving, and keeping a memo on what has and hasn’t been completed yet.

We additionally also place our API keys and other sensitive information into a .env file, which we actively .gitignore. This allows us to keep our sensitive information private without compromising our ability to code and upload onto Github.

Finally, in order to facilitate the use of Expo Go as a fast development tool, we created a separate branch, main-development, to house all the Expo Go compatible modules to test it in the Expo Go environment. The master branch, which is the main branch, would contain code for widgets in it as well, as widgets are not compatible with the Expo Go client. The general workflow for this would be to create a branch out of the main-development branch and code on the new feature on the new branch, before merging into the main-development branch. As the widget components are a distinct part of the app separate from the main codebase, the merge of main-development related branches back into master should have minimal impact on the code. In the cases where we are concerned of potential conflicts between branches though, we would further create a test master branch to first merge main-development into.

This separation of branches is mainly done to facilitate the use of Expo Go. The proposed use of native code for widgets could potentially remove compatibility with this method of version control, however, and we would need to adjust it accordingly.

**Extensions**

![](README/media/009.png)

**Context-Sensitive Feed via Location**

As mentioned above, we did not have the time to implement context-sensitivity to the user feed. However, we still wish to implement location-sensitive feeds as an extension. This can be achieved by converting part of the existing PubSub framework onto a location map as mentioned before in Milestone 2. If the LatLong is converted into a grid, we can map nearby users as those who are in and adjacent to the grid tile that our target is currently on.

**This has been implemented after MS3.**

**Widgets**

When we opted to use the react-native-android-widget library, we did not expect to encounter so many issues with the library. While the widget will work in its current state, it is not feasible to use in the long run due to the inaccessibility of several UI sections depending on their phones. As an extension, we propose that we port the widget functions to Kotlin. The process to implement a widget on Kotlin using the EAS workflow is poorly documented - however, it does exist, gaishimo’s eas-widget-example repository being the single significant piece of documentation. Investigation on the specifics of this implementation will be done after Milestone 3, to extend upon the app.

**Tech Stack Used**

React Native

Supabase

Google Cloud for Google Maps API and Firebase Cloud Messaging
