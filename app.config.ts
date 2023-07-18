import { ExpoConfig, ConfigContext } from '@expo/config';
import type { WithAndroidWidgetsParams } from 'react-native-android-widget';
import * as dotenv from 'dotenv';

// initialize dotenv
dotenv.config();

const widgetConfig: WithAndroidWidgetsParams = {
    // Paths to all custom fonts used in all widgets
    widgets: [
        {
            name: 'Alert', // This name will be the **name** with which we will reference our widget.
            label: 'My Alert Widget', // Label shown in the widget picker
            minWidth: '320dp',
            minHeight: '120dp',
            description: 'This is my first widget', // Description shown in the widget picker
            previewImage: './assets/widget-preview/alert.png', // Path to widget preview image
            
            // How often, in milliseconds, that this AppWidget wants to be updated.
            // The task handler will be called with widgetAction = 'UPDATE_WIDGET'.
            // Default is 0 (no automatic updates)
            // Minimum is 1800000 (30 minutes == 30 * 60 * 1000).
            updatePeriodMillis: 1800000,
        },
    ],
};

export default ({ config }: ConfigContext): ExpoConfig => ({
    ...config,
    name: 'night-sentry',
    scheme: 'night-sentry',
    slug: 'night-sentry',
    version: '1.0.1',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    plugins: [[
        "react-native-android-widget",
        widgetConfig
    ]],
    splash: {
        image: './assets/splash.png',
        resizeMode: 'contain',
        backgroundColor: '#ffffff',
    },
    assetBundlePatterns: ["**/*"],
    ios: {
        supportsTablet: true,
    },
    android: {
        googleServicesFile: process.env.GOOGLE_SERVICES_FILE,
        adaptiveIcon: {
            foregroundImage: './assets/adaptive-icon.png',
            backgroundColor: '#FFFFFF',
        },
        userInterfaceStyle: "light",
        package: "com.wzwren.nightsentry",
        config: {
            googleMaps: {
                apiKey: process.env.GOOGLE_MAPS_API_KEY,
            }
        }
    },
    web: {
        favicon: "./assets/favicon.png"
    },
    extra: {
        eas: {
            projectId: process.env.EAS_KEY,
        }
    }
});