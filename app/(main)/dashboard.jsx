import { View, FlatList, Image } from "react-native";
import { Text, Chip, Card, IconButton } from "react-native-paper";
import { viewStyle } from "../../ui/style";
import { useState } from "react";

export default function DashboardPage() {
    const [ active, setActive ] = useState(ListTabs.TOP);

    return (
        <View style={viewStyle.colContainerStart}>
            <View style={viewStyle.rowViewCenter}>
                <Chip
                    showSelectedOverlay
                    selected={active == ListTabs.TOP}
                    onPress={() => setActive(ListTabs.TOP)}
                    style={{flex: 1}}>
                    Verified
                </Chip>
                <Chip
                    showSelectedOverlay
                    selected={active == ListTabs.CLOSE}
                    onPress={() => setActive(ListTabs.CLOSE)}
                    style={{flex: 1}}>
                    Nearby
                </Chip>
                <Chip
                    showSelectedOverlay
                    selected={active == ListTabs.ALL}
                    onPress={() => setActive(ListTabs.ALL)}
                    style={{flex: 1}}>
                    All Feed
                </Chip>
            </View>
            <FlatList
                data={["The FitnessGram Pacer Test is a multistage aerobic capacity test that progressively gets more difficult as it continues.", "2", "3"]}
                renderItem={FeedCard}
                style={{ width: "90%" }}/>
        </View>
    );
}

function FeedCard({item}) {
    const uri = item == "2" ? null : "https://spiritislandwiki.com/images/thumb/4/4e/Ember-Eyed_Behemoth.png/400px-Ember-Eyed_Behemoth.png";
    return (
        <Card style={{ margin: 4 }}>
            <Card.Title title="Card Title" subtitle="timestamp"/>
            <Card.Content style={{ flexDirection: "row", gap: 6 }}>
                { uri && <Image style={{ width: 100, height: 100, flex: 1 }} source={{ uri }} /> }
                <Text numberOfLines={6} style={{ flex: 2, flexWrap: 'wrap' }}>{item}</Text>
            </Card.Content>
            <Card.Actions>
                <Text variant="labelSmall" style={{ flex: 5 }}>Verification Score: {100}</Text>
                <IconButton icon="check-decagram" style={{ flex: 1 }}/>
                <IconButton icon="dots-vertical" style={{ flex: 1 }}/>
            </Card.Actions>
        </Card>
    );
}

// enum for pages
const ListTabs = Object.freeze({
    TOP: 1,
    CLOSE: 2,
    ALL: 3,
})