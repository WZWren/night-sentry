/**
 * alert.js manages all the PubSub stuff for alerts and services.
 * Functions in this js file will be called back in auth during the login step.
 */

import { supabase } from "../lib/supabase";

export async function fetchPublishers(user, setDistress) {
    const { data, error } = await supabase.from("close_contacts")
        .select("publisher, name:publisher(first_name, last_name)")
        .eq("subscriber", user.id)
        .is("confirmed", true);

    if (error) {
        console.log(error.message);
        return;
    }

    // linear runtime is OK for this, as a user's close contacts should
    // on average be within the 10s range.
    for (let i = 0; i < data.length; i++) {
        // subscribe the app client to the channel.
        supabase.channel(data[i].publisher)
            .on('postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'alerts', filter: `user_id=eq.${data[i].publisher}` },
                (payload) => {
                    setDistress(`Distress signal received from ${data[i].name.first_name} ${data[i].name.last_name}`);
                    console.log(payload);
                }
            ).subscribe();
        console.log("Subscribed to " + data[i].publisher)
    }
}

export async function unsubClient() {
    const { error } = await supabase.removeAllChannels();

    if (error) {
        console.log(error.message);
        return;
    }
    console.log("unsubscribed to all");
}