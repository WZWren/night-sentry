import React from "react";
import { FlexWidget, TextWidget } from 'react-native-android-widget';

function AlertLockscreen({ timestamp }) {
    return (
        <FlexWidget
            style={{
                flexDirection: 'row',
                height: 'match_parent',
                width: 'match_parent',
                justifyContent: 'space-around',
                alignItems: 'center',
                backgroundColor: '#111111',
                borderRadius: 16,
                flexGap: 20,
            }} >
            <FlexWidget
                style={{
                    flexDirection: "column",
                    height: "match_parent",
                    width: 160,
                    justifyContent: "center",
                    alignItems: "center",
                    flexGap: 20
                }}>
                <TextWidget
                    text="Unlock to Send Alert."
                    style={{
                        textAlign: "center",
                        fontSize: 20,
                        color: '#dddddd',
                        margin: 4
                    }} />
                <TextWidget
                    text={timestamp}
                    style={{
                        textAlign: "center",
                        fontSize: 20,
                        color: '#dddddd',
                        margin: 4
                    }} />
            </FlexWidget>
            <FlexWidget
                style={{
                    height: 96,
                    width: 96,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#444444',
                    borderRadius: 8
                }}
                clickAction="UNLOCK"
                clickActionData={{ timestamp: timestamp }} >
                <TextWidget
                    text="Unlock"
                    style={{
                        fontSize: 16,
                        color: '#cccccc',
                    }} />
            </FlexWidget>
        </FlexWidget>
    );
}

function AlertMain({ timestamp }) {
    return(
        <FlexWidget
            style={{
                height: 'match_parent',
                width: 'match_parent',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#111111',
                borderRadius: 16,
                flexGap: 20,
            }} >
            <TextWidget
                text="Send an alert to your close contacts."
                style={{
                    textAlign: "center",
                    fontSize: 20,
                    color: '#dddddd',
                    margin: 4
                }} />
            <FlexWidget
                style={{
                    flexDirection: "row",
                    height: 64,
                    width: "match_parent",
                    justifyContent: "center",
                    alignItems: "center",
                    flexGap: 10,
                }}>
                <FlexWidget
                    style={{
                        height: 64,
                        width: 64,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: '#444444',
                        borderRadius: 8
                    }}
                    clickAction="LOCK"
                    clickActionData={{ timestamp: timestamp }} >
                    <TextWidget
                        text="Cancel"
                        style={{
                            fontSize: 16,
                            color: '#cccccc',
                        }} />
                </FlexWidget>
                <FlexWidget
                    style={{
                        height: 64,
                        width: 240,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: '#444444',
                        borderRadius: 8
                    }}
                    clickAction="DISTRESS" >
                    <TextWidget
                        text="Distress Signal"
                        style={{
                            fontSize: 16,
                            color: '#cccccc',
                        }} />
                </FlexWidget>
            </FlexWidget>
        </FlexWidget>
    );
}

function AlertLoading() {
    return (
        <FlexWidget
            style={{
                height: 'match_parent',
                width: 'match_parent',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#111111',
                borderRadius: 16,
                flexGap: 20,
            }} >
            <TextWidget
                text="Processing Request..."
                style={{
                    textAlign: "center",
                    fontSize: 32,
                    color: '#dddddd',
                    margin: 4
                }} />
        </FlexWidget>
    )
}

export function AlertWidget({ timestamp, isLocked, isLoading }) {
    return (
        <FlexWidget
            style={{
                height: 'match_parent',
                width: 'match_parent',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#111111',
                borderRadius: 16
            }} >
            { isLoading && <AlertLoading />}
            { !isLoading && isLocked && <AlertLockscreen timestamp={ timestamp }/> }
            { !isLoading && !isLocked && <AlertMain timestamp={ timestamp }/>}
        </FlexWidget>
    );
}