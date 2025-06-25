import {
    GameWorldTimeIntegrations, Icons,
    RoadToTheSkyMonthConfigs,
    RoadToTheSkyMoonIds,
    RoadToTheSkySeasonConfigs,
    SimpleCalendarHooks,
    TimeKeeperStatus
} from "../../constants";
import Year from "./year";
import Month from "./month";
import {Logger} from "../logging";
import {GameSettings} from "../foundry-interfacing/game-settings";
import {Weekday} from "./weekday";
import Season from "./season";
import Moon from "./moon";
import GeneralSettings from "../configuration/general-settings";
import ConfigurationItemBase from "../configuration/configuration-item-base";
import Renderer from "../renderer";
import {generateUniqueId} from "../utilities/string";
import {DateToTimestamp, DaysBetweenDates, FormatDateTime, RttsToSeconds} from "../utilities/date-time";
import {canUser} from "../utilities/permissions";
import {CalManager, MainApplication, NManager, SC} from "../index";
import TimeKeeper from "../time/time-keeper";
import NoteStub from "../notes/note-stub";
import Time from "../time";
import {deepMerge} from "../utilities/object";
import {Hook} from "../api/hook";
import PF1E from "../systems/pf1e";
import {RoadToTheSkyMoon} from "./moon-rtts";
import RoadToTheSkyMonth from "./month-rtts";
import * as sea from "node:sea";
import {Set} from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/client/pixi/core/interaction/targets";

export default class Calendar extends ConfigurationItemBase {
    /**
     * All the general settings for a calendar
     * @type {GeneralSettings}
     */
    generalSettings: GeneralSettings = new GeneralSettings();
    /**
     * The year class for the calendar
     * @type {Year}
     */
    year: Year;
    /**
     * A list of all the months for this calendar
     */
    months: Month[] = [];
    /**
     * A list of all the RTTS months for this calendar
     */
    rttsMonths: RoadToTheSkyMonth[] = [];
    /**
     * The days that make up a week
     */
    weekdays: Weekday[] = [];
    /**
     * All the seasons for this calendar
     */
    seasons: Season[] = [];
    /**
     * All the RTTS moons for this calendar
     */
    rttsMoons: RoadToTheSkyMoon[] = [];
    /**
     * All the moons for this calendar
     */
    moons: Moon[] = [];
    /**
     * The time object responsible for all time related functionality
     */
    time: Time;
    /**
     * List of all notes in the calendar
     * @type {Array.<Note>}
     */
    public notes: NoteStub[] = [];
    /**
     * List of all categories associated with notes
     * @type{Array.<NoteCategory>}
     */
    public noteCategories: SimpleCalendar.NoteCategory[] = [];
    /**
     * The timekeeper class used for the in game clock
     */
    timeKeeper: TimeKeeper;
    /**
     * If Simple Calendar has initiated a time change
     */
    timeChangeTriggered: boolean = false;
    /**
     * If a combat change has been triggered
     */
    combatChangeTriggered: boolean = false;
    /**
     * RTTS: Start Date is always month 1, 420
     */
    startDate: SimpleCalendar.Date = {year: 420, month: 0, day: 0};

    /**
     * Construct a new Calendar class
     * @param {string} id
     * @param {string} name
     * @param {CalendarData} configuration The configuration object for the calendar
     */
    constructor(id: string, name: string, configuration: SimpleCalendar.CalendarData = { id: "" }) {
        super(name);
        this.id = id || generateUniqueId();
        this.time = new Time();
        this.year = new Year(0);
        
        this.timeKeeper = new TimeKeeper(this.id, this.time.updateFrequency);
        if (Object.keys(configuration).length > 1) {
            this.loadFromSettings(configuration);
        }
    }

    /**
     * Creates a cloned version of the Calendar class
     */
    clone(includeNotes: boolean = true): Calendar {
        const c = new Calendar(this.id, this.name);
        c.id = this.id;
        c.name = this.name;
        c.generalSettings = this.generalSettings.clone();
        c.year = this.year.clone();
        c.rttsMonths = this.rttsMonths.map((m) => {
            return m.clone();
        });
        c.months = this.months.map((m) => {
            return m.clone();
        });
        c.weekdays = this.weekdays.map((w) => {
            return w.clone();
        });
        c.seasons = this.seasons.map((s) => {
            return s.clone();
        });
        c.rttsMoons = this.rttsMoons.map((m) => {
            return m.clone();
        });
        c.moons = this.moons.map((m) => {
            return m.clone();
        });
        c.time = this.time.clone();
        if (includeNotes) {
            //c.notes = this.notes.map(n => n.clone());
            c.noteCategories = this.noteCategories.map((nc) => {
                return { id: nc.id, name: nc.name, textColor: nc.textColor, color: nc.color };
            });
        }
        return c;
    }

    /**
     * Creates a template for the calendar class
     */
    toTemplate(): SimpleCalendar.HandlebarTemplateData.Calendar {
        let sYear = this.year.selectedYear,
            sMonth,
            sDay;

        const currentRttsMonthDay = this.getRttsMonthAndDayIndex();
        const selectedRttsMonthDay = this.getRttsMonthAndDayIndex("selected");
        const visibleRttsMonthDay = this.getRttsMonthAndDayIndex("visible");
        
        //console.log("from calendar toTemplate - visibleRttsMonthDay=" + JSON.stringify(visibleRttsMonthDay));

        if (selectedRttsMonthDay.month !== undefined) {
            sMonth = selectedRttsMonthDay.month % 12;
            sDay = selectedRttsMonthDay.day || 0;
        } else {
            sYear = this.year.numericRepresentation;
            sMonth = (currentRttsMonthDay.month ?? 0) % 12 || 0;
            sDay = currentRttsMonthDay.day || 0;
        }

        const noteCounts = NManager.getNoteCountsForDay(this.id, sYear, sMonth, sDay);
        //console.log("from toTemplate: calendar=" + JSON.stringify(this));
        return {
            ...super.toTemplate(),
            calendarDisplayId: `sc_${this.id}_calendar`,
            clockDisplayId: `sc_${this.id}_clock`,
            currentYear: this.year.toTemplate(),
            id: this.id,
            name: this.name,
            selectedDay: {
                dateDisplay: FormatDateTime(
                    { year: sYear, month: sMonth, day: sDay, hour: 0, minute: 0, seconds: 0 },
                    this.generalSettings.dateFormat.date,
                    this
                ),
                noteCount: noteCounts.count,
                noteReminderCount: noteCounts.reminderCount,
                notes: NManager.getNotesForDay(this.id, sYear, sMonth, sDay)
            },
            visibleDate: { year: this.year.visibleYear, month: ((visibleRttsMonthDay.month || 0) % 12)}
        };
    }

