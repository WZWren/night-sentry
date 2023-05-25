import 'react-native-url-polyfill/auto'
import { createClient } from "@supabase/supabase-js";
import AsyncStorage from '@react-native-async-storage/async-storage'

const projectUrl = process.env.PROJECT_URL
const projectKey = process.env.PROJECT_KEY

export const supabase = createClient(projectUrl, projectKey, {
    auth: {
        storage: AsyncStorage,
    }
});