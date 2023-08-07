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
});

describe('Grid Util Functions', () => {
    describe('latlngToDMS', () => {
        /**
         * This checks if the latlngToDMS function will properly assign the trivial cases the proper value.
         * ie 0=0, 5=5 cases.
         * This also tests the structure of the object returned.
         */
        it('should return a object with nested lat/long objects with trivial 0 values.', () => {
            const input = {
                latitude: 0,
                longitude: 0
            };
            const expected = {
                latitude: {
                    degree: 0,
                    minute: 0
                },
                longitude: {
                    degree: 0,
                    minute: 0
                }
            };
            const result = Utils.latlngToDMS(input);

            expect(result).toStrictEqual(expected);
        });

        /**
         * This checks if the method properly floors the latlng to a minute with multiple 5.
         * 1 degree = 60 minutes, so a latlng of 1.58 should floor to 1 degree 30 mins, and
         * 1.59 should floor to 1 degree 35 mins.
         */
        it('should floor the latlng minute to the lower multiple of 5', () => {
            const input = [{
                latitude: 1.5,
                longitude: 1.5
            }, {
                latitude: 1.58,
                longitude: 1.59
            }, {
                latitude: 1.584,
                longitude: 1.583
            }];
            const expected = [{
                latitude: { degree: 1, minute: 30 },
                longitude: { degree: 1, minute: 30 }
            }, {
                latitude: { degree: 1, minute: 30 },
                longitude: { degree: 1, minute: 35 }
            }, {
                latitude: { degree: 1, minute: 35 },
                longitude: { degree: 1, minute: 30 }
            }];

            const result = input.map((x) => Utils.latlngToDMS(x));

            expect(result).toStrictEqual(expected);
        });

        /**
         * This checks if there are rounding errors after manipulating values in floor.
         */
        it('should not have rounding errors in acceptable ranges of the JS float', () => {
            const input = {
                latitude: 1.999999999999,
                longitude: 1.000000000001
            };
            const expected = {
                latitude: { degree: 1, minute: 55 },
                longitude: { degree: 1, minute: 0 }
            };

            const result = Utils.latlngToDMS(input);

            expect(result).toStrictEqual(expected);
        });

        /**
         * This checks for the edge case of -ve latlng values.
         * While the app is based in SG, which has no -ve latlng values, we include this anyways as users
         * are allowed to use -ve latlng marker points.
         * 
         * On testing, the values obtained is not in a human readable format. However, as this value is never exposed,
         * we keep the implementation to simplify the internal implementation of the comparison function.
         * The actual DMS can be obtained via Degree + Minute. IE -2* +50' = 1* 10' S.
         */
        it('should properly classify -ve latlng values to the bottom left point on the grid square', () => {
            const input = [{
                latitude: -1.1,
                longitude: -1.05
            }, {
                latitude: -0.05,
                longitude: -0.1
            }, {
                latitude: -0.999999,
                longitude: -0.000001
            }];
            const expected = [{
                latitude: { degree: -2, minute: 50 },
                longitude: { degree: -2, minute: 55 }
            }, {
                latitude: { degree: -1, minute: 55 },
                longitude: { degree: -1, minute: 50 }
            }, {
                latitude: { degree: -1, minute: 0 },
                longitude: { degree: -1, minute: 55 }
            }];

            const result = input.map((x) => Utils.latlngToDMS(x));

            expect(result).toStrictEqual(expected);
        });
    });

    describe('compareDMSGrid', () => {
        /**
         * Checks if the direct offset of 5 on one of the 2 axis creates adjacency.
         */
        describe('should pass adjacency for all test cases here', () => {
            test('Test Case for Reflexivity', () => {
                const input = {
                    latitude: {
                        degree: 3,
                        minute: 50
                    },
                    longitude: {
                        degree: 6,
                        minute: 20
                    }
                };
                const symmetry = {
                    latitude: {
                        degree: 3,
                        minute: 55
                    },
                    longitude: {
                        degree: 6,
                        minute: 20
                    }
                };
                const resultReflexive = Utils.compareDMSGrid(input, input);
                expect(resultReflexive).toBeTruthy();
            });

            test('Test Case for Latitude Offset of 5', () => {
                const input = {
                    latitude: {
                        degree: 3,
                        minute: 55
                    },
                    longitude: {
                        degree: 6,
                        minute: 20
                    }
                };
                const symmetry = {
                    latitude: {
                        degree: 4,
                        minute: 0
                    },
                    longitude: {
                        degree: 6,
                        minute: 20
                    }
                };
                const resultSymmetry = Utils.compareDMSGrid(input, symmetry);
                const resultMirror = Utils.compareDMSGrid(symmetry, input);

                expect(resultSymmetry).toBeTruthy();
                expect(resultSymmetry).toEqual(resultMirror);
            });

            test('Test Case for Longitude Offset of 5', () => {
                const input = {
                    latitude: {
                        degree: 3,
                        minute: 55
                    },
                    longitude: {
                        degree: 6,
                        minute: 20
                    }
                };
                const symmetry = {
                    latitude: {
                        degree: 3,
                        minute: 55
                    },
                    longitude: {
                        degree: 6,
                        minute: 15
                    }
                };
                const resultSymmetry = Utils.compareDMSGrid(input, symmetry);
                const resultMirror = Utils.compareDMSGrid(symmetry, input);

                expect(resultSymmetry).toBeTruthy();
                expect(resultSymmetry).toEqual(resultMirror);
            });

            test('Test Case for Offset of 5 on Both Axis', () => {
                const input = {
                    latitude: {
                        degree: 3,
                        minute: 55
                    },
                    longitude: {
                        degree: 6,
                        minute: 20
                    }
                };
                const symmetry = {
                    latitude: {
                        degree: 3,
                        minute: 50
                    },
                    longitude: {
                        degree: 6,
                        minute: 15
                    }
                };
                const resultSymmetry = Utils.compareDMSGrid(input, symmetry);
                const resultMirror = Utils.compareDMSGrid(symmetry, input);

                expect(resultSymmetry).toBeTruthy();
                expect(resultSymmetry).toEqual(resultMirror);
            });
        });

        it('should not be transitive', () => {
            const x = {
                latitude: {
                    degree: 3,
                    minute: 55
                },
                longitude: {
                    degree: 6,
                    minute: 20
                }
            };
            // y is the center location.
            const y = {
                latitude: {
                    degree: 3,
                    minute: 50
                },
                longitude: {
                    degree: 6,
                    minute: 15
                }
            };
            const z = {
                latitude: {
                    degree: 3,
                    minute: 45
                },
                longitude: {
                    degree: 6,
                    minute: 15
                }
            };

            const xy = Utils.compareDMSGrid(x, y);
            const yz = Utils.compareDMSGrid(y, z);
            const xz = Utils.compareDMSGrid(x, z);

            expect(xy).toBeTruthy();
            expect(yz).toBeTruthy();
            expect(xz).toBeFalsy();
        })

        /**
         * This checks if the comparison works on the 0 border between -ve and +ve values.
         */
        it('should register adjacency at the 0 border', () => {
            const x = {
                latitude: { degree: 0, minute: 0 },
                longitude: { degree: 0, minute: 0 }
            };
            const y = {
                latitude: { degree: -1, minute: 55 },
                longitude: { degree: 0, minute: 5 }
            }

            const result = Utils.compareDMSGrid(x, y);

            expect(result).toBeTruthy();
        });

        /**
         * This checks if the comparison works on the -ve values.
         */
        it('should register adjacency at -ve values', () => {
            const x = {
                latitude: { degree: -6, minute: 30 }, // 5* 30' S
                longitude: { degree: -4, minute: 5 } // 3* 55' W.
            };
            const y = {
                latitude: { degree: -6, minute: 25 }, // 5* 35' S
                longitude: { degree: -4, minute: 0 } // 4* 0' W.
            }

            const result = Utils.compareDMSGrid(x, y);

            expect(result).toBeTruthy();
        });
        /**
         * This checks if the comparison works on the -ve values.
         */
        it('should not register adjacency for non-adjacent squares', () => {
            const x = {
                latitude: { degree: -6, minute: 30 },
                longitude: { degree: 0, minute: 55 }
            };
            const y = {
                latitude: { degree: -6, minute: 0 },
                longitude: { degree: -5, minute: 0 }
            }

            const result = Utils.compareDMSGrid(x, y);

            expect(result).toBeFalsy();
        });
    });
});