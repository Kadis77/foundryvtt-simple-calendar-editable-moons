import {Icons, MoonYearResetOptions, RoadToTheSkyMoonConfigs, RoadToTheSkyMoonIds} from "../../constants";
import {GameSettings} from "../foundry-interfacing/game-settings";
import ConfigurationItemBase from "../configuration/configuration-item-base";

/**
 * Class for representing a moon
 */
export default class RoadToTheSkyMoon extends ConfigurationItemBase {
    /**
     * An ID of one of the four RTTS moons
     * @type {RoadToTheSkyMoonIds}
     */
    rttsMoonId: RoadToTheSkyMoonIds = RoadToTheSkyMoonIds.harvest;
    /**
     * An array of historic cycle lengths
     * @type {number[]}
     */
    cycleLengths: number[] = [];
    /**
     * When the first new moon took place. Used as a reference for calculating the position of the current cycle
     */
    firstFullMoon: SimpleCalendar.FirstFullMoonDate = {
        /**
         * The year of the first full moon
         * @type {number}
         */
        year: 0,
        /**
         * The month of the first full moon
         * @type {number}
         */
        month: 1,
        /**
         * The day of the first full moon
         * @type {number}
         */
        day: 1
    };
    /**
     * A color to associate with the moon when displaying it on the calendar
     */
    color: string = "#ffffff";

    /**
     * The RTTS moon constructor
     * @param rttsMoonId
     */
    constructor(rttsMoonId: RoadToTheSkyMoonIds = RoadToTheSkyMoonIds.harvest) {
        console.log("RoadToTheSkyMoon ID", rttsMoonId);
        console.log(RoadToTheSkyMoonConfigs);
        console.log(RoadToTheSkyMoonConfigs[rttsMoonId]);
        console.log(RoadToTheSkyMoonConfigs[rttsMoonId].name);
        super(RoadToTheSkyMoonConfigs[rttsMoonId].name);

        this.rttsMoonId = rttsMoonId;

        this.color = RoadToTheSkyMoonConfigs[this.rttsMoonId.valueOf()].color;
        this.cycleLengths.push(1);
    }

    /**
     * Creates a clone of this RTTS moon object
     * @return {RoadToTheSkyMoon}
     */
    clone(): RoadToTheSkyMoon {
        const c = new RoadToTheSkyMoon(this.rttsMoonId);
        c.id = this.id;
        c.cycleLengths =  Object.assign([], this.cycleLengths);
        c.firstFullMoon.year = this.firstFullMoon.year;
        c.firstFullMoon.month = this.firstFullMoon.month;
        c.firstFullMoon.day = this.firstFullMoon.day;
        return c;
    }

    /**
     * Returns the configuration for the moon
     */
    toConfig(): SimpleCalendar.RttsMoonData {
        return {
            id: this.id,
            rttsMoonId: this.rttsMoonId,
            name: this.name,
            cycleLengths: this.cycleLengths,
            firstFullMoon: {
                year: this.firstFullMoon.year,
                month: this.firstFullMoon.month,
                day: this.firstFullMoon.day
            },
            color: this.color,
        };
    }

    /**
     * Converts this RTTS moon into a template used for displaying the RTTS moon in HTML
     */
    toTemplate(): SimpleCalendar.HandlebarTemplateData.RttsMoon {
        return {
            ...super.toTemplate(),
            name: this.name,
            cycleLengths: this.cycleLengths,
            firstFullMoon: this.firstFullMoon,
            color: this.color,
            firstFullMoonDateSelectorId: `sc_first_full_moon_date_${this.id}`,
            firstFullMoonSelectedDate: {
                year: 0,
                month: this.firstFullMoon.month,
                day: this.firstFullMoon.day,
                hour: 0,
                minute: 0,
                seconds: 0
            }
        };
    }

    /**
     * Loads the moon data from the config object.
     * @param {MoonData} config The configuration object for this class
     */
    loadFromSettings(config: SimpleCalendar.RttsMoonData) {
        if (config && Object.keys(config).length) {
            super.loadFromSettings(config);
            this.rttsMoonId = config.rttsMoonId;
            this.cycleLengths = config.cycleLengths;
            this.firstFullMoon = {
                year: config.firstFullMoon.year,
                month: config.firstFullMoon.month,
                day: config.firstFullMoon.day
            };
            this.color = config.color;
        }
    }

