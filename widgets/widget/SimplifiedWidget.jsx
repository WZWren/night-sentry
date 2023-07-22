import React from "react";
import { FlexWidget, TextWidget } from 'react-native-android-widget';

function SimplifiedMain({ timestamp }) {
    return(
        <FlexWidget
            style={{
                height: 'match_parent',
                width: 'match_parent',
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
                backgroundColor: '#111111',
                borderRadius: 0,
                padding: 15,
                flexGap: 10
            }}
            clickAction="DISTRESS" >
            <TextWidget
                text="Send an alert..."
                style={{
                    textAlign: "left",
                    fontSize: 25,
                    color: '#dddddd'
                }} />
            <TextWidget
                text={timestamp}
                style={{
                    textAlign: "left",
                    fontSize: 14,
                    color: '#dddddd'
                }} />
        </FlexWidget>
    );
}

function SimplifiedLoading() {
    return (
        <FlexWidget
            style={{
                height: 'match_parent',
                width: 'match_parent',
                justifyContent: "flex-start",
                alignItems: "flex-start",
                backgroundColor: '#111111',
                borderRadius: 0,
                padding: 15
            }} >
            <TextWidget
                text="Processing Request..."
                style={{
                    textAlign: "left",
                    fontSize: 25,
                    color: '#dddddd'
                }} />
        </FlexWidget>
    )
}

export function SimplifiedWidget({ timestamp, isLoading }) {
    return (
        <FlexWidget
            style={{
                height: 'match_parent',
                width: 'match_parent',
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
                backgroundColor: '#111111',
                borderRadius: 0
            }} >
            { isLoading && <SimplifiedLoading />}
            { !isLoading && <SimplifiedMain timestamp={ timestamp }/>}
        </FlexWidget>
    );
}