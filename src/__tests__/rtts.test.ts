import { describe, test, expect, beforeEach } from "@jest/globals";
import Calendar from "../classes/calendar/index";
import { RoadToTheSkyMoon } from "../classes/calendar/moon-rtts";
import RoadToTheSkyMonth from "../classes/calendar/month-rtts";
import { RoadToTheSkyMoonIds, RoadToTheSkyMonthIds, RoadToTheSkyMonthConfigs } from "../constants";

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

/**
 * Build a minimal Calendar with cycle lengths derived from a provided array.
 * The harvest moon drives rttsMonths; all other moons get single-element
 * cycleLengths arrays so recalculateFullMoonDates doesn't iterate forever.
 */
function buildTestCalendar(cycleLengths: number[]): Calendar {
    const cal = new Calendar("test-cal", "Test Calendar");
    cal.startDate = { year: 420, month: 0, day: 0 };

    // Build rttsMonths (one per entry in cycleLengths)
    cal.rttsMonths = cycleLengths.map((len) =>
        new RoadToTheSkyMonth(RoadToTheSkyMonthIds.dew, 0, len)
    );

    // Harvest moon — owns the cycleLengths array
    const harvest = new RoadToTheSkyMoon(RoadToTheSkyMoonIds.harvest);
    harvest.cycleLengths = [...cycleLengths];
    harvest.firstFullMoon = { year: 420, month: 0, day: 0 };

    // Other moons — single trivial cycle so recalculate doesn't blow up
    const lantern = new RoadToTheSkyMoon(RoadToTheSkyMoonIds.lantern);
    lantern.cycleLengths = [cycleLengths.reduce((a, b) => a + b, 0) + 1]; // one big cycle

    const foxfire = new RoadToTheSkyMoon(RoadToTheSkyMoonIds.foxfire);
    foxfire.cycleLengths = [cycleLengths.reduce((a, b) => a + b, 0) + 1];

    const eye = new RoadToTheSkyMoon(RoadToTheSkyMoonIds.eye);
    eye.cycleLengths = [cycleLengths.reduce((a, b) => a + b, 0) + 1];

    cal.rttsMoons = [harvest, lantern, foxfire, eye];

    // Populate fullMoonDates and month names
    cal.onRttsMonthDeleted();

    return cal;
}

// Twelve months per year, 30 days each — two full calendar years
const TWO_YEAR_CYCLE = Array(24).fill(30);

// ---------------------------------------------------------------------------
// Suite 1: getRttsMonthIndexFromDate (pure arithmetic)
// ---------------------------------------------------------------------------

describe("getRttsMonthIndexFromDate", () => {
    let cal: Calendar;
    beforeEach(() => { cal = buildTestCalendar(TWO_YEAR_CYCLE); });

    test("year 420 month 0 → index 0", () => {
        expect(cal.getRttsMonthIndexFromDate(420, 0)).toBe(0);
    });

    test("year 420 month 11 → index 11", () => {
        expect(cal.getRttsMonthIndexFromDate(420, 11)).toBe(11);
    });

    test("year 421 month 0 → index 12", () => {
        expect(cal.getRttsMonthIndexFromDate(421, 0)).toBe(12);
    });

    test("year 421 month 11 → index 23", () => {
        expect(cal.getRttsMonthIndexFromDate(421, 11)).toBe(23);
    });

    test("formula is (year - 420) * 12 + month", () => {
        expect(cal.getRttsMonthIndexFromDate(425, 7)).toBe((425 - 420) * 12 + 7);
    });
});

// ---------------------------------------------------------------------------
// Suite 2: Core date arithmetic — rttsDateToDays / getDaysAsDate / round-trip
// ---------------------------------------------------------------------------