    /**
     * Recalculates all phase lengths after adjusting or adding a cycle length
     */
    //updatePhaseLength() {
    //    let pLength = 0,
    //        singleDays = 0;
    //    for (let i = 0; i < this.historicPhases.length; i++) {
    //        if (this.historicPhases[i].singleDay) {
    //            singleDays++;
    //        } else {
    //            pLength++;
    //        }
    //    }
    //    const phaseLength = Number(((this.cycleLength - singleDays) / pLength).toPrecision(6));
//
    //    this.historicPhases.forEach((p) => {
    //        if (p.singleDay) {
    //            p.length = 1;
    //        } else {
    //            p.length = phaseLength;
    //        }
    //    });
    //}

    /**
     * Returns the current phase of the moon based on historic data.
     * This phase will be within + or - 1 days of when the phase actually begins
     * @param calendar The year class to get the information from
     * @param {number} yearNum The year to use
     * @param {number} monthIndex The month to use
     * @param {number} dayIndex The day to use
     */
    //getDateMoonPhase(calendar: Calendar, yearNum: number, monthIndex: number, dayIndex: number): SimpleCalendar.MoonPhase {
    //    let firstNewMoonDays = calendar.dateToDays(this.firstNewMoon.year, this.firstNewMoon.month, this.firstNewMoon.day, true);
    //    let resetYearAdjustment = 0;
    //    if (this.firstNewMoon.yearReset === MoonYearResetOptions.LeapYear) {
    //        const lyYear = calendar.year.leapYearRule.previousLeapYear(yearNum);
    //        if (lyYear !== null) {
    //            firstNewMoonDays = calendar.dateToDays(lyYear, this.firstNewMoon.month, this.firstNewMoon.day, true);
    //            if (yearNum !== lyYear) {
    //                resetYearAdjustment += calendar.year.leapYearRule.fraction(yearNum);
    //            }
    //        }
    //    } else if (this.firstNewMoon.yearReset === MoonYearResetOptions.XYears) {
    //        const resetMod = yearNum % this.firstNewMoon.yearX;
    //        if (resetMod !== 0) {
    //            const resetYear = yearNum - resetMod;
    //            firstNewMoonDays = calendar.dateToDays(resetYear, this.firstNewMoon.month, this.firstNewMoon.day, true);
    //            resetYearAdjustment += resetMod / this.firstNewMoon.yearX;
    //        }
    //    }
//
    //    const daysSoFar = calendar.dateToDays(yearNum, monthIndex, dayIndex, true);
    //    const daysSinceReferenceMoon = daysSoFar - firstNewMoonDays + resetYearAdjustment;
    //    const moonCycles = daysSinceReferenceMoon / this.cycleLength;
    //    const daysIntoCycle = (moonCycles - Math.floor(moonCycles)) * this.cycleLength + this.cycleDayAdjust;
//
    //    let phaseDays = 0;
    //    let phase: SimpleCalendar.MoonPhase | null = null;
    //    for (let i = 0; i < this.historicPhases.length; i++) {
    //        const newPhaseDays = phaseDays + this.historicPhases[i].length;
    //        if (daysIntoCycle >= phaseDays && daysIntoCycle < newPhaseDays) {
    //            phase = this.historicPhases[i];
    //            break;
    //        }
    //        phaseDays = newPhaseDays;
    //    }
    //    if (phase !== null) {
    //        return phase;
    //    } else {
    //        return this.historicPhases[0];
    //    }
    //}

    /**
     * Gets the moon phase based on the current, selected or visible date
     * @param calendar The year class used to get the year, month and day to use
     * @param property Which property to use when getting the year, month and day. Can be current, selected or visible
     * @param dayToUse The day to use instead of the day associated with the property
     */
    //getMoonPhase(calendar: Calendar, property: string = "current", dayToUse: number = 0): SimpleCalendar.MoonPhase {
    //    property = property.toLowerCase() as "current" | "selected" | "visible";
    //    const yearNum =
    //        property === "current"
    //            ? calendar.year.numericRepresentation
    //            : property === "selected"
    //            ? calendar.year.selectedYear
    //            : calendar.year.visibleYear;
    //    const monthIndex = calendar.getMonthIndex(property);
    //    if (monthIndex > -1) {
    //        const dayIndex = property !== "visible" ? calendar.months[monthIndex].getDayIndex(property) : dayToUse;
    //        return this.getDateMoonPhase(calendar, yearNum, monthIndex, dayIndex);
    //    }
    //    return this.historicPhases[0];
    //}
}

