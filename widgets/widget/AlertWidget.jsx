import React from "react";
import { FlexWidget, TextWidget } from 'react-native-android-widget';

export function AlertWidget() {
    return (
        <FlexWidget
            style={{
                height: 'match_parent',
                width: 'match_parent',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#111111',
                borderRadius: 16,
                flexGap: 8
            }} >
            <TextWidget
                text="Send an alert to your close contacts."
                style={{
                    fontSize: 32,
                    color: '#dddddd',
                }} />
            <FlexWidget
                style={{
                    height: "50%",
                    width: "50%",
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#444444',
                    borderRadius: 8
                }}
                clickAction="DISTRESS" >
                <TextWidget
                    text="Distress Signal"
                    style={{
                        fontSize: 28,
                        color: '#cccccc',
                    }} />
            </FlexWidget>
        </FlexWidget>
    );
}