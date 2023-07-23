/**
 * Extracts the timestamp from an Alert object derived from Supabase.
 * 
 * @param {*} alert The Alert object which contains a nested location object with a timestamp.
 * @returns 
 */
export function extractTimestamp(alert) {
    if (alert == null) {
        return "No alerts yet!";
    }
    return epochToDate(alert.location.timestamp);
}

/**
 * Converts the Epoch timestamp value in ms to a human-readable string format.
 * 
 * @param {number} timestamp The Epoch Timestamp in milliseconds.
 * @returns The Date string, in the format: DD/MM/YYYY, at hh:mm
 */
export function epochToDate(timestamp) {
    const date = new Date(timestamp);
    const minsTens = Math.floor(date.getMinutes() / 10);
    const minsOnes = date.getMinutes() % 10;
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}, at ${date.getHours()}:${minsTens}${minsOnes}`;
}