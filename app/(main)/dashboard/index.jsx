import { View, FlatList, Image } from "react-native";
import { Text, Chip, Card, IconButton } from "react-native-paper";
import { viewStyle } from "../../../ui/style";
import { useState } from "react";
import { useRouter } from "expo-router";
import { epochToDate } from "../../../lib/utils";

export default function DashboardPage() {
    const router = useRouter();
    const [ active, setActive ] = useState(ListTabs.ALL);

    return (
        <View style={viewStyle.colContainerStart}>
            <View style={viewStyle.rowViewCenter}>
                <IconButton
                    onPress={() => {}}
                    icon="reload"
                    style={{flex: 1}} />
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
                data={mockedData}
                renderItem={({item}) => FeedCard(item, router)}
                style={{ width: "90%" }}/>
        </View>
    );
}

function FeedCard(item, router) {
    const handleReadMore = () => {
        router.push({
            pathname: '/dashboard/focusedfeed',
            params: {
                thread_id: item.id,
                title: item.title,
                desc: item.desc,
                timestamp: item.created_at,
                image: item.image,
                coords: JSON.stringify(item.coords)
            }
        })
    };

    const handleVerify = () => {
        console.log("Verify button pressed for card with text " + item);
    }

    return (
        <Card style={{ margin: 4 }}>
            <Card.Title title={item.title} subtitle={epochToDate(item.created_at)}/>
            <Card.Content style={{ flexDirection: "row", gap: 6 }}>
                { item.image && <Image style={{ width: 100, height: 100, flex: 1 }} source={{ uri: item.image }} /> }
                <Text numberOfLines={6} style={{ flex: 2, flexWrap: 'wrap' }}>{item.desc}</Text>
            </Card.Content>
            <Card.Actions>
                <Text variant="labelSmall" style={{ flex: 5 }}>Verification Score: {item.verify_count}</Text>
                <IconButton onPress={handleVerify} icon="check-decagram" style={{ flex: 1 }}/>
                <IconButton onPress={handleReadMore} icon="dots-vertical" style={{ flex: 1 }}/>
            </Card.Actions>
        </Card>
    );
}

// enum for pages
const ListTabs = Object.freeze({
    TOP: 1, // we aren't using TOP right now.
    CLOSE: 2,
    ALL: 3,
})

// mock data of threads
const mockedData = [
    {
        id: "1",
        verify_count: 213,
        title: "Crime Alert for Shoplifting near Orchard Road",
        desc: "375 arrested since 2014, be on the lookout for suspicious individuals.",
        created_at: 1492581612000,
        image: "https://media-cdn.tripadvisor.com/media/photo-s/0a/07/8f/77/orchard-road.jpg",
        coords: {}
    },
    {
        id: "2",
        verify_count: 213,
        title: "Fire in this location here",
        desc: "Credit to iStockPhoto for the image.",
        created_at: 1455555555000,
        image: "https://media.istockphoto.com/id/507185368/photo/fire-in-a-house.jpg?s=1024x1024&w=is&k=20&c=FfOWMzgl70ujTWn-iXENhjcp52VmjA3IxKzVYbLsKoY=",
        coords: {}
    },
    {
        id: "3",
        verify_count: 213,
        title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        desc: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
        created_at: 1598781225000,
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Cheese_display%2C_Cambridge_MA_-_DSC05391.jpg/1280px-Cheese_display%2C_Cambridge_MA_-_DSC05391.jpg",
        coords: {}
    },
    {
        id: "4",
        verify_count: 4,
        title: "Suspicious people following at night",
        desc: "Stay safe folks, don't walk around alone at night in this area!",
        created_at: 1681884012000,
        image: null,
        coords: {}
    },
];