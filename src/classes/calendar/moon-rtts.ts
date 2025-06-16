import {Icons, RoadToTheSkyMoonConfigs, RoadToTheSkyMoonIds, RoadToTheSkyMoonPhaseIds} from "../../constants";
import ConfigurationItemBase from "../configuration/configuration-item-base";
import Calendar from "./index";
import {SimpleCalendar} from "../../../types";

export class RoadToTheSkyMoon extends ConfigurationItemBase {
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
     * An array of historic full moon dayes
     * @type {number[]}
     */
    fullMoonDates: SimpleCalendar.Date[] = [];
    /**
     * When the first new moon took place. Used as a reference for calculating the position of the current cycle
     */
    firstFullMoon: SimpleCalendar.FirstFullMoonDate = {
        /**
         * The year of the first full moon
         * @type {number}
         */
        year: 420,
        /**
         * The month of the first full moon
         * @type {number}
         */
        month: 0,
        /**
         * The day of the first full moon
         * @type {number}
         */
        day: 0
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
        super(RoadToTheSkyMoonConfigs[rttsMoonId].name);

        this.rttsMoonId = rttsMoonId;

        this.color = RoadToTheSkyMoonConfigs[this.rttsMoonId].color;
        
        if (rttsMoonId == RoadToTheSkyMoonIds.harvest) {
            // If this is a new harvest moon, push two months of 30 days to start so that the calendar doesn't break
            this.cycleLengths.push(30);
            this.cycleLengths.push(30);
        }
        else {
            // Push one cycle of one day
            this.cycleLengths.push(1);
        }
    }

    /**
     * Creates a clone of this RTTS moon object
     * @return {RoadToTheSkyMoon}
     */
    clone(): RoadToTheSkyMoon {
        const c = new RoadToTheSkyMoon(this.rttsMoonId);
        c.id = this.id;
        c.cycleLengths = Object.assign([], this.cycleLengths);
        c.fullMoonDates = Object.assign([], this.fullMoonDates);
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
            fullMoonDates: this.fullMoonDates,
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
        let cycles = [];
        for (let i = 0; i < this.cycleLengths.length; i++) {
            let dateString = "TBD";
            if (this.fullMoonDates.length > i && this.fullMoonDates[i]) {
                dateString = this.fullMoonDates[i].day + "/" + this.fullMoonDates[i].month + "/" + this.fullMoonDates[i].year;
            }
            cycles.push(
                {
                    id: "rttsMoonCycle-" + this.name + "-" + i,
                    cycleLength: this.cycleLengths[i],
                    startDate: dateString
                });
        }
        
        return {
            ...super.toTemplate(),
            name: this.name,
            cycles: cycles,
            firstFullMoon: {
                year: 420,
                month: 0,
                day: 0
            },
            color: this.color,
        };
    }

    /**
     * Loads the moon data from the config object.
     * @param {RttsMoonData} config The configuration object for this class
     */
    loadFromSettings(config: SimpleCalendar.RttsMoonData) {
        if (config && Object.keys(config).length) {
            super.loadFromSettings(config);
            
            this.rttsMoonId = config.rttsMoonId;
            this.cycleLengths = config.cycleLengths;
            this.fullMoonDates = config.fullMoonDates;
            this.firstFullMoon = {
                year: 420,
                month: 0,
                day: 0
            };
            this.color = RoadToTheSkyMoonConfigs[this.rttsMoonId].color;
        }
    }

