import Day from "./day";
import ConfigurationItemBase from "../configuration/configuration-item-base";
import Calendar from "./index";
import {RoadToTheSkyMonthConfigs, RoadToTheSkyMonthIds} from "../../constants";

/**
 * Class representing a month in Road to the Sky. This is an instance of a certain month in a certain year. 
 */
export default class RoadToTheSkyMonth extends ConfigurationItemBase {
    /**
     * Which of the twelve RTTS months this is
     */
    rttsMonthId: RoadToTheSkyMonthIds = RoadToTheSkyMonthIds.dew;
    /**
     * A list of all the days in this month
     */
    days: Day[] = [];
    /**
     * The number of days for this month
     */
    numberOfDays: number = 0;
    /**
     * If this month is the current month
     */
    current: boolean = false;
    /**
     * If this month is the current month that is visible
     */
    visible: boolean = false;
    /**
     * If this month is the selected month
     */
    selected: boolean = false;

    /**
     * Month class constructor
     * @param rttsMonthId
     * @param yearsSinceStart
     * @param rttsMonthId
     * @param yearsSinceStart
     * @param numberOfDays The number of days in this month
     */
    constructor(
        rttsMonthId: RoadToTheSkyMonthIds = RoadToTheSkyMonthIds.dew,
        yearsSinceStart: number = 0,
        numberOfDays: number = 0,
    ) {
        super(RoadToTheSkyMonthConfigs[rttsMonthId].name, rttsMonthId);
        this.rttsMonthId = rttsMonthId;
        this.name = RoadToTheSkyMonthConfigs[rttsMonthId].name;
        this.abbreviation = this.name.substring(0, 3);
        this.numberOfDays = numberOfDays;
        this.populateDays(this.numberOfDays);
    }

    /**
     * Adds day objects to the days list, so it totals the number of days in the month
     * @param {number} numberOfDays The number of days to create
     * @param {number|null} currentDay The currently selected day
     */
    public populateDays(numberOfDays: number, currentDay: number | null = null): void {
        for (let i = 1; i <= numberOfDays; i++) {
            const d = new Day(i);
            if (i === currentDay) {
                d.current = true;
            }
            this.days.push(d);
        }
    }

    /**
     * Returns the configuration data for the month
     */
    toConfig(): SimpleCalendar.RttsMonthData {
        return {
            id: this.id,
            rttsMonthId: this.rttsMonthId,
            name: this.name,
            description: this.description,
            abbreviation: this.abbreviation,
            numberOfDays: this.numberOfDays
        };
    }

    /**
     * Creates a RTTS month template to be used when rendering the month in HTML
     * @param calendar The year object
     */
    toTemplate(calendar: Calendar | null = null): SimpleCalendar.HandlebarTemplateData.RttsMonth {
        return {
            ...super.toTemplate(),
            abbreviation: this.abbreviation,
            name: this.name,
            numericRepresentation: this.numericRepresentation,
            showAdvanced: this.showAdvanced,
            current: this.current,
            visible: this.visible,
            selected: this.selected,
            days: this.getDaysForTemplate(),
            numberOfDays: this.numberOfDays,
        };
    }

    /**
     * Creates a new RTTS month object with the exact same settings as this month
     * @return {RttsMonth}
     */
    clone(): RoadToTheSkyMonth {
        const m = new RoadToTheSkyMonth(this.rttsMonthId, this.numberOfDays);
        m.id = this.id;
        m.name = this.name;
        m.description = this.description;
        m.abbreviation = this.abbreviation;
        m.current = this.current;
        m.selected = this.selected;
        m.visible = this.visible;
        m.days = this.days.map((d) => {
            return d.clone();
        });
        m.showAdvanced = this.showAdvanced;
        return m;
    }

    /**
     * Loads the RTTS month data from the config object.
     * @param {RttsMonthData} config The configuration object for this class
     */
    loadFromSettings(config: SimpleCalendar.RttsMonthData) {
        if (config && Object.keys(config).length) {
            super.loadFromSettings(config);
            this.rttsMonthId = config.rttsMonthId;
            this.numberOfDays = parseInt(config.numberOfDays.toString());
            if (Object.prototype.hasOwnProperty.call(config, "abbreviation")) {
                this.abbreviation = config.abbreviation;
            } else {
                this.abbreviation = this.name.substring(0, 3);
            }
            this.days = [];
            this.populateDays(this.numberOfDays);
        }
    }

    /**
     * Gets the day that represents that passed in setting, or undefined if no day represents the setting
     * @param {string} [setting='current'] The day setting to check against. Valid options are 'current' or 'selected'
     */
    getDay(setting: string = "current"): Day | undefined {
        const verifiedSetting = setting.toLowerCase() as "current" | "selected";
        return this.days.find((d) => {
            return d[verifiedSetting];
        });
    }

    getDayIndex(setting: string = "current"): number {
        const verifiedSetting = setting.toLowerCase() as "current" | "selected";
        return this.days.findIndex((d) => {
            return d[verifiedSetting];
        });
    }

    /**
     * Gets a list of all days template objects
     * @param {boolean} [isLeapYear=false] If the year is a leap year
     */
    getDaysForTemplate(isLeapYear: boolean = false): SimpleCalendar.HandlebarTemplateData.Day[] {
        return this.days.map((d) => {
            return d.toTemplate();
        });
    }

    /**
     * Changes the day to either the current or selected day
     * @param {number} amount The number of days to change, positive forward, negative backwards
     * @param {boolean} [isLeapYear=false] If the year this month is apart of is a leap year
     * @param {string} [setting='current'] What setting on the day object to change
     */
    changeDay(amount: number, isLeapYear: boolean = false, setting: string = "current") {
        const targetDayIndex = this.getDayIndex(setting);
        console.log("changeDay targetDayIndex=" + targetDayIndex);
        let changeAmount = 0;
        if (targetDayIndex > -1) {
            const newIndex = targetDayIndex + amount;
            if ((amount > 0 && newIndex >= this.numberOfDays) || (amount < 0 && newIndex < 0) || newIndex < 0) {
                this.resetDays(setting);
                changeAmount = amount > 0 ? 1 : -1;
            } else {
                this.updateDay(newIndex, setting);
            }
        }
        return changeAmount;
    }

    /**
     * Resets the passed in setting for all days of the month
     * @param {string} [setting='current'] The setting on the day to reset. Can be either current or selected
     */
    resetDays(setting: string = "current") {
        const verifiedSetting = setting.toLowerCase() as "current" | "selected";
        this.days.forEach((d) => {
            d[verifiedSetting] = false;
        });
    }

    /**
     * Updates the setting for the day to true
     * @param {number} dayIndex The Index of the day to update, -1 is for the last day of the month
     * @param {string} [setting='current'] The setting on the day to update. Can be either current or selected
     */
    updateDay(dayIndex: number, setting: string = "current") {
        const verifiedSetting = setting.toLowerCase() as "current" | "selected";
        this.resetDays(setting);
        if (dayIndex < 0 || dayIndex >= this.numberOfDays) {
            this.days[0][verifiedSetting] = true;
        } else if (this.days[dayIndex]) {
            this.days[dayIndex][verifiedSetting] = true;
        }
    }
}