    /**
     * Converts the calendar class to the configuration item to be saved
     */
    toConfig(): SimpleCalendar.CalendarData {
        return <SimpleCalendar.CalendarData>{
            id: this.id,
            name: this.name,
            currentDate: this.getCurrentDate(),
            general: this.generalSettings.toConfig(),
            leapYear: this.year.leapYearRule.toConfig(),
            rttsMonths: this.rttsMonths.map((m) => {
                return m.toConfig();
            }),
            months: this.months.map((m) => {
                return m.toConfig();
            }),
            rttsMoons: this.rttsMoons.map((r) => {
                return r.toConfig();
            }),
            moons: this.moons.map((m) => {
                return m.toConfig();
            }),
            noteCategories: this.noteCategories,
            seasons: this.seasons.map((s) => {
                return s.toConfig();
            }),
            time: this.time.toConfig(),
            weekdays: this.weekdays.map((w) => {
                return w.toConfig();
            }),
            year: this.year.toConfig()
        };
    }

    /**
     * Configures the calendar from a configuration file
     * @param config
     */
    loadFromSettings(config: SimpleCalendar.CalendarData) {
        if (config.id) {
            this.id = config.id;
            this.timeKeeper.calendarId = this.id;
        }
        if (config.name) {
            this.name = config.name;
        }

        if (config.year) {
            this.year.loadFromSettings(config.year);
        } else if (config.yearSettings) {
            this.year.loadFromSettings(config.yearSettings);
        } else {
            Logger.warn(`Invalid year configuration found when loading calendar "${this.name}", setting year to default configuration`);
            this.year = new Year(0);
        }

        // RTTS: Add hardcoded RTTS months
        this.months = [];
        for (let i = 0; i < RoadToTheSkyMonthConfigs.length; i++) {
            this.months.push(new Month(RoadToTheSkyMonthConfigs[i].name, i, 0, 30, 0, 0));
        }
        
        const configWeekdays: SimpleCalendar.WeekdayData[] | undefined = config.weekdays || config.weekdaySettings;
        if (Array.isArray(configWeekdays)) {
            this.weekdays = [];
            for (let i = 0; i < configWeekdays.length; i++) {
                const newW = new Weekday();
                newW.loadFromSettings(configWeekdays[i]);
                this.weekdays.push(newW);
            }
        }

        if (config.leapYear) {
            this.year.leapYearRule.loadFromSettings(config.leapYear);
        } else if (config.leapYearSettings) {
            this.year.leapYearRule.loadFromSettings(config.leapYearSettings);
        }

        if (config.time) {
            this.time.loadFromSettings(config.time);
            this.timeKeeper.updateFrequency = this.time.updateFrequency;
        } else if (config.timeSettings) {
            this.time.loadFromSettings(config.timeSettings);
            this.timeKeeper.updateFrequency = this.time.updateFrequency;
        }

        // RTTS: Add hardcoded RTTS seasons
        this.seasons = [];
        for (let i = 0; i < RoadToTheSkySeasonConfigs.length; i++) {
            let seasonConfig = RoadToTheSkySeasonConfigs[i];
            let season = new Season(seasonConfig.name, seasonConfig.startingMonth, seasonConfig.startingDay);
            season.color = seasonConfig.color;
            season.icon = seasonConfig.icon;
            season.sunriseTime = seasonConfig.sunriseTime;
            season.sunsetTime = seasonConfig.sunsetTime;
            this.seasons.push(season);
        }

        // RTTS: Add hardcoded RTTS moons
        const configRttsMoons: SimpleCalendar.RttsMoonData[] | undefined = config.rttsMoons;
        this.rttsMoons = [
            new RoadToTheSkyMoon(RoadToTheSkyMoonIds.harvest),
            new RoadToTheSkyMoon(RoadToTheSkyMoonIds.lantern),
            new RoadToTheSkyMoon(RoadToTheSkyMoonIds.foxfire),
            new RoadToTheSkyMoon(RoadToTheSkyMoonIds.eye)
        ];
        
        // Load any moons with saved configs
        if (Array.isArray(configRttsMoons)) {
            if (configRttsMoons.length > 0) {
                for (let i = 0; i < configRttsMoons.length; i++) {
                    if (configRttsMoons[i].rttsMoonId == RoadToTheSkyMoonIds.harvest) {
                        this.rttsMoons[0].loadFromSettings(configRttsMoons[i])
                    }
                    if (configRttsMoons[i].rttsMoonId == RoadToTheSkyMoonIds.lantern) {
                        this.rttsMoons[1].loadFromSettings(configRttsMoons[i])
                    }
                    if (configRttsMoons[i].rttsMoonId == RoadToTheSkyMoonIds.foxfire) {
                        this.rttsMoons[2].loadFromSettings(configRttsMoons[i])
                    }
                    if (configRttsMoons[i].rttsMoonId == RoadToTheSkyMoonIds.eye) {
                        this.rttsMoons[3].loadFromSettings(configRttsMoons[i])
                    }
                }
            }
        }

        // RTTS: Populate the RTTS month instances based on the calendar data
        let rttsMonthIndex = 0;
        let yearsSinceStart = 0;
        this.rttsMonths = [];
        for (let i = 0; i < this.rttsMoons[RoadToTheSkyMoonIds.harvest].cycleLengths.length; i++){
            if (rttsMonthIndex >= 12) {
                rttsMonthIndex = rttsMonthIndex & 12;
                yearsSinceStart++;
            }
            this.rttsMonths.push(
                new RoadToTheSkyMonth(
                    rttsMonthIndex,
                    yearsSinceStart,
                    this.rttsMoons[RoadToTheSkyMoonIds.harvest].cycleLengths[i]
                )
            )
            //console.log("pushed new month of length " + this.rttsMoons[RoadToTheSkyMoonIds.harvest].cycleLengths[i]);
        }
        // Push some cycle days
        this.onRttsMonthDeleted();
        
        const configMoons: SimpleCalendar.MoonData[] | undefined = config.moons || config.moonSettings;
        if (Array.isArray(configMoons)) {
            this.moons = [];
            for (let i = 0; i < configMoons.length; i++) {
                const newW = new Moon();
                newW.loadFromSettings(configMoons[i]);
                this.moons.push(newW);
            }
        }

        if (config.general) {
            this.generalSettings.loadFromSettings(config.general);
        } else if (config.generalSettings) {
            this.generalSettings.loadFromSettings(config.generalSettings);
        }

        if (config.noteCategories) {
            this.noteCategories = config.noteCategories;
        }

        if (config.currentDate) {
            let minDay = this.getMinDay();
            this.year.numericRepresentation = Math.max(config.currentDate.year, minDay.year);
            this.year.selectedYear = Math.max(config.currentDate.year, minDay.year);
            this.year.visibleYear = Math.max(config.currentDate.year, minDay.year);

            this.resetRttsMonths("current");
            this.resetRttsMonths("visible");

            if (config.currentDate.month > -1 && config.currentDate.month < this.months.length) {
                this.months[config.currentDate.month].current = true;
                this.months[config.currentDate.month].visible = true;
            } else if (this.months.length) {
                Logger.warn("Saved current month could not be found, perhaps months have changed. Setting current month to the first month");
                this.months[0].current = true;
                this.months[0].visible = true;
                this.months[0].days[0].current = true;
            }
            
            // RTTS month current date setting
            // Set Current RTTS Month and Day

            let rttsMonthIndex = config.currentDate.month + ((Math.max(config.currentDate.year - minDay.year, 0)) * 12);
            // console.log("calculated index is " + rttsMonthIndex);
            if (this.rttsMonths.length >= rttsMonthIndex) {
                this.rttsMonths[rttsMonthIndex].current = true;
                this.rttsMonths[rttsMonthIndex].visible = true;

                if (config.currentDate.day > -1 && config.currentDate.day < this.rttsMonths[rttsMonthIndex].days.length) {
                    this.rttsMonths[rttsMonthIndex].days[config.currentDate.day].current = true;
                } else {
                    Logger.warn(
                        "Saved current day could not be found in this month, perhaps number of days has changed. Setting current day to first day of month"
                    );
                    this.rttsMonths[rttsMonthIndex].days[0].current = true;
                }
            }
            else {
                Logger.warn("Saved current RTTS month could not be found. Setting all to first month.");
                this.months[0].current = true;
                this.months[0].visible = true;
                this.months[0].days[0].current = true;
                this.rttsMonths[0].current = true;
                this.rttsMonths[0].visible = true;
                this.rttsMonths[0].days[0].current = true;
            }
            
            this.time.seconds = config.currentDate.seconds;
            if (this.time.seconds === undefined) {
                this.time.seconds = 0;
            }
            
        } else if (this.months.length) {
            Logger.warn("No current date setting found, setting default current date.");
            this.months[0].current = true;
            this.months[0].visible = true;
            this.months[0].days[0].current = true;
        } else {
            Logger.error("Error setting the current date.");
        }
    }

