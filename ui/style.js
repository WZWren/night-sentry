/**
 * style.js holds the general styling info used throughout the app, like
 * background color, page styling and text styling. Component-specific styling
 * are either done inline or under nativeStyle in the component.
 */

import { StyleSheet } from "react-native";

export const viewStyle = StyleSheet.create({
    colContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    colContainerStart: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: 8,
        gap: 4,
    },
    rowView: {
        flexDirection: "row",
        gap: 4,
    },
    rowViewCenter: {
        flexDirection: "row",
        alignItems: 'center',
        gap: 4,
        padding: 8,
    },
    spaceOnSides: {
        width: '80%',
    },
});

export const textStyle = StyleSheet.create({
    standard: {
        fontSize: 16,
    },
    link: {
        fontSize: 16,
        color: "#00004D",
    },
})