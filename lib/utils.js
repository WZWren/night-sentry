export function extractTimestamp(alert) {
    if (alert == null) {
        return "No alerts yet!";
    }
    return epochToDate(alert.location.timestamp);
}

export function epochToDate(timestamp) {
    const date = new Date(timestamp);
    const minsTens = Math.floor(date.getMinutes() / 10);
    const minsOnes = date.getMinutes() % 10;
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}, at ${date.getHours()}:${minsTens}${minsOnes}`;
}