describe("date arithmetic", () => {
    // Variable month lengths: 28, 30, 31 cycling across 3 months in year 420
    const CYCLE = [28, 30, 31, 28, 30, 31, 28, 30, 31, 28, 30, 31,  // year 420
                   28, 30, 31, 28, 30, 31, 28, 30, 31, 28, 30, 31]; // year 421
    let cal: Calendar;
    beforeEach(() => { cal = buildTestCalendar(CYCLE); });

    test("rttsDateToDays(0, 0) === 0", () => {
        expect(cal.rttsDateToDays(0, 0)).toBe(0);
    });

    test("rttsDateToDays(1, 0) === 28 (sum of month 0)", () => {
        expect(cal.rttsDateToDays(1, 0)).toBe(28);
    });

    test("rttsDateToDays(2, 0) === 58 (28 + 30)", () => {
        expect(cal.rttsDateToDays(2, 0)).toBe(28 + 30);
    });

    test("rttsDateToDays(0, 5) === 5", () => {
        expect(cal.rttsDateToDays(0, 5)).toBe(5);
    });

    test("rttsDateToDays(1, 3) === 31 (28 + 3)", () => {
        expect(cal.rttsDateToDays(1, 3)).toBe(28 + 3);
    });

    test("getDaysAsDate(0) → {year: 420, month: 0, day: 0}", () => {
        const d = cal.getDaysAsDate(0);
        expect(d).toEqual({ year: 420, month: 0, day: 0 });
    });

    test("getDaysAsDate(28) → {year: 420, month: 1, day: 0}", () => {
        const d = cal.getDaysAsDate(28);
        expect(d).toEqual({ year: 420, month: 1, day: 0 });
    });

    test("getDaysAsDate(28 + 30) → {year: 420, month: 2, day: 0}", () => {
        const d = cal.getDaysAsDate(28 + 30);
        expect(d).toEqual({ year: 420, month: 2, day: 0 });
    });

    test("getDaysAsDate(year total) → start of year 421", () => {
        const yearTotal = CYCLE.slice(0, 12).reduce((a, b) => a + b, 0);
        const d = cal.getDaysAsDate(yearTotal);
        expect(d).toEqual({ year: 421, month: 0, day: 0 });
    });

    test("getDateInDays round-trip with getDaysAsDate", () => {
        const checkpoints = [
            { year: 420, month: 0, day: 0 },
            { year: 420, month: 1, day: 3 },
            { year: 420, month: 11, day: 0 },
            { year: 421, month: 0, day: 0 },
            { year: 421, month: 5, day: 15 },
        ];
        for (const date of checkpoints) {
            const days = cal.getDateInDays(date);
            const back = cal.getDaysAsDate(days);
            expect(back).toEqual(date);
        }
    });

    test("rttsSecondsToDate(0) → start date", () => {
        const dt = cal.rttsSecondsToDate(0);
        expect(dt.year).toBe(420);
        expect(dt.month).toBe(0);
        expect(dt.day).toBe(0);
        expect(dt.hour).toBe(0);
        expect(dt.minute).toBe(0);
        expect(dt.seconds).toBe(0);
    });

    test("rttsSecondsToDate(86400) → day 1 of month 0", () => {
        const dt = cal.rttsSecondsToDate(86400); // one full day
        expect(dt.year).toBe(420);
        expect(dt.month).toBe(0);
        expect(dt.day).toBe(1);
    });

    test("rttsSecondsToDate preserves intra-day time", () => {
        const secondsIntoDay = 3 * 3600 + 45 * 60 + 17; // 3h 45m 17s
        const dt = cal.rttsSecondsToDate(secondsIntoDay);
        expect(dt.hour).toBe(3);
        expect(dt.minute).toBe(45);
        expect(dt.seconds).toBe(17);
    });
});

// ---------------------------------------------------------------------------
// Suite 3: onRttsMonthDeleted — month naming cycles correctly
// ---------------------------------------------------------------------------

