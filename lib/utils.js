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

/**
 * Converts LatLng to DMS, truncated to a multiple of 5.
 * 
 * Adjusted to use Math.floor instead of Math.trunc, to keep -ve values of LatLng consistent
 * with the implementation of the Grid.
 * 
 * For -ve values, to simplify internal implementation, the degree is floored and keeps the -ve sign, while
 * minute is kept positive. In both cases, the actual DMS value is Degree + Minutes.
 * 
 * @param {{latitude: number, longitude: number}} location The Location object which contains the LatLng values.
 * @returns The Location object in DMS, with 2 nested objects for Latitude and Longitude.
 *          Both objects contain the parameters Degree and Minutes. Minutes is truncated to
 *          a multiple of 5.
 */
export function latlngToDMS(location) {
    const latitude = location.latitude;
    const longitude = location.longitude;

    const latDeg = Math.floor(latitude);
    const latMin = Math.floor((latitude - latDeg) * 12) * 5;

    const longDeg = Math.floor(longitude);
    const longMin = Math.floor((longitude - longDeg) * 12) * 5;

    return {
        latitude: {
            degree: latDeg,
            minute: latMin,
        },
        longitude: {
            degree: longDeg,
            minute: longMin
        }
    };
}

/**
 * Compares adjacencies of location grid squares in DMS based on the given minute size.
 * 2 grid squares are adjacent if the target and current squares are within 5 spaces
 * of each other.
 * 
 * @param {{
 *      latitude: {degree: number, minute: number},
 *      longitude: {degree: number, minute: number}
 * }} current The Location object denoting the users current location.
 * @param {{
 *      latitude: {degree: number, minute: number},
 *      longitude: {degree: number, minute: number}
 * }} target The Location object denoting the target location.
 * @return true if the 2 grid squares are adjacent, false otherwise.
 */
export function compareDMSGrid(current, target) {
    return compareDegMin(current.latitude, target.latitude) && compareDegMin(current.longitude, target.longitude);
}

/**
 * Helper function for compareDMSGrid, to compare Latitudes and Longitudes.
 * 
 * @param {{degree: number, minute: number}} current The DegMin of the current object
 * @param {{degree: number, minute: number}} target The DegMin of the target object
 * @return true if the 2 target objects are adjacent on the current axis of comparison.
 */
function compareDegMin(current, target) {
    const currConverted = current.degree * 60 + current.minute;
    const targetConverted = target.degree * 60 + target.minute;
    const absDiff = Math.abs(targetConverted - currConverted);
    return absDiff <= 5;
}