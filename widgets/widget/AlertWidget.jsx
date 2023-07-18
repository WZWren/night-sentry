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
                backgroundColor: '#555555',
                borderRadius: 16,
            }} >
            <TextWidget
                text="Send an alert to your close contacts."
                style={{
                    fontSize: 20,
                    color: '#dddddd',
                }} />
            <FlexWidget
                style={{
                    width: "wrap_content",
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#000000',
                }}
                clickAction="DISTRESS" >
                <TextWidget
                    text="Distress Signal"
                    style={{
                        fontSize: 20,
                        color: '#cccccc',
                    }} />
            </FlexWidget>
        </FlexWidget>
    );
}