    /**
     * Returns the current phase of the moon based on historic data.
     * This phase will be within + or - 1 days of when the phase actually begins
     * @param calendar The year class to get the information from
     * @param {number} yearNum The year to use
     * @param {number} monthIndex The month to use
     * @param {number} dayIndex The day to use
     */
    getDateMoonPhase(calendar: Calendar, yearNum: number, monthIndex: number, dayIndex: number): SimpleCalendar.MoonPhase {
        let firstFullMoonDays = calendar.rttsDateToDays(calendar.getRttsMonthIndexFromDate(this.firstFullMoon.year, this.firstFullMoon.month), this.firstFullMoon.day);
        let daysSoFar = calendar.rttsDateToDays(calendar.getRttsMonthIndexFromDate(yearNum, monthIndex), dayIndex);

        // If this is before the first full moon, just make the moon full.
        if (firstFullMoonDays > daysSoFar) {
            return this.moonPhaseFromConfig(RoadToTheSkyMoonPhaseIds.default, 1);
        }

        // This is after the first full moon.         
        const daysSinceReferenceMoon = daysSoFar - firstFullMoonDays;

        // Calculate how many moon cycles have passed between the first full moon and this date.
        let totalCycleDaysSoFar = 0;
        let currentCycle = 0;
        for (let i = 0; i < this.cycleLengths.length; i++) {
            if (totalCycleDaysSoFar + this.cycleLengths[i] > daysSinceReferenceMoon) {
                currentCycle = i;
                break;
            } else {
                totalCycleDaysSoFar += this.cycleLengths[i];
            }
            if (i == this.cycleLengths.length - 1) {
                // This is past the last set cycle. Just return the default full moon.
                return this.moonPhaseFromConfig(RoadToTheSkyMoonPhaseIds.default, 1);
            }
        }

        // We have identified which cycle the moon is in. Now we need to find the phase.
        let daysIntoCurrentCycle = daysSoFar - firstFullMoonDays - totalCycleDaysSoFar;
        let currentCycleLength = this.cycleLengths[currentCycle];
        let currentCycleMarkerDays = [4];
        // Figure out where the 'marker' days are (full, halfs, new)
        currentCycleMarkerDays[0] = 0;
        currentCycleMarkerDays[1] = Math.ceil(Math.ceil(currentCycleLength / 2) / 2);
        currentCycleMarkerDays[2] = Math.ceil(currentCycleLength / 2);
        currentCycleMarkerDays[3] = currentCycleLength - Math.floor(Math.floor(currentCycleLength / 2) / 2);
        
        if (currentCycleLength > 10) {
            let i = 1;
        }

        // Find our day
        if (daysIntoCurrentCycle == currentCycleMarkerDays[0]) {
            // full
            return this.moonPhaseFromConfig(RoadToTheSkyMoonPhaseIds.full, 1);
        } else if (daysIntoCurrentCycle == currentCycleMarkerDays[2]) {
            // new
            return this.moonPhaseFromConfig(RoadToTheSkyMoonPhaseIds.new, 1);
        } else if (daysIntoCurrentCycle == currentCycleMarkerDays[1]) {
            // waning half
            return this.moonPhaseFromConfig(RoadToTheSkyMoonPhaseIds.waningH, 1);
        } else if (daysIntoCurrentCycle == currentCycleMarkerDays[3]) {
            // waxing half
            return this.moonPhaseFromConfig(RoadToTheSkyMoonPhaseIds.waxingH, 1);
        } else if (daysIntoCurrentCycle > currentCycleMarkerDays[1] && daysIntoCurrentCycle < currentCycleMarkerDays[2]) {
            // waning crescent
            return this.moonPhaseFromConfig(RoadToTheSkyMoonPhaseIds.waningC, currentCycleMarkerDays[2] - currentCycleMarkerDays[1] - 1)
        } else if (daysIntoCurrentCycle > currentCycleMarkerDays[2] && daysIntoCurrentCycle < currentCycleMarkerDays[3]) {
            // waxing crescent
            return this.moonPhaseFromConfig(RoadToTheSkyMoonPhaseIds.waxingC, currentCycleMarkerDays[3] - currentCycleMarkerDays[2] - 1)
        } else if (daysIntoCurrentCycle > currentCycleMarkerDays[0] && daysIntoCurrentCycle < currentCycleMarkerDays[1]) {
            // waning gibbous
            return this.moonPhaseFromConfig(RoadToTheSkyMoonPhaseIds.waningG, currentCycleMarkerDays[1] - currentCycleMarkerDays[0] - 1)
        } else if (daysIntoCurrentCycle > currentCycleMarkerDays[3]) {
            // waxing gibbous
            return this.moonPhaseFromConfig(RoadToTheSkyMoonPhaseIds.waxingG, currentCycleLength - currentCycleMarkerDays[3] - 1)
        }
        return this.moonPhaseFromConfig(RoadToTheSkyMoonPhaseIds.full, 1);
    }

