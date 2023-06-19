export function epochToDate(alert) {
    if (alert == null) {
        return "No alerts yet!";
    }
    const date = new Date(alert.location.timestamp);
    const minsTens = Math.floor(date.getMinutes() / 10);
    const minsOnes = date.getMinutes() % 10;
    return `${date.getDate()}/${date.getMonth()}/${date.getFullYear()}, at ${date.getHours()}:${minsTens}${minsOnes}`;
}