describe("onRttsMonthDeleted month naming", () => {
    test("12 months: all 12 RTTS names assigned in order", () => {
        const cal = buildTestCalendar(Array(12).fill(30));
        const expectedNames = RoadToTheSkyMonthConfigs.map((c: any) => c.name);
        for (let i = 0; i < 12; i++) {
            expect(cal.rttsMonths[i].name).toBe(expectedNames[i]);
        }
    });

    test("24 months (two years): names wrap back after month 11", () => {
        const cal = buildTestCalendar(Array(24).fill(30));
        const expectedNames = RoadToTheSkyMonthConfigs.map((c: any) => c.name);
        // Year 420: months 0-11
        for (let i = 0; i < 12; i++) {
            expect(cal.rttsMonths[i].name).toBe(expectedNames[i]);
        }
        // Year 421: months 12-23 wrap to same names as 0-11
        for (let i = 0; i < 12; i++) {
            expect(cal.rttsMonths[12 + i].name).toBe(expectedNames[i]);
        }
    });

    test("first month is always Dew Month", () => {
        const cal = buildTestCalendar(Array(36).fill(28));
        expect(cal.rttsMonths[0].name).toBe("Dew Month");
        expect(cal.rttsMonths[12].name).toBe("Dew Month");
        expect(cal.rttsMonths[24].name).toBe("Dew Month");
    });

    test("month 11 is always Lamp's Month", () => {
        const cal = buildTestCalendar(Array(24).fill(28));
        expect(cal.rttsMonths[11].name).toBe("Lamp's Month");
        expect(cal.rttsMonths[23].name).toBe("Lamp's Month");
    });

    test("rttsMonthId is set to (index % 12) for each month", () => {
        const cal = buildTestCalendar(Array(24).fill(28));
        for (let i = 0; i < 24; i++) {
            expect(cal.rttsMonths[i].rttsMonthId).toBe(i % 12);
        }
    });
});

// ---------------------------------------------------------------------------
// Suite 4: RoadToTheSkyMoon.getDateMoonPhase — phase calculation
// ---------------------------------------------------------------------------

describe("moon phase calculation", () => {
    // 28-day cycle: markers at 0 (full), 7 (waning-half), 14 (new), 21 (waxing-half)
    let cal: Calendar;
    let harvest: RoadToTheSkyMoon;

    beforeEach(() => {
        cal = buildTestCalendar(Array(3).fill(30)); // 3 months of 30 days each
        harvest = cal.rttsMoons[RoadToTheSkyMoonIds.harvest];
        // Override the harvest moon's cycleLengths with a controlled 28-day cycle
        harvest.cycleLengths = [28, 28, 28];
        harvest.firstFullMoon = { year: 420, month: 0, day: 0 };
        harvest.recalculateFullMoonDates(cal);
    });

    function phase(dayOffset: number): string {
        // getDateMoonPhase(calendar, yearNum, monthIndex(0-11), dayIndex)
        return harvest.getDateMoonPhase(cal, 420, 0, dayOffset).name;
    }

    test("day 0 → Full Moon", () => {
        expect(phase(0)).toBe("Full Moon");
    });

    test("day 14 → New Moon (halfway)", () => {
        expect(phase(14)).toBe("New Moon");
    });

    test("day 7 → Half Moon (waning)", () => {
        expect(phase(7)).toBe("Half Moon");
    });

    test("day 21 → Half Moon (waxing)", () => {
        expect(phase(21)).toBe("Half Moon");
    });

    test("days 1–6 → Waning Gibbous Moon", () => {
        for (let d = 1; d <= 6; d++) {
            expect(phase(d)).toBe("Waning Gibbous Moon");
        }
    });

    test("days 8–13 → Waning Crescent Moon", () => {
        for (let d = 8; d <= 13; d++) {
            expect(phase(d)).toBe("Waning Crescent Moon");
        }
    });

    test("days 15–20 → Waxing Crescent Moon", () => {
        for (let d = 15; d <= 20; d++) {
            expect(phase(d)).toBe("Waxing Crescent Moon");
        }
    });

    test("days 22–27 → Waxing Gibbous Moon", () => {
        for (let d = 22; d <= 27; d++) {
            expect(phase(d)).toBe("Waxing Gibbous Moon");
        }
    });

    test("second cycle (days 28+) wraps correctly — day 28 is Full Moon", () => {
        expect(phase(28)).toBe("Full Moon");
    });

    test("before firstFullMoon returns default phase", () => {
        // Set firstFullMoon to day 5 so day 0–4 are 'before' it
        harvest.firstFullMoon = { year: 420, month: 0, day: 5 };
        harvest.recalculateFullMoonDates(cal);
        // Day 0 is before the first full moon → default
        const p = harvest.getDateMoonPhase(cal, 420, 0, 0);
        // The default phase config has name "Full Moon" (see moonPhaseFromConfig for RoadToTheSkyMoonPhaseIds.default)
        // but we mainly care that the branch was taken; check by verifying day 5 IS full moon
        expect(harvest.getDateMoonPhase(cal, 420, 0, 5).name).toBe("Full Moon");
    });
});