    /**
     * Gets the moon phase based on the current, selected or visible date
     * @param calendar The year class used to get the year, month and day to use
     * @param property Which property to use when getting the year, month and day. Can be current, selected or visible
     * @param dayToUse The day to use instead of the day associated with the property
     */
    getMoonPhase(calendar: Calendar, property: string = "current", dayToUse: number = 0): SimpleCalendar.MoonPhase {
        property = property.toLowerCase() as "current" | "selected" | "visible";
        const yearNum =
            property === "current"
                ? calendar.year.numericRepresentation
                : property === "selected"
                    ? calendar.year.selectedYear
                    : calendar.year.visibleYear;
        const monthIndex = calendar.getRttsMonthIndex(property) % 12;
        if (monthIndex > -1) {
            const dayIndex = property !== "visible" ? calendar.months[monthIndex].getDayIndex(property) : dayToUse;
            return this.getDateMoonPhase(calendar, yearNum, monthIndex, dayIndex);
        }
        return this.moonPhaseFromConfig(RoadToTheSkyMoonPhaseIds.full, 1);
    }

    pushCycle(calendar: Calendar, phaseLength: number) {
        this.cycleLengths.push(phaseLength);
        this.recalculateFullMoonDates(calendar);
    }

    deleteCycle(calendar: Calendar, cycleIndex: number) {
        this.cycleLengths.splice(cycleIndex, 1)
        this.recalculateFullMoonDates(calendar);
    }

    recalculateFullMoonDates(calendar: Calendar) {
        //console.log("about to recalculate start dates for moon " + this.name);
        this.fullMoonDates = [];
        // If this is the harvest moon, it will always be the first of the month.
        if (this.rttsMoonId == RoadToTheSkyMoonIds.harvest) {
            let monthIndex = 0;
            let yearIndex = this.firstFullMoon.year;
            for (let i = 0; i < this.cycleLengths.length; i++) {
                this.fullMoonDates.push({year: yearIndex, month: monthIndex, day: 0});
                monthIndex++;
                if (monthIndex >= 12) {
                    monthIndex = monthIndex % 12;
                    yearIndex++;
                }
            }
        }
        else {
            let currentDate = calendar.getMinDay();
            for (let i = 0; i < this.cycleLengths.length; i++) {
                this.fullMoonDates.push({year: currentDate.year, month: currentDate.month, day: currentDate.day});
                let resultDate = calendar.getDatePlusDays(currentDate, this.cycleLengths[i]);
                if (resultDate != null) {
                    currentDate = resultDate;
                }
                else {
                    break;
                }
            }
        }

        //console.log("finished! dates are " + JSON.stringify(this.fullMoonDates));
    }


    moonPhaseFromConfig(phaseId: RoadToTheSkyMoonPhaseIds, phaseLength: number): SimpleCalendar.MoonPhase {
        if (phaseId == RoadToTheSkyMoonPhaseIds.full) {
            return {
                name: "Full Moon",
                length: 1,
                singleDay: true,
                icon: Icons.Full
            }
        } else if (phaseId == RoadToTheSkyMoonPhaseIds.new) {
            return {
                name: "New Moon",
                length: 1,
                singleDay: true,
                icon: Icons.NewMoon
            }
        } else if (phaseId == RoadToTheSkyMoonPhaseIds.waningH) {
            return {
                name: "Half Moon",
                length: 1,
                singleDay: true,
                icon: Icons.FirstQuarter
            }
        } else if (phaseId == RoadToTheSkyMoonPhaseIds.waxingH) {
            return {
                name: "Half Moon",
                length: 1,
                singleDay: true,
                icon: Icons.LastQuarter
            }
        } else if (phaseId == RoadToTheSkyMoonPhaseIds.waningG) {
            return {
                name: "Waning Gibbous Moon",
                length: phaseLength,
                singleDay: false,
                icon: Icons.WaningGibbous
            }
        } else if (phaseId == RoadToTheSkyMoonPhaseIds.waningC) {
            return {
                name: "Waning Crescent Moon",
                length: phaseLength,
                singleDay: false,
                icon: Icons.WaningCrescent
            }
        } else if (phaseId == RoadToTheSkyMoonPhaseIds.waxingG) {
            return {
                name: "Waxing Gibbous Moon",
                length: phaseLength,
                singleDay: false,
                icon: Icons.WaxingGibbous
            }
        } else if (phaseId == RoadToTheSkyMoonPhaseIds.waxingC) {
            return {
                name: "Waxing Crescent Moon",
                length: phaseLength,
                singleDay: false,
                icon: Icons.WaxingCrescent
            }
        }
        // Something went wrong. Just return a false full moon.
        return {
            name: "Full Moon",
            length: 1,
            singleDay: false,
            icon: Icons.Full
        }
    }
}

