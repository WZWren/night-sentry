import { View, FlatList, Image } from "react-native";
import { Text, Chip, Card, IconButton, ActivityIndicator, TouchableRipple } from "react-native-paper";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";

import { viewStyle } from "../../../ui/style";
import { compareDMSGrid, epochToDate, latlngToDMS } from "../../../lib/utils";
import { supabase } from "../../../lib/supabase";
import { useLocation } from "../../../contexts/location";

/**
 * The forum dashboard page of the app. <br>
 * 
 * Unlike the close contacts page implementation, the dashboard page fetches the
 * array of forum posts exactly once, and assigns listeners to fetch for changes
 * to the feed. <br>
 * 
 * The page currently displays 2 unimplemented features.
 * 
 * TODO: The first one is the verification count, which is a user aggregation count
 * to sort posts by their credibility.
 */
export default function DashboardPage() {
    const router = useRouter();
    const { location } = useLocation();
    const coordinates = latlngToDMS(location.coords);
    const [ active, setActive ] = useState(ListTabs.ALL);
    const [ refresh, setRefresh ] = useState(true);
    const [ data, setData ] = useState([]);

    // fetch the array of forum posts on initialization of the page, and when the page is
    // refreshed.
    useEffect(() => {
        if (refresh) {
            (async () => {
                const { data, error } = await supabase.from("forum")
                    .select().order('id', { ascending: false });
                if (error) {
                    console.log(error.message);
                } else {
                    setData(data);
                }
                setRefresh(false);
            })();
        }
    }, [refresh])

    // subscribe to the changes in the table.
    useEffect(() => {
        supabase.channel("newsfeed").on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'forum',
            filter: 'has_image=eq.false'
        }, (payload) => {
            setData((oldArray) => [payload.new, ...oldArray]);
        }).on('postgres_changes', {
            event: 'UPDATE',
            schema: 'public',
            table: 'forum'
        }, (payload) => {
            setData((oldArray) => [payload.new, ...oldArray]);
        }).subscribe();
    }, [])

    return (
        <View style={viewStyle.colContainerStart}>
            <View style={viewStyle.rowViewCenter}>
                { refresh
                    ? <ActivityIndicator style={{flex: 1}}/>
                    : <IconButton
                        onPress={() => setRefresh(true)}
                        icon="reload"
                        style={{flex: 1}} /> }
                <Chip
                    showSelectedOverlay
                    selected={active == ListTabs.ALL}
                    onPress={() => setActive(ListTabs.ALL)}
                    style={{flex: 4}}>
                    All Feed
                </Chip>
                <Chip
                    showSelectedOverlay
                    selected={active == ListTabs.CLOSE}
                    onPress={() => setActive(ListTabs.CLOSE)}
                    style={{flex: 4}}>
                    Nearby
                </Chip>
                <IconButton
                    onPress={() => router.push("/dashboard/newpost")}
                    icon="newspaper-plus"
                    style={{flex: 1}} />
            </View>
            <FlatList
                data={data}
                renderItem={({item}) => FeedCard(item, router, active, coordinates)}
                style={{ width: "90%" }}/>
        </View>
    );
}

/**
 * The individual card items in the FlatList to render on the Dashboard screen.
 * @param {*} item Prop item for the item to render as a card.
 * @param {*} router The Router associated with the Expo Navigation.
 */
function FeedCard(item, router, active, coordinates) {
    if (active == ListTabs.CLOSE) {
        const targetGrid = item.coord_grid;
        if (!compareDMSGrid(coordinates, targetGrid)) {
            return (<></>);
        }
    }

    // preemptively get the URL of the item to let the FocusedFeed page handle it easier.
    const imageUrl = item.image !== null
        ? supabase.storage.from("forum-image").getPublicUrl(item.image).data.publicUrl
        : "";

    // onPress function for the card.
    const handleReadMore = () => {
        router.push({
            pathname: '/dashboard/focusedfeed',
            params: {
                thread_id: item.id,
                title: item.title,
                desc: item.desc,
                timestamp: item.created_at,
                image: imageUrl,
                coords: JSON.stringify(item.coords)
            }
        })
    };

    // TODO: onPress function for the verification of the post.
    const handleVerify = () => {
        console.log("Verify button pressed for card with text " + item.title);
    }

    return (
        <Card style={{ margin: 4 }}>
            <TouchableRipple borderless onPress={handleReadMore} rippleColor="#9D79A0" style={{ borderTopLeftRadius: 10, borderTopRightRadius: 10 }}>
                <View>
                    <Card.Title title={item.title} subtitle={epochToDate(item.created_at)}/>
                    <Card.Content style={{ flexDirection: "row", gap: 6 }}>
                        { imageUrl && <Image style={{ width: 100, height: 100, flex: 1 }} source={{ uri: imageUrl }} /> }
                        <Text numberOfLines={6} style={{ flex: 2, flexWrap: 'wrap' }}>{item.desc}</Text>
                    </Card.Content>
                </View>
            </TouchableRipple>
            <Card.Actions>
                <Text variant="labelSmall" style={{ flex: 5 }}>Verification Score: {item.verify_count}</Text>
                <IconButton onPress={handleVerify} icon="check-decagram" style={{ flex: 1 }}/>
            </Card.Actions>
        </Card>
    );
}

// enum for pages
const ListTabs = Object.freeze({
    TOP: 1, // we aren't using TOP right now.
    CLOSE: 2,
    ALL: 3,
});