import * as Utils from "../../lib/utils";

describe('epochToDate', () => {
    /**
     * This checks if the method accurately displays the base-line time of Epoch 0 in local time.
     * 
     * First test has revealed a bug in the code where the month was displayed as 0 instead of the expected
     * 1. This was due to Date.getMonth() having a start month as 0 instead of 1.
     */
    it('should return "1/1/1970, at 7:30" when tested in SGT', () => {
        const timestamp = 0;
        // SGT was 7H30MINS ahead of UTC prior to 1 Jan 1982.
        const expected = "1/1/1970, at 7:30";
        const result = Utils.epochToDate(timestamp);

        expect(result).toBe(expected);
    });

    /**
     * This checks if the method accurately buffers single-digit values for minutes.
     * Time displayed without a buffer in the minute values, such as for values like one minute past midnight
     * (displayed 0:1) may cause confusion for users as it does not accurately reflect how people interpret time.
     */
    it('should display 1672502700000 as "1/1/2023, at 0:05" when tested in SGT', () => {
        const timestamp = 1672502700000;
        const expected = "1/1/2023, at 0:05";
        const result = Utils.epochToDate(timestamp);
        
        expect(result).toBe(expected);
    });
})