    /**
     * Gets the current date configuration object
     * @private
     */
    getCurrentDate(): SimpleCalendar.CurrentDateData {
        const monthDayIndex = this.getRttsMonthAndDayIndex();
        return {
            year: this.year.numericRepresentation,
            month: (monthDayIndex.month ?? 0) % 12 || 0,
            day: monthDayIndex.day || 0,
            seconds: this.time.seconds
        };
    }

    /**
     * Gets the date and time for the selected date, or if not date is selected the current date
     */
    getDateTime(): SimpleCalendar.DateTime {
        const dt: SimpleCalendar.DateTime = {
            year: 420,
            month: 0,
            day: 0,
            hour: 0,
            minute: 0,
            seconds: 0
        };
        const selectedMonthDayIndex = this.getRttsMonthAndDayIndex("selected");
        const currentMonthDayIndex = this.getRttsMonthAndDayIndex();
        if (selectedMonthDayIndex.month !== undefined) {
            dt.year = this.year.selectedYear;
            dt.month = selectedMonthDayIndex.month % 12;
            dt.day = selectedMonthDayIndex.day || 0;
        } else {
            dt.year = this.year.numericRepresentation;
            dt.month = (currentMonthDayIndex.month ?? 0) % 12 || 0;
            dt.day = currentMonthDayIndex.day || 0;

            const time = this.time.getCurrentTime();
            dt.hour = time.hour;
            dt.minute = time.minute;
            dt.seconds = time.seconds;
        }
        return dt;
    }

    /**
     * Gets the current season based on the current date
     */
    getCurrentSeason() {
        let monthIndex = this.getRttsMonthIndex("visible");
        if (monthIndex === -1) {
            monthIndex = 0;
        }

        let dayIndex = this.rttsMonths[monthIndex].getDayIndex("selected");
        if (dayIndex === -1) {
            dayIndex = this.rttsMonths[monthIndex].getDayIndex();
            if (dayIndex === -1) {
                dayIndex = 0;
            }
        }
        const season = this.getSeason(monthIndex % 12, dayIndex);
        return {
            name: season.name,
            color: season.color,
            icon: season.icon
        };
    }

    /**
     * Returns the RTTS month, where the passed in setting is true
     * @param [setting='current'] The setting to look for. Can be visible, current or selected
     */
    getRttsMonth(setting: string = "current") {
        const verifiedSetting = setting.toLowerCase() as "visible" | "current" | "selected";
        return this.rttsMonths.find((m) => {
            return m[verifiedSetting];
        });
    }

    /**
     * Returns the index of the month, where the passed in setting is true
     * @param [setting='current'] The setting to look for. Can be visible, current or selected
     */
    getRttsMonthIndex(setting: string = "current") {
        const verifiedSetting = setting.toLowerCase() as "visible" | "current" | "selected";
        return this.rttsMonths.findIndex((m) => {
            return m[verifiedSetting];
        });
    }

    /**
     * Returns the index of the month and index of the day in that month, where the passed in setting is true
     * @param [setting='current'] The setting to look for. Can be visible, current or selected
     */
    getRttsMonthAndDayIndex(setting: string = "current") {
        const verifiedSetting = setting.toLowerCase() as "visible" | "current" | "selected";
        const result: Partial<SimpleCalendar.Date> = {
            month: 0,
            day: 0
        };
        const mIndex = this.rttsMonths.findIndex((m) => {
            return m[verifiedSetting];
        });
        if (mIndex > -1) {
            result.month = mIndex;
            const dIndex = this.rttsMonths[mIndex].getDayIndex(verifiedSetting);
            if (dIndex > -1) {
                result.day = dIndex;
            }
        } else {
            result.month = undefined;
        }
        return result;
    }

    /**
     * Returns the index of the month and index of the day in that month, where the passed in setting is true
     * @param year
     * @param month
     */
    getRttsMonthIndexFromDate(year: number, month: number) {
        let yearsSinceStart = year - this.getMinDay().year;
        return (yearsSinceStart * 12) + month;
    }

    /**
     * Gets the season for the passed in month and day
     * @param monthIndex The index of the month
     * @param dayIndex The day number
     */
    getSeason(monthIndex: number, dayIndex: number) {
        let season = new Season("", 0, 0);
        // console.log("from getSeason: monthIndex=" + monthIndex + ", dayIndex=" + dayIndex);
        // console.log("seasons are:" + JSON.stringify(this.seasons));
        if (dayIndex >= 0 && monthIndex >= 0) {
            // hardcoded values
            if (monthIndex <= 2) {
                season = this.seasons[0];
            }
            else if (monthIndex > 2 && monthIndex <= 5) {
                season = this.seasons[1];
            }
            else if (monthIndex > 5 && monthIndex <= 8) {
                season = this.seasons[2];
            }
            else if (monthIndex > 8 && monthIndex <= 11) {
                season = this.seasons[3];
            }
        }
        // console.log("from getSeason: season=" + JSON.stringify(season));
        return season;
    }

    /**
     * Calculates the sunrise or sunset time for the passed in date, based on the season setup
     * @param year The year of the date
     * @param monthIndex The month object of the date
     * @param dayIndex The day object of the date
     * @param [sunrise=true] If to calculate the sunrise or sunset
     * @param [calculateTimestamp=true] If to add the date timestamp to the sunrise/sunset time
     */
    getSunriseSunsetTime(year: number, monthIndex: number, dayIndex: number, sunrise: boolean = true, calculateTimestamp: boolean = true) {
        // Hardcoded, because why not
        let season = this.getSeason(monthIndex, dayIndex);
        let time = 0;
        if (sunrise) {
            time = season.sunriseTime;
        }
        else {
            time = season.sunsetTime;
        }
        if (calculateTimestamp) {
            return (
                DateToTimestamp({ year: year, month: monthIndex, day: dayIndex, hour: 0, minute: 0, seconds: 0 }, this) +
                time
            );
        } else {
            return time;
        }
    }

    //-------------------------------
    // Date/Time Management
    //-------------------------------

    /**
     * Will take the days of the passed in month and break it into an array of weeks
     * @param rttsMonthIndex
     */
    rttsDaysIntoWeeks(rttsMonthIndex: number): (boolean | SimpleCalendar.HandlebarTemplateData.Day)[][] {
        const weeks = [];
        // console.log("rttsDaysIntoWeeks called with rttsMonthIndex=" + rttsMonthIndex)
        const dayOfWeekOffset = this.rttsMonthStartingDayOfWeek(rttsMonthIndex);
        const days = this.rttsMonths[rttsMonthIndex].getDaysForTemplate();

        if (days.length) {
            const startingWeek = [];
            let dayOffset = 0;
            for (let i = 0; i < 7; i++) {
                if (i < dayOfWeekOffset) {
                    startingWeek.push(false);
                } else {
                    const dayIndex = i - dayOfWeekOffset;
                    if (dayIndex < days.length) {
                        startingWeek.push(days[dayIndex]);
                        dayOffset++;
                    } else {
                        startingWeek.push(false);
                    }
                }
            }
            weeks.push(startingWeek);
            const numWeeks = Math.ceil((days.length - dayOffset) / 7);
            for (let i = 0; i < numWeeks; i++) {
                const w = [];
                for (let d = 0; d < 7; d++) {
                    const dayIndex = dayOffset + i * 7 + d;
                    if (dayIndex < days.length) {
                        w.push(days[dayIndex]);
                    } else {
                        w.push(false);
                    }
                }
                weeks.push(w);
            }
        }
        return weeks;
    }

    /**
     * Calculates the day of the week a passed in day falls on based on its month and year
     * @param rttsMonthIndex
     * @param {number} dayIndex  The day of the month that we want to check
     * @return {number}
     */
    rttsDayOfTheWeek(rttsMonthIndex: number, dayIndex: number): number {
        if (this.weekdays.length) {
            // the min day always starts on weekday index 0
            let daysSoFar = this.rttsDateToDays(
                rttsMonthIndex,
                dayIndex);
            return daysSoFar % 7;
        } else {
            return 0;
        }
    }

    /**
     * Calculates the day of the week the first day of the currently visible month lands on
     * @param {Month} monthIndex The month to get the starting day of the week for
     * @param {number} year The year the check
     * @return {number}
     */
    rttsMonthStartingDayOfWeek(monthIndex: number): number {
        return this.rttsDayOfTheWeek(monthIndex, 0);
    }

    /**
     * Resents the setting for all months and days to false
     * @param {string} [setting='current']
     */
    resetRttsMonths(setting: string = "current") {
        const verifiedSetting = setting.toLowerCase() as "visible" | "current" | "selected";
        //console.log("resetRttsMonths: Resetting " + verifiedSetting);   
        this.rttsMonths.forEach((m) => {
            if (setting !== "visible") {
                m.resetDays(setting);
            }
            m[verifiedSetting] = false;
        });
    }

    /**
     * Set the current date to also be the visible date
     */
    // TODO: Rtts call this if the day that we were set to no longer exists
    setCurrentToVisible() {
        this.year.visibleYear = this.year.numericRepresentation;
        this.resetRttsMonths("visible");
        const curMonth = this.getRttsMonth();
        if (curMonth) {
            curMonth.visible = true;
        }
    }

    rttsDoesDayExist(rttsMonthIndex: number, dayIndex: number): boolean {
        return this.rttsMonths.length > rttsMonthIndex && this.rttsMonths[rttsMonthIndex].numberOfDays > dayIndex;
    }

    doesDayExist(year: number, monthIndex: number, dayIndex: number): boolean {
        let rttsMonthIndex = (year * 12) + monthIndex;
        return this.rttsDoesDayExist(rttsMonthIndex, dayIndex);
    }

    /**
     * Updates the specified setting for the specified month, also handles instances if the new month has 0 day
     * @param rttsMonthIndex
     * @param setting The setting to update, can be 'visible', 'current' or 'selected'
     * @param next If the change moved the calendar forward(true) or back(false) this is used to determine the direction to go if the new month has 0 days
     * @param setDay If to set the months day to a specific one
     */
    rttsUpdateMonth(rttsMonthIndex: number, setting: string, next: boolean, setDay: null | number = null, checkFullMoons = false) {
        const verifiedSetting = setting.toLowerCase() as "visible" | "current" | "selected";

        //Reset all the months settings
        // console.log("rttsUpdateMonth: setting rtts month " + rttsMonthIndex + " setting "  + verifiedSetting);
        
        if (rttsMonthIndex > this.rttsMonths.length - 1) {
            // console.warn("rttsUpdateMonth: Tried to set " + verifiedSetting + " month to rttsIndex " + rttsMonthIndex + ". Month does not exist");
            return;
        }

        // console.log("rttsUpdateMonth 1");
        this.resetRttsMonths(setting);
        this.rttsMonths[rttsMonthIndex][verifiedSetting] = true;

        // If we are adjusting the current date we need to propagate that down to the days of the new month as well
        // We also need to set the visibility of the new month to true
        if (verifiedSetting === "current") {
            // console.log("rttsUpdateMonth 2");
            //Get the current RTTS months current day
            let currentDay: number;

            if (setDay !== null) {
                // console.log("rttsUpdateMonth u3 setDay=" + setDay);
                currentDay = setDay < 0 || this.rttsMonths[rttsMonthIndex].days.length >= setDay ? 0 : setDay;
            } else {
                // console.log("rttsUpdateMonth 4");
                const currentRttsMonthDayIndex = this.getRttsMonthAndDayIndex();
                // console.log("u2 currentRttsMonthDayIndex=" + JSON.stringify(currentRttsMonthDayIndex));
                currentDay = currentRttsMonthDayIndex.day || 0;
            }
            // console.log("rttsUpdateMonth: setting rtts day " + currentDay + " setting "  + verifiedSetting + " month =" + JSON.stringify(this.rttsMonths[rttsMonthIndex].name));
            this.rttsMonths[rttsMonthIndex].updateDay(currentDay, verifiedSetting);
            if (checkFullMoons) {
                this.checkFullMoons();
            }
        }
    }

    /**
     * Changes the number of the currently active year
     * @param amount The amount to change the year by
     * @param setting The month property we are changing. Can be 'visible', 'current' or 'selected'
     */
    changeYear(amount: number, setting: string = "visible") {
        const verifiedSetting = setting.toLowerCase() as "visible" | "current" | "selected";
        // console.log("index change year: about to change " + setting + " year by " + amount);
        if (verifiedSetting === "visible") {
            this.year.visibleYear = this.year.visibleYear + amount;
        } else if (verifiedSetting === "selected") {
            this.year.selectedYear = this.year.selectedYear + amount;
        } else {
            this.year.numericRepresentation = this.year.numericRepresentation + amount;
        }
    }

    /**
     * Changes the current, visible or selected month forward or back one month
     * @param amount If we are moving forward (true) or back (false) one month
     * @param setting The month property we are changing. Can be 'visible', 'current' or 'selected'
     * @param setDay If to set the months day to a specific one
     * @param checkFullMoons
     */
    changeMonth(amount: number, setting: string = "visible", setDay: null | number = null, checkFullMoons = false): void {
        const verifiedSetting = setting.toLowerCase() as "visible" | "current" | "selected";
        const next = amount > 0;
        
        // Get the current date for this setting
        let currentYearIndex: number;
        let currentMonthIndex = this.getRttsMonthIndex(verifiedSetting);
        if (verifiedSetting === "visible") {
            currentYearIndex = this.year.visibleYear;
        } else if (verifiedSetting === "selected") {
            currentYearIndex = this.year.selectedYear;
        } else {
            currentYearIndex = this.year.numericRepresentation;
        }
        
        // console.log("Change month calculation: The current " + verifiedSetting + " month is " + currentYearIndex + "/" + currentMonthIndex % 12 + " and rttsMonthIndex="  + currentMonthIndex); 
        
        // Find out if this date is valid
        let canAddMonths = this.canAddMonths({year: currentYearIndex, month : currentMonthIndex % 12, day: 0}, amount);
        // console.log("Change month calculation: canAddMonths="  + canAddMonths);
        
        if (canAddMonths) {
            // Do we need to change the year as well?
            // console.log("changeMonth: checking if we need to change the year");
            let yearChangeAmount = 0;
            if (next && (currentMonthIndex % 12) + amount >= 12) {
                yearChangeAmount = (this.getMinDay().year + Math.floor((currentMonthIndex + amount) / 12)) - currentYearIndex;
            }
            else if (!next && (currentMonthIndex % 12) + amount < 0) {
                yearChangeAmount = Math.floor(((currentMonthIndex % 12) + amount) / 12);
            }
            if (yearChangeAmount != 0) {
                this.changeYear(yearChangeAmount, verifiedSetting);
            }
            
            // Change the month
            this.rttsUpdateMonth(currentMonthIndex + amount, setting, next, setDay, checkFullMoons);
        }
    }

    /**
     * Changes the current or selected day forward or back one day
     * @param {number} amount The number of days to change, positive forward, negative backwards
     * @param {string} [setting='current'] The day property we are changing. Can be 'current' or 'selected'
     */
    changeDay(amount: number, setting: string = "current") {
        const verifiedSetting = setting.toLowerCase() as "current" | "selected";
        let currentRttsMonth = this.getRttsMonth(verifiedSetting);
        if (currentRttsMonth && amount !== 0) {
            // console.log("changeDay: " + verifiedSetting + " month is" + currentRttsMonth.rttsMonthId)
            const next = amount > 0;
            const currentDayIndex = currentRttsMonth.getDayIndex(verifiedSetting);
            
            if (next && currentDayIndex + amount >= currentRttsMonth.numberOfDays) {
                this.changeMonth(1, verifiedSetting, 0);
                this.changeDay(amount - (currentRttsMonth.numberOfDays - currentDayIndex), verifiedSetting);
            } else if (!next && currentDayIndex + amount < 0) {
                let amountAfterMonthChange = amount + currentDayIndex;
                // TODO bug is here
                this.changeMonth(-1, verifiedSetting);
                currentRttsMonth = this.getRttsMonth(verifiedSetting);
                currentRttsMonth?.changeDay(currentRttsMonth?.numberOfDays + amountAfterMonthChange, false, verifiedSetting);
            } else {
                currentRttsMonth.changeDay(amount, false, verifiedSetting);
            }
            
            this.checkFullMoons();
        }
    }
    
    // Check if we should push a reminder about the moons
    checkFullMoons() {
        let currentDate = this.getCurrentDate();
        // console.log("checkFullMoons: new current date =" + JSON.stringify(currentDate));
        for (let i = 0; i < this.rttsMoons.length; i++) {
            // Lazy, just check the icon
            // console.log(JSON.stringify(this.rttsMoons[i].getDateMoonPhase(this, currentDate.year, currentDate.month, currentDate.day)));
            if (this.rttsMoons[i].getDateMoonPhase(this, currentDate.year, currentDate.month, currentDate.day).icon == Icons.Full) {
                this.rttsMoons[i].pushFullMoonChatMessage(this, false);
            }
        }
    }

    /**
     * Changes the current or selected day by the passed in amount. Adjusting for number of years first
     * @param amount
     * @param setting
     */
    changeDayBulk(amount: number, setting: string = "current") {
        this.changeDay(amount, setting);
    }

    /**
     * Convert a number of days to year, month, day, hour, minute, seconds
     * @param {number} days The days to convert
     */
    daysToDate(days: number): SimpleCalendar.DateTime {
        return this.rttsSecondsToDate(days * 86400);
    }

    /**
     * Convert a number of seconds to year, month, day, hour, minute, seconds
     * @param {number} seconds The seconds to convert
     */
    rttsSecondsToDate(seconds: number): SimpleCalendar.DateTime {
        let daysSinceStart = Math.floor(seconds / 86400);
        // console.log("rttsSecondsToDate=" + daysSinceStart);
        let year = this.getMinDay().year;
        let rttsMonth = 0;
        let daysSoFar = 0;
        
        for (let i = 0; i < this.rttsMonths.length; i++) {
            if (daysSoFar + this.rttsMonths[i].numberOfDays > daysSinceStart) {
                // console.log("adding the days from rtts month " + i + "would exceed days. Breaking with year=" + year + ",rttsMonth=" + rttsMonth, ",daysSoFar=" + daysSoFar);
                break;
            }
            else {
                //console.log("entering the loop. i=" + i);
                if (i > 0 && ((i + 1) % 12) == 0){
                    year++;
                }
                rttsMonth++;
                daysSoFar += this.rttsMonths[i].numberOfDays;
            }
        }
        
        //console.log("rttsSecondsToDate:daysSoFar=" + daysSoFar + ",rttsMonth=" + rttsMonth + ",daysSinceStart=" + daysSinceStart);
        
        let remainingSeconds = seconds % 86400;
        // Add the number of days based on hours
        let day = daysSinceStart - daysSoFar;
        day += Math.floor(Math.floor(remainingSeconds / 3600) / 24);
        
        let hour = Math.floor(remainingSeconds / 3600) % 24;
        let minutes = (remainingSeconds - (hour * 3600)) % 60;
        let sec = remainingSeconds - (hour * 3600) - (minutes * 60);
        
        return {
            year: year,
            month: rttsMonth % 12,
            day: day,
            hour: hour,
            minute: minutes,
            seconds: sec
        };
    }

    /**
     * Converts current date into seconds
     */
    public toSeconds() {
        const rttsMonthDay = this.getRttsMonthAndDayIndex();
        return RttsToSeconds(this, rttsMonthDay.month || 0, rttsMonthDay.day || 0, true);
    }

    public changeDateTime(interval: SimpleCalendar.DateTimeParts, options: SimpleCalendar.DateChangeOptions = {}) {
        options = deepMerge({}, { updateMonth: true, updateApp: true, save: true, sync: true, showWarning: false }, options);
        if (canUser((<Game>game).user, SC.globalConfiguration.permissions.changeDateTime)) {
            const initialTimestamp = this.toSeconds();
            
            let change = false;
            
            if (interval.year) {
                this.changeYear(interval.year, "current");
                // console.log("timekeeper: 1");
                change = true;
            }
            if (interval.month) {
                this.changeMonth(interval.month, "current");
                // console.log("timekeeper: 2");
                change = true;
            }
            if (interval.day) {
                this.changeDay(interval.day, "current");
                // console.log("timekeeper: 3");
                change = true;
            }
            if (interval.hour || interval.minute || interval.seconds) {
                const dayChange = this.time.changeTime(interval.hour, interval.minute, interval.seconds);
                // console.log("timekeeper: day change=" + dayChange);
                if (dayChange !== 0) {
                    this.changeDay(dayChange);
                }
                change = true;
            }

            if (change) {
                // Check if the new time is valid.
                let newCurrentDate = this.getCurrentDate();
                let minDate = this.getMinDay();
                let maxDate = this.getMaxDay();
                if (newCurrentDate.year > maxDate.year ||
                    (newCurrentDate.year == maxDate.year && newCurrentDate.month > maxDate.month) ||
                    (newCurrentDate.year == maxDate.year && newCurrentDate.month == maxDate.month && newCurrentDate.day == maxDate.day)) {
                    // console.log("timekeeper: past the max day!");
                    if (this.timeKeeper.getStatus() != TimeKeeperStatus.Stopped) {
                        // console.log("emitting an event...!");
                        this.timeKeeper.setStatus(TimeKeeperStatus.Stopped);
                    }
                    this.setDateTime({year: maxDate.year, month: maxDate.month, day: maxDate.day, hour: 23, minute: 59, seconds: 59});
                }
                else if (newCurrentDate.year < minDate.year) {
                    // console.log("timekeeper: past the min day!");
                    if (this.timeKeeper.getStatus() != TimeKeeperStatus.Stopped) {
                        this.timeKeeper.setStatus(TimeKeeperStatus.Stopped);
                    }
                    this.setDateTime(minDate);
                }
                
                
                if (CalManager.isActiveCalendar(this.id)) {
                    const changeInSeconds = this.toSeconds() - initialTimestamp;
                    Hook.emit(SimpleCalendarHooks.DateTimeChange, this, changeInSeconds);

                    if (!options.fromCalSync && CalManager.syncWithAllCalendars && !isNaN(initialTimestamp)) {
                        CalManager.syncWithCalendars({ seconds: changeInSeconds });
                    }
                }

                if (options.save) {
                    CalManager.saveCalendars().catch(Logger.error);
                }
                if (options.sync) {
                    this.syncTime().catch(Logger.error);
                }
                if (options.updateApp) {
                    MainApplication.updateApp();
                }
            }
            return true;
        } else if (options.showWarning) {
            GameSettings.UiNotification(GameSettings.Localize("FSC.Warn.Macros.GMUpdate"), "warn");
        }
        return false;
    }

    public setDateTime(date: SimpleCalendar.DateTimeParts, options: SimpleCalendar.DateChangeOptions = {}) {
        options = deepMerge(
            {},
            { updateMonth: true, updateApp: true, save: true, sync: true, showWarning: false, bypassPermissionCheck: false },
            options
        );
        if (canUser((<Game>game).user, SC.globalConfiguration.permissions.changeDateTime) || options.bypassPermissionCheck) {
            const initialTimestamp = this.toSeconds();

            const processedDate: SimpleCalendar.DateTime = {
                year: date.year || 0,
                month: date.month || 0,
                day: date.day || 0,
                hour: date.hour || 0,
                minute: date.minute || 0,
                seconds: date.seconds || 0
            };
            const rttsMonthDayIndex = this.getRttsMonthAndDayIndex();
            const currentTime = this.time.getCurrentTime();
            if (date.seconds === undefined) {
                processedDate.seconds = currentTime.seconds;
            }
            if (date.minute === undefined) {
                processedDate.minute = currentTime.minute;
            }
            if (date.hour === undefined) {
                processedDate.hour = currentTime.hour;
            }
            if (date.year === undefined) {
                processedDate.year = this.year.numericRepresentation;
            }
            if (date.month === undefined) {
                processedDate.month = (rttsMonthDayIndex.month ?? 0) % 12|| 0;
            }
            if (date.day === undefined) {
                processedDate.day = rttsMonthDayIndex.day || 0;
            }
            
            let checkFullMoons = !options.suppressFullMoonNotification;
            this.updateTime(processedDate, checkFullMoons);

            const changeInSeconds = this.toSeconds() - initialTimestamp;

            if (CalManager.isActiveCalendar(this.id)) {
                Hook.emit(SimpleCalendarHooks.DateTimeChange, this, changeInSeconds);
            }

            if (!options.fromCalSync && CalManager.syncWithAllCalendars && !isNaN(initialTimestamp)) {
                CalManager.syncWithCalendars({ seconds: changeInSeconds });
            }
            if (options.save) {
                CalManager.saveCalendars().catch(Logger.error);
            }
            if (options.sync) {
                this.syncTime().catch(Logger.error);
            }
            if (options.updateApp) {
                MainApplication.updateApp();
            }
            return true;
        } else if (options.showWarning) {
            GameSettings.UiNotification(GameSettings.Localize("FSC.Warn.Macros.GMUpdate"), "warn");
        }
        return false;
    }

    /**
     * Sets the current game world time to match what our current time is
     */
    async syncTime(force: boolean = false) {
        let totalSeconds = NaN;
        // Only if the time tracking rules are set to self or mixed
        if (
            canUser((<Game>game).user, SC.globalConfiguration.permissions.changeDateTime) &&
            (this.generalSettings.gameWorldTimeIntegration === GameWorldTimeIntegrations.Self ||
                this.generalSettings.gameWorldTimeIntegration === GameWorldTimeIntegrations.Mixed)
        ) {
            totalSeconds = this.toSeconds();
            // If the calculated seconds are different from what is set in the game world time, update the game world time to match sc's time
            if (totalSeconds !== (<Game>game).time.worldTime || force) {
                //Let the local functions know that we already updated this time
                this.timeChangeTriggered = true;
                //Set the world time, this will trigger the setFromTime function on all connected players when the updateWorldTime hook is triggered
                if (GameSettings.IsGm()) {
                    await this.time.setWorldTime(totalSeconds);
                }
            }
        }
    }

    /**
     * Sets the simple calendars year, month, day and time from a passed in number of seconds
     * @param {number} newTime The new time represented by seconds
     * @param {number} changeAmount The amount that the time has changed by
     */
    setFromTime(newTime: number, changeAmount: number) {
        if (changeAmount !== 0) {
            // If the tracking rules are for self or mixed and the clock is running then we make the change.
            if (
                (this.generalSettings.gameWorldTimeIntegration === GameWorldTimeIntegrations.Self ||
                    this.generalSettings.gameWorldTimeIntegration === GameWorldTimeIntegrations.Mixed) &&
                this.timeKeeper.getStatus() === TimeKeeperStatus.Started
            ) {
                //If we didn't request the change (we are running the clock) we need to update the internal time to match the new world time
                if (!this.timeChangeTriggered) {
                    const parsedDate = this.rttsSecondsToDate(newTime);
                    this.setDateTime(parsedDate, {
                        updateApp: this.time.updateFrequency * this.time.gameTimeRatio !== changeAmount,
                        sync: false,
                        save: false,
                        bypassPermissionCheck: true
                    });
                    Renderer.Clock.UpdateListener(`sc_${this.id}_clock`, this.timeKeeper.getStatus());
                }
            }
            // If the tracking rules are for self only, and we requested the change OR the change came from a combat turn change
            else if (
                (this.generalSettings.gameWorldTimeIntegration === GameWorldTimeIntegrations.Self ||
                    this.generalSettings.gameWorldTimeIntegration === GameWorldTimeIntegrations.Mixed) &&
                (this.timeChangeTriggered || this.combatChangeTriggered)
            ) {
                //If we didn't request the change (from a combat change) we need to update the internal time to match the new world time
                if (!this.timeChangeTriggered) {
                    const parsedDate = this.rttsSecondsToDate(newTime);
                    // If the current player is the GM then we need to save this new value to the database
                    // Since the current date is updated this will trigger an update on all players as well
                    this.setDateTime(parsedDate, { updateApp: false, sync: false, save: GameSettings.IsGm() && SC.primary });
                }
            }
            // If we didn't (locally) request this change then parse the new time into years, months, days and seconds and set those values
            // This covers other modules/built-in features updating the world time and Simple Calendar updating to reflect those changes
            else if (
                (this.generalSettings.gameWorldTimeIntegration === GameWorldTimeIntegrations.ThirdParty ||
                    this.generalSettings.gameWorldTimeIntegration === GameWorldTimeIntegrations.Mixed) &&
                !this.timeChangeTriggered
            ) {
                const parsedDate = this.rttsSecondsToDate(newTime);
                // If the current player is the GM then we need to save this new value to the database
                // Since the current date is updated this will trigger an update on all players as well
                this.setDateTime(parsedDate, { updateApp: false, sync: false, save: GameSettings.IsGm() && SC.primary });
            }
        }
        this.timeChangeTriggered = false;
        this.combatChangeTriggered = false;
    }

    /**
     * If we have determined that the system does not change the world time when a combat round is changed we run this function to update the time by the set amount.
     * @param {Combat} combat The current active combat
     */
    processOwnCombatRoundTime(combat: Combat) {
        const roundSeconds = SC.globalConfiguration.secondsInCombatRound;
        let roundsPassed = 1;

        if (Object.prototype.hasOwnProperty.call(combat, "previous") && combat["previous"].round) {
            roundsPassed = combat.round - combat["previous"].round;
        } else if (PF1E.isPF1E) {
            roundsPassed = 0;
        }
        if (roundSeconds !== 0 && roundsPassed !== 0) {
            // If the current player is the GM then we need to save this new value to the database
            // Since the current date is updated this will trigger an update on all players as well
            this.changeDateTime({ seconds: roundSeconds * roundsPassed }, { updateApp: false, sync: true, save: GameSettings.IsGm() && SC.primary });
        }
    }

    /**
     * Updates the year's data with passed in date information
     * @param {DateTimeParts} parsedDate Interface that contains all of the individual parts of a date and time
     * @param checkFullMoons
     */
    updateTime(parsedDate: SimpleCalendar.DateTime, checkFullMoons : boolean = true) {
        // console.log("updateTime called with " + JSON.stringify(parsedDate));
        const rttsMonthIndex = this.getRttsMonthIndexFromDate(parsedDate.year, parsedDate.month);
        const currentDate = this.getCurrentDate();
        this.year.numericRepresentation = parsedDate.year;
        // console.log("updateTime: about to call rttsUpdateMonth");
        this.rttsUpdateMonth(rttsMonthIndex, "current", true);
        this.rttsMonths[rttsMonthIndex].updateDay(parsedDate.day);
        this.time.setTime(parsedDate.hour, parsedDate.minute, parsedDate.seconds);
        
        if (!(currentDate.day === parsedDate.day && currentDate.month === parsedDate.month && currentDate.year === parsedDate.year) && checkFullMoons) {
            this.checkFullMoons();
        }
    }
    
    // RTTS: Get the minimum day to display
    public getMinDay(): SimpleCalendar.Date {
        return this.startDate;
    }

    // RTTS: Get the maximum day to display
    public getMaxDay(): SimpleCalendar.Date {
        let monthsSinceStart = this.rttsMoons[RoadToTheSkyMoonIds.harvest].cycleLengths.length;
        let yearsSinceStart = Math.floor(monthsSinceStart/12);
        let remainder = monthsSinceStart % 12;
        
        return {
            year: this.startDate.year + yearsSinceStart,
            month: this.startDate.month + remainder - 1,
            day: this.rttsMoons[RoadToTheSkyMoonIds.harvest].cycleLengths[monthsSinceStart - 1] - 1
        }
    }

    // RTTS: will adding a month make this date invalid?
    public canAddMonths(date: SimpleCalendar.Date, amount: number) {
        // console.log("index canAddMonths: date=" + JSON.stringify(date) + ",amount=" + amount)
        if (amount > 0) {
            let maxDay = this.getMaxDay();
            if (date.year > maxDay.year) {
                return false;
            }
            else if (maxDay.year == date.year && date.month + amount > maxDay.month) {
                return false;
            }
        }
        else if (amount < 0) {
            if (date.year == 420 && date.month + amount < 0) {
                return false;
            }
        }
        return true;
    }

    /**
     * Converts the passed in date to the number of days that make up that date from the Road to the Sky min day
     * @param rttsMonthIndex
     * @param dayIndex The day to convert
     */
    rttsDateToDays(rttsMonthIndex: number, dayIndex: number) {
        if (rttsMonthIndex < 0) {
            rttsMonthIndex = 0;
        } else if (rttsMonthIndex >= this.rttsMonths.length) {
            rttsMonthIndex = this.months.length - 1;
        }

        let daysIntoMonth = dayIndex;
        let daysSoFar = 0;
        for (let i = 0; i < rttsMonthIndex && i < this.rttsMoons[RoadToTheSkyMoonIds.harvest].cycleLengths.length; i++) {
            daysSoFar += this.rttsMoons[RoadToTheSkyMoonIds.harvest].cycleLengths[i];
        }
        
        daysSoFar += daysIntoMonth;
        return daysSoFar;
    }

    /**
     * Returns a date if the number of days are added, or nil if the day is not set.
     */
    getDatePlusDays(date: SimpleCalendar.Date, numDays: number) {
        let dateInDays = this.getDateInDays(date);
        if (dateInDays < 0) {
            return null;
        }
        else {
            let newDateInDays = dateInDays + numDays;
            return this.getDaysAsDate(newDateInDays);
        }
    }
    
    // Convert a date to the number of days since the min day
    getDateInDays(date: SimpleCalendar.Date) : number {
        let minDay = this.getMinDay();
        let monthsToAdd = ((date.year - minDay.year) * 12) + date.month;
        let daysSoFar = 0;
        for (let i = 0; i < monthsToAdd; i++) {
            if (i >= this.rttsMonths.length) {
                return -1;
            }
            else {
                daysSoFar += this.rttsMonths[i].numberOfDays;
            }
        }
        daysSoFar += date.day;
        return daysSoFar;
    }

    // Convert a number of days since the min day to a date, or nil if the date is not set
    getDaysAsDate(numDays: number) {
        let daysLeft = numDays;
        let rttsMonthIndex = 0;
        for (let i = 0; i < this.rttsMonths.length; i++) {
            if (daysLeft < this.rttsMonths[i].numberOfDays) {
                break;
            }
            else {
                daysLeft -= this.rttsMonths[i].numberOfDays;
                rttsMonthIndex++;
            }
        }
        // If the date is not set, return nil
        if (!this.rttsDoesDayExist(rttsMonthIndex, daysLeft)) {
            return null;
        }
        else {
            let minDay = this.getMinDay();
            return {
                year: minDay.year + Math.floor(rttsMonthIndex / 12),
                month: rttsMonthIndex % 12,
                day: daysLeft
            }
        }
    }

    /**
     * Reassigns the names of RTTS months
     */
    onRttsMonthDeleted() {
        let m = 0;
        for (let i = 0; i < this.rttsMonths.length; i++) {
            if (m >= 12) {
                m = m % 12;
            }
            let rm = this.rttsMonths[i];
            rm.rttsMonthId = m;
            rm.name = RoadToTheSkyMonthConfigs[m].name;
            rm.description = RoadToTheSkyMonthConfigs[m].description;
            rm.numericRepresentation = RoadToTheSkyMonthConfigs[m].numericRepresentation;
        }
        for (let j = 0; j < this.rttsMoons.length; j++) {
            this.rttsMoons[j].recalculateFullMoonDates(this);
        }
    }
}
