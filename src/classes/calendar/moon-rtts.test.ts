/**
 * @jest-environment jsdom
 */
import "../../../__mocks__/index";
import { jest, beforeEach, describe, expect, test } from "@jest/globals";
import {Icons, PredefinedCalendars, RoadToTheSkyMoonConfigs, RoadToTheSkyMoonIds} from "../../constants";
import { CalManager, updateCalManager, updateNManager } from "../index";
import CalendarManager from "./calendar-manager";
import Calendar from "./index";
import PredefinedCalendar from "../configuration/predefined-calendar";
import fetchMock from "jest-fetch-mock";
import NoteManager from "../notes/note-manager";

fetchMock.enableMocks();
describe("RTTS Moon Tests", () => {
    let tCal: Calendar;

    beforeEach(async () => {
        fetchMock.resetMocks();
        fetchMock.mockOnce(
            `{"calendar":{"currentDate":{"year":2022,"month":2,"day":28,"seconds":127},"general":{"gameWorldTimeIntegration":"mixed","showClock":true,"noteDefaultVisibility":false,"postNoteRemindersOnFoundryLoad":true,"pf2eSync":true,"dateFormat":{"date":"MMMM DD, YYYY","time":"HH:mm:ss","monthYear":"MMMM YAYYYYYZ"}},"leapYear":{"rule":"gregorian","customMod":0},"months":[{"name":"January","abbreviation":"Jan","numericRepresentation":1,"numericRepresentationOffset":0,"numberOfDays":31,"numberOfLeapYearDays":31,"intercalary":false,"intercalaryInclude":false,"startingWeekday":null},{"name":"February","abbreviation":"Feb","numericRepresentation":2,"numericRepresentationOffset":0,"numberOfDays":28,"numberOfLeapYearDays":29,"intercalary":false,"intercalaryInclude":false,"startingWeekday":null},{"name":"March","abbreviation":"Mar","numericRepresentation":3,"numericRepresentationOffset":0,"numberOfDays":31,"numberOfLeapYearDays":31,"intercalary":false,"intercalaryInclude":false,"startingWeekday":null},{"name":"April","abbreviation":"Apr","numericRepresentation":4,"numericRepresentationOffset":0,"numberOfDays":30,"numberOfLeapYearDays":30,"intercalary":false,"intercalaryInclude":false,"startingWeekday":null},{"name":"May","abbreviation":"May","numericRepresentation":5,"numericRepresentationOffset":0,"numberOfDays":31,"numberOfLeapYearDays":31,"intercalary":false,"intercalaryInclude":false,"startingWeekday":null},{"name":"June","abbreviation":"Jun","numericRepresentation":6,"numericRepresentationOffset":0,"numberOfDays":30,"numberOfLeapYearDays":30,"intercalary":false,"intercalaryInclude":false,"startingWeekday":null},{"name":"July","abbreviation":"Jul","numericRepresentation":7,"numericRepresentationOffset":0,"numberOfDays":31,"numberOfLeapYearDays":31,"intercalary":false,"intercalaryInclude":false,"startingWeekday":null},{"name":"August","abbreviation":"Aug","numericRepresentation":8,"numericRepresentationOffset":0,"numberOfDays":31,"numberOfLeapYearDays":31,"intercalary":false,"intercalaryInclude":false,"startingWeekday":null},{"name":"September","abbreviation":"Sep","numericRepresentation":9,"numericRepresentationOffset":0,"numberOfDays":30,"numberOfLeapYearDays":30,"intercalary":false,"intercalaryInclude":false,"startingWeekday":null},{"name":"October","abbreviation":"Oct","numericRepresentation":10,"numericRepresentationOffset":0,"numberOfDays":31,"numberOfLeapYearDays":31,"intercalary":false,"intercalaryInclude":false,"startingWeekday":null},{"name":"November","abbreviation":"Nov","numericRepresentation":11,"numericRepresentationOffset":0,"numberOfDays":30,"numberOfLeapYearDays":30,"intercalary":false,"intercalaryInclude":false,"startingWeekday":null},{"name":"December","abbreviation":"Dec","numericRepresentation":12,"numericRepresentationOffset":0,"numberOfDays":31,"numberOfLeapYearDays":31,"intercalary":false,"intercalaryInclude":false,"startingWeekday":null}],"moons":[{"name":"Moon","cycleLength":29.53059,"firstNewMoon":{"yearReset":"none","yearX":0,"year":2000,"month":1,"day":5},"phases":[{"name":"New Moon","length":1,"icon":"new","singleDay":true},{"name":"Waxing Crescent","length":6.38265,"icon":"waxing-crescent","singleDay":false},{"name":"First Quarter","length":1,"icon":"first-quarter","singleDay":true},{"name":"Waxing Gibbous","length":6.38265,"icon":"waxing-gibbous","singleDay":false},{"name":"Full Moon","length":1,"icon":"full","singleDay":true},{"name":"Waning Gibbous","length":6.38265,"icon":"waning-gibbous","singleDay":false},{"name":"Last Quarter","length":1,"icon":"last-quarter","singleDay":true},{"name":"Waning Crescent","length":6.38265,"icon":"waning-crescent","singleDay":false}],"color":"#ffffff","cycleDayAdjust":0.5}],"noteCategories":[{"name":"Holiday","textColor":"#FFFFFF","color":"#148e94"}],"seasons":[{"name":"Spring","startingMonth":2,"startingDay":19,"color":"#46b946","icon":"spring","sunriseTime":21600,"sunsetTime":64800},{"name":"Summer","startingMonth":5,"startingDay":19,"color":"#e0c40b","icon":"summer","sunriseTime":21600,"sunsetTime":64800},{"name":"Fall","startingMonth":8,"startingDay":21,"color":"#ff8e47","icon":"fall","sunriseTime":21600,"sunsetTime":64800},{"name":"Winter","startingMonth":11,"startingDay":20,"color":"#479dff","icon":"winter","sunriseTime":21600,"sunsetTime":64800}],"time":{"hoursInDay":24,"minutesInHour":60,"secondsInMinute":60,"gameTimeRatio":1,"unifyGameAndClockPause":false,"updateFrequency":1},"weekdays":[{"abbreviation":"Su","name":"Sunday","numericRepresentation":1},{"abbreviation":"Mo","name":"Monday","numericRepresentation":2},{"abbreviation":"Tu","name":"Tuesday","numericRepresentation":3},{"abbreviation":"We","name":"Wednesday","numericRepresentation":4},{"abbreviation":"Th","name":"Thursday","numericRepresentation":5},{"abbreviation":"Fr","name":"Friday","numericRepresentation":6},{"abbreviation":"Sa","name":"Saturday","numericRepresentation":7}],"year":{"numericRepresentation":2022,"prefix":"","postfix":"","showWeekdayHeadings":true,"firstWeekday":4,"yearZero":1970,"yearNames":[],"yearNamingRule":"default","yearNamesStart":0}}}`
        );
        updateCalManager(new CalendarManager());
        updateNManager(new NoteManager());
        tCal = new Calendar("", "");
        jest.spyOn(CalManager, "getActiveCalendar").mockImplementation(() => {
            return tCal;
        });
        await PredefinedCalendar.setToPredefined(tCal, PredefinedCalendars.Gregorian);
    });

    test("Initialization", () => {
        expect(Object.keys(tCal.rttsMoons).length).toBe(4); //Make sure 4 moons are added
        for (let i = 0; i < tCal.rttsMoons.length; i++) {
            let rttsMoonConfig = RoadToTheSkyMoonConfigs[i];
            expect(tCal.rttsMoons[i].name).toBe(rttsMoonConfig.name);
            expect(RoadToTheSkyMoonIds[tCal.rttsMoons[i].rttsMoonId]).toBe(rttsMoonConfig.id);
            expect(tCal.rttsMoons[i].color).toBe(rttsMoonConfig.color);
        }
    });
    
    test("Clone", () => {
        for (let i = 0; i < tCal.rttsMoons.length; i++) {
            expect(tCal.rttsMoons[i].clone()).toStrictEqual(tCal.rttsMoons[i]);
        }
     });
    
    test("To Config", () => {
        for (let i = 0; i < tCal.rttsMoons.length; i++) {
            let c = tCal.rttsMoons[i].toConfig();
            expect(Object.keys(c).length).toBe(6); //Make sure no new properties have been added
            expect(c.name).toBe(tCal.rttsMoons[i].name);
        }
    });
        
    test("To Template", () => {
        for (let i = 0; i < tCal.rttsMoons.length; i++) {
            let c = tCal.rttsMoons[i].toTemplate();
            expect(Object.keys(c).length).toBe(9); //Make sure no new properties have been added
            expect(c.name).toBe(tCal.rttsMoons[i].name);
            expect(c.firstFullMoon).toStrictEqual(tCal.rttsMoons[i].firstFullMoon);
            expect(c.cycleLengths.length).toBe(i == 0 ? 2: 1);
            expect(c.cycleLengths[0]).toBe(i == 0 ? 30: 1);
            expect(c.color).toBe(tCal.rttsMoons[i].color);
        }
    });
    
    //test("Update Phase Length", () => {
    //    m.updatePhaseLength();
    //    expect(m.phases[0].length).toBe(1);
//
    //    m.phases.push({ name: "p2", icon: Icons.NewMoon, length: 0, singleDay: false });
    //    m.updatePhaseLength();
    //    expect(m.phases[0].length).toBe(1);
    //    expect(m.phases[1].length).toBe(5.10612);
    //});
//
    test("Get Date Moon Phase", () => {
        // Add some phases to the Lantern moon
        let m = tCal.rttsMoons[1];
        expect(m.rttsMoonId).toBe(RoadToTheSkyMoonIds.lantern);
        
        m.cycleLengths[0] = 1;
        m.cycleLengths[1] = 2;
        m.cycleLengths[2] = 3;
        m.cycleLengths[3] = 4;
        m.cycleLengths[4] = 5;
        m.cycleLengths[5] = 6;
        m.cycleLengths[6] = 7;
        m.cycleLengths[7] = 30;
        
        // Get the start date in days
        let firstFullMoonDays = tCal.rttsDateToDays(0, m.firstFullMoon.day);
        
        // Before the first full moon date, the moon is always the default full
        let dateToGet = tCal.daysToDate(firstFullMoonDays - 5);
        let moonPhaseOnDate = m.getDateMoonPhase(tCal, dateToGet.year, dateToGet.month, dateToGet.day);
        expect(moonPhaseOnDate.name).toBe("Full Moon");
        expect(moonPhaseOnDate.length).toBe(1);
        expect(moonPhaseOnDate.singleDay).toBe(false);
        expect(moonPhaseOnDate.icon).toBe(Icons.Full);
        
        // Get the phases based on cycles of each length
        // 1 Day Cycle: Full Moon Only
        dateToGet = tCal.daysToDate(firstFullMoonDays);
        moonPhaseOnDate = m.getDateMoonPhase(tCal, dateToGet.year, dateToGet.month, dateToGet.day);
        expect(moonPhaseOnDate.name).toBe("Full Moon");
        expect(moonPhaseOnDate.length).toBe(1);
        expect(moonPhaseOnDate.singleDay).toBe(true);
        expect(moonPhaseOnDate.icon).toBe(Icons.Full);
        
        // 2 Day Cycle: Full moon and a new moon
        dateToGet = tCal.daysToDate(firstFullMoonDays + 1);
        moonPhaseOnDate = m.getDateMoonPhase(tCal, dateToGet.year, dateToGet.month, dateToGet.day);
        expect(moonPhaseOnDate.name).toBe("Full Moon");
        expect(moonPhaseOnDate.length).toBe(1);
        expect(moonPhaseOnDate.singleDay).toBe(true);
        expect(moonPhaseOnDate.icon).toBe(Icons.Full);
        
        dateToGet = tCal.daysToDate(tCal.rttsDateToDays(tCal.getRttsMonthIndexFromDate(dateToGet.year, dateToGet.month), dateToGet.day) + 1);
        moonPhaseOnDate = m.getDateMoonPhase(tCal, dateToGet.year, dateToGet.month, dateToGet.day);
        expect(moonPhaseOnDate.name).toBe("New Moon");
        expect(moonPhaseOnDate.length).toBe(1);
        expect(moonPhaseOnDate.singleDay).toBe(true);
        expect(moonPhaseOnDate.icon).toBe(Icons.NewMoon);

        // 3 Day Cycle: Full moon, half moon, new moon
        dateToGet = tCal.daysToDate(tCal.rttsDateToDays(tCal.getRttsMonthIndexFromDate(dateToGet.year, dateToGet.month), dateToGet.day) + 1);
        moonPhaseOnDate = m.getDateMoonPhase(tCal, dateToGet.year, dateToGet.month, dateToGet.day);
        expect(moonPhaseOnDate.name).toBe("Full Moon");
        expect(moonPhaseOnDate.length).toBe(1);
        expect(moonPhaseOnDate.singleDay).toBe(true);
        expect(moonPhaseOnDate.icon).toBe(Icons.Full);

        dateToGet = tCal.daysToDate(tCal.rttsDateToDays(tCal.getRttsMonthIndexFromDate(dateToGet.year, dateToGet.month), dateToGet.day) + 1);
        moonPhaseOnDate = m.getDateMoonPhase(tCal, dateToGet.year, dateToGet.month, dateToGet.day);
        expect(moonPhaseOnDate.name).toBe("Half Moon");
        expect(moonPhaseOnDate.length).toBe(1);
        expect(moonPhaseOnDate.singleDay).toBe(true);
        expect(moonPhaseOnDate.icon).toBe(Icons.FirstQuarter);

        dateToGet = tCal.daysToDate(tCal.rttsDateToDays(tCal.getRttsMonthIndexFromDate(dateToGet.year, dateToGet.month), dateToGet.day) + 1);
        moonPhaseOnDate = m.getDateMoonPhase(tCal, dateToGet.year, dateToGet.month, dateToGet.day);
        expect(moonPhaseOnDate.name).toBe("New Moon");
        expect(moonPhaseOnDate.length).toBe(1);
        expect(moonPhaseOnDate.singleDay).toBe(true);
        expect(moonPhaseOnDate.icon).toBe(Icons.NewMoon);
        
        // 4 Day Cycle: Full, half, new, half
        dateToGet = tCal.daysToDate(tCal.rttsDateToDays(tCal.getRttsMonthIndexFromDate(dateToGet.year, dateToGet.month), dateToGet.day) + 1);
        moonPhaseOnDate = m.getDateMoonPhase(tCal, dateToGet.year, dateToGet.month, dateToGet.day);
        expect(moonPhaseOnDate.name).toBe("Full Moon");
        expect(moonPhaseOnDate.length).toBe(1);
        expect(moonPhaseOnDate.singleDay).toBe(true);
        expect(moonPhaseOnDate.icon).toBe(Icons.Full);

        dateToGet = tCal.daysToDate(tCal.rttsDateToDays(tCal.getRttsMonthIndexFromDate(dateToGet.year, dateToGet.month), dateToGet.day) + 1);
        moonPhaseOnDate = m.getDateMoonPhase(tCal, dateToGet.year, dateToGet.month, dateToGet.day);
        expect(moonPhaseOnDate.name).toBe("Half Moon");
        expect(moonPhaseOnDate.length).toBe(1);
        expect(moonPhaseOnDate.singleDay).toBe(true);
        expect(moonPhaseOnDate.icon).toBe(Icons.FirstQuarter);

        dateToGet = tCal.daysToDate(tCal.rttsDateToDays(tCal.getRttsMonthIndexFromDate(dateToGet.year, dateToGet.month), dateToGet.day) + 1);
        moonPhaseOnDate = m.getDateMoonPhase(tCal, dateToGet.year, dateToGet.month, dateToGet.day);
        expect(moonPhaseOnDate.name).toBe("New Moon");
        expect(moonPhaseOnDate.length).toBe(1);
        expect(moonPhaseOnDate.singleDay).toBe(true);
        expect(moonPhaseOnDate.icon).toBe(Icons.NewMoon);

        dateToGet = tCal.daysToDate(tCal.rttsDateToDays(tCal.getRttsMonthIndexFromDate(dateToGet.year, dateToGet.month), dateToGet.day) + 1);
        moonPhaseOnDate = m.getDateMoonPhase(tCal, dateToGet.year, dateToGet.month, dateToGet.day);
        expect(moonPhaseOnDate.name).toBe("Half Moon");
        expect(moonPhaseOnDate.length).toBe(1);
        expect(moonPhaseOnDate.singleDay).toBe(true);
        expect(moonPhaseOnDate.icon).toBe(Icons.LastQuarter);

        // 5 Day Cycle: Full, waning gibbous, half, new, half
        dateToGet = tCal.daysToDate(tCal.rttsDateToDays(tCal.getRttsMonthIndexFromDate(dateToGet.year, dateToGet.month), dateToGet.day) + 1);
        moonPhaseOnDate = m.getDateMoonPhase(tCal, dateToGet.year, dateToGet.month, dateToGet.day);
        expect(moonPhaseOnDate.name).toBe("Full Moon");
        expect(moonPhaseOnDate.length).toBe(1);
        expect(moonPhaseOnDate.singleDay).toBe(true);
        expect(moonPhaseOnDate.icon).toBe(Icons.Full);

        dateToGet = tCal.daysToDate(tCal.rttsDateToDays(tCal.getRttsMonthIndexFromDate(dateToGet.year, dateToGet.month), dateToGet.day) + 1);
        moonPhaseOnDate = m.getDateMoonPhase(tCal, dateToGet.year, dateToGet.month, dateToGet.day);
        expect(moonPhaseOnDate.name).toBe("Waning Gibbous Moon");
        expect(moonPhaseOnDate.length).toBe(1);
        expect(moonPhaseOnDate.singleDay).toBe(false);
        expect(moonPhaseOnDate.icon).toBe(Icons.WaningGibbous);

        dateToGet = tCal.daysToDate(tCal.rttsDateToDays(tCal.getRttsMonthIndexFromDate(dateToGet.year, dateToGet.month), dateToGet.day) + 1);
        moonPhaseOnDate = m.getDateMoonPhase(tCal, dateToGet.year, dateToGet.month, dateToGet.day);
        expect(moonPhaseOnDate.name).toBe("Half Moon");
        expect(moonPhaseOnDate.length).toBe(1);
        expect(moonPhaseOnDate.singleDay).toBe(true);
        expect(moonPhaseOnDate.icon).toBe(Icons.FirstQuarter);

        dateToGet = tCal.daysToDate(tCal.rttsDateToDays(tCal.getRttsMonthIndexFromDate(dateToGet.year, dateToGet.month), dateToGet.day) + 1);
        moonPhaseOnDate = m.getDateMoonPhase(tCal, dateToGet.year, dateToGet.month, dateToGet.day);
        expect(moonPhaseOnDate.name).toBe("New Moon");
        expect(moonPhaseOnDate.length).toBe(1);
        expect(moonPhaseOnDate.singleDay).toBe(true);
        expect(moonPhaseOnDate.icon).toBe(Icons.NewMoon);

        dateToGet = tCal.daysToDate(tCal.rttsDateToDays(tCal.getRttsMonthIndexFromDate(dateToGet.year, dateToGet.month), dateToGet.day) + 1);
        moonPhaseOnDate = m.getDateMoonPhase(tCal, dateToGet.year, dateToGet.month, dateToGet.day);
        expect(moonPhaseOnDate.name).toBe("Half Moon");
        expect(moonPhaseOnDate.length).toBe(1);
        expect(moonPhaseOnDate.singleDay).toBe(true);
        expect(moonPhaseOnDate.icon).toBe(Icons.LastQuarter);

        // 6 Day Cycle: Full, waning gibbous, half, new, waxing crescent, half
        dateToGet = tCal.daysToDate(tCal.rttsDateToDays(tCal.getRttsMonthIndexFromDate(dateToGet.year, dateToGet.month), dateToGet.day) + 1);
        moonPhaseOnDate = m.getDateMoonPhase(tCal, dateToGet.year, dateToGet.month, dateToGet.day);
        expect(moonPhaseOnDate.name).toBe("Full Moon");
        expect(moonPhaseOnDate.length).toBe(1);
        expect(moonPhaseOnDate.singleDay).toBe(true);
        expect(moonPhaseOnDate.icon).toBe(Icons.Full);

        dateToGet = tCal.daysToDate(tCal.rttsDateToDays(tCal.getRttsMonthIndexFromDate(dateToGet.year, dateToGet.month), dateToGet.day) + 1);
        moonPhaseOnDate = m.getDateMoonPhase(tCal, dateToGet.year, dateToGet.month, dateToGet.day);
        expect(moonPhaseOnDate.name).toBe("Waning Gibbous Moon");
        expect(moonPhaseOnDate.length).toBe(1);
        expect(moonPhaseOnDate.singleDay).toBe(false);
        expect(moonPhaseOnDate.icon).toBe(Icons.WaningGibbous);

        dateToGet = tCal.daysToDate(tCal.rttsDateToDays(tCal.getRttsMonthIndexFromDate(dateToGet.year, dateToGet.month), dateToGet.day) + 1);
        moonPhaseOnDate = m.getDateMoonPhase(tCal, dateToGet.year, dateToGet.month, dateToGet.day);
        expect(moonPhaseOnDate.name).toBe("Half Moon");
        expect(moonPhaseOnDate.length).toBe(1);
        expect(moonPhaseOnDate.singleDay).toBe(true);
        expect(moonPhaseOnDate.icon).toBe(Icons.FirstQuarter);

        dateToGet = tCal.daysToDate(tCal.rttsDateToDays(tCal.getRttsMonthIndexFromDate(dateToGet.year, dateToGet.month), dateToGet.day) + 1);
        moonPhaseOnDate = m.getDateMoonPhase(tCal, dateToGet.year, dateToGet.month, dateToGet.day);
        expect(moonPhaseOnDate.name).toBe("New Moon");
        expect(moonPhaseOnDate.length).toBe(1);
        expect(moonPhaseOnDate.singleDay).toBe(true);
        expect(moonPhaseOnDate.icon).toBe(Icons.NewMoon)

        dateToGet = tCal.daysToDate(tCal.rttsDateToDays(tCal.getRttsMonthIndexFromDate(dateToGet.year, dateToGet.month), dateToGet.day) + 1);
        moonPhaseOnDate = m.getDateMoonPhase(tCal, dateToGet.year, dateToGet.month, dateToGet.day);
        expect(moonPhaseOnDate.name).toBe("Waxing Crescent Moon");
        expect(moonPhaseOnDate.length).toBe(1);
        expect(moonPhaseOnDate.singleDay).toBe(false);
        expect(moonPhaseOnDate.icon).toBe(Icons.WaxingCrescent);
        
        dateToGet = tCal.daysToDate(tCal.rttsDateToDays(tCal.getRttsMonthIndexFromDate(dateToGet.year, dateToGet.month), dateToGet.day) + 1);
        moonPhaseOnDate = m.getDateMoonPhase(tCal, dateToGet.year, dateToGet.month, dateToGet.day);
        expect(moonPhaseOnDate.name).toBe("Half Moon");
        expect(moonPhaseOnDate.length).toBe(1);
        expect(moonPhaseOnDate.singleDay).toBe(true);
        expect(moonPhaseOnDate.icon).toBe(Icons.LastQuarter);

        // 7 Day Cycle: Full, waning gibbous, half, waning crescent, new, waxing crescent, half
        dateToGet = tCal.daysToDate(tCal.rttsDateToDays(tCal.getRttsMonthIndexFromDate(dateToGet.year, dateToGet.month), dateToGet.day) + 1);
        moonPhaseOnDate = m.getDateMoonPhase(tCal, dateToGet.year, dateToGet.month, dateToGet.day);
        expect(moonPhaseOnDate.name).toBe("Full Moon");
        expect(moonPhaseOnDate.length).toBe(1);
        expect(moonPhaseOnDate.singleDay).toBe(true);
        expect(moonPhaseOnDate.icon).toBe(Icons.Full);

        dateToGet = tCal.daysToDate(tCal.rttsDateToDays(tCal.getRttsMonthIndexFromDate(dateToGet.year, dateToGet.month), dateToGet.day) + 1);
        moonPhaseOnDate = m.getDateMoonPhase(tCal, dateToGet.year, dateToGet.month, dateToGet.day);
        expect(moonPhaseOnDate.name).toBe("Waning Gibbous Moon");
        expect(moonPhaseOnDate.length).toBe(1);
        expect(moonPhaseOnDate.singleDay).toBe(false);
        expect(moonPhaseOnDate.icon).toBe(Icons.WaningGibbous);

        dateToGet = tCal.daysToDate(tCal.rttsDateToDays(tCal.getRttsMonthIndexFromDate(dateToGet.year, dateToGet.month), dateToGet.day) + 1);
        moonPhaseOnDate = m.getDateMoonPhase(tCal, dateToGet.year, dateToGet.month, dateToGet.day);
        expect(moonPhaseOnDate.name).toBe("Half Moon");
        expect(moonPhaseOnDate.length).toBe(1);
        expect(moonPhaseOnDate.singleDay).toBe(true);
        expect(moonPhaseOnDate.icon).toBe(Icons.FirstQuarter);

        dateToGet = tCal.daysToDate(tCal.rttsDateToDays(tCal.getRttsMonthIndexFromDate(dateToGet.year, dateToGet.month), dateToGet.day) + 1);
        moonPhaseOnDate = m.getDateMoonPhase(tCal, dateToGet.year, dateToGet.month, dateToGet.day);
        expect(moonPhaseOnDate.name).toBe("Waning Crescent Moon");
        expect(moonPhaseOnDate.length).toBe(1);
        expect(moonPhaseOnDate.singleDay).toBe(false);
        expect(moonPhaseOnDate.icon).toBe(Icons.WaningCrescent);

        dateToGet = tCal.daysToDate(tCal.rttsDateToDays(tCal.getRttsMonthIndexFromDate(dateToGet.year, dateToGet.month), dateToGet.day) + 1);
        moonPhaseOnDate = m.getDateMoonPhase(tCal, dateToGet.year, dateToGet.month, dateToGet.day);
        expect(moonPhaseOnDate.name).toBe("New Moon");
        expect(moonPhaseOnDate.length).toBe(1);
        expect(moonPhaseOnDate.singleDay).toBe(true);
        expect(moonPhaseOnDate.icon).toBe(Icons.NewMoon);

        dateToGet = tCal.daysToDate(tCal.rttsDateToDays(tCal.getRttsMonthIndexFromDate(dateToGet.year, dateToGet.month), dateToGet.day) + 1);
        moonPhaseOnDate = m.getDateMoonPhase(tCal, dateToGet.year, dateToGet.month, dateToGet.day);
        expect(moonPhaseOnDate.name).toBe("Waxing Crescent Moon");
        expect(moonPhaseOnDate.length).toBe(1);
        expect(moonPhaseOnDate.singleDay).toBe(false);
        expect(moonPhaseOnDate.icon).toBe(Icons.WaxingCrescent);

        dateToGet = tCal.daysToDate(tCal.rttsDateToDays(tCal.getRttsMonthIndexFromDate(dateToGet.year, dateToGet.month), dateToGet.day) + 1);
        moonPhaseOnDate = m.getDateMoonPhase(tCal, dateToGet.year, dateToGet.month, dateToGet.day);
        expect(moonPhaseOnDate.name).toBe("Half Moon");
        expect(moonPhaseOnDate.length).toBe(1);
        expect(moonPhaseOnDate.singleDay).toBe(true);
        expect(moonPhaseOnDate.icon).toBe(Icons.LastQuarter);

        // 30 Day Cycle: Full, waning gibbous, half, waning crescent, new, waxing crescent, half, waxing gibbous
        dateToGet = tCal.daysToDate(tCal.rttsDateToDays(tCal.getRttsMonthIndexFromDate(dateToGet.year, dateToGet.month), dateToGet.day) + 1);
        moonPhaseOnDate = m.getDateMoonPhase(tCal, dateToGet.year, dateToGet.month, dateToGet.day);
        expect(moonPhaseOnDate.name).toBe("Full Moon");
        expect(moonPhaseOnDate.length).toBe(1);
        expect(moonPhaseOnDate.singleDay).toBe(true);
        expect(moonPhaseOnDate.icon).toBe(Icons.Full);

        for (let i = 0; i < 7; i++){
            dateToGet = tCal.daysToDate(tCal.rttsDateToDays(tCal.getRttsMonthIndexFromDate(dateToGet.year, dateToGet.month), dateToGet.day) + 1);
            moonPhaseOnDate = m.getDateMoonPhase(tCal, dateToGet.year, dateToGet.month, dateToGet.day);
            expect(moonPhaseOnDate.name).toBe("Waning Gibbous Moon");
            expect(moonPhaseOnDate.length).toBe(7);
            expect(moonPhaseOnDate.singleDay).toBe(false);
            expect(moonPhaseOnDate.icon).toBe(Icons.WaningGibbous);
        }
        
        dateToGet = tCal.daysToDate(tCal.rttsDateToDays(tCal.getRttsMonthIndexFromDate(dateToGet.year, dateToGet.month), dateToGet.day) + 1);
        moonPhaseOnDate = m.getDateMoonPhase(tCal, dateToGet.year, dateToGet.month, dateToGet.day);
        expect(moonPhaseOnDate.name).toBe("Half Moon");
        expect(moonPhaseOnDate.length).toBe(1);
        expect(moonPhaseOnDate.singleDay).toBe(true);
        expect(moonPhaseOnDate.icon).toBe(Icons.FirstQuarter);

        for (let i = 0; i < 6; i++){
            dateToGet = tCal.daysToDate(tCal.rttsDateToDays(tCal.getRttsMonthIndexFromDate(dateToGet.year, dateToGet.month), dateToGet.day) + 1);
            moonPhaseOnDate = m.getDateMoonPhase(tCal, dateToGet.year, dateToGet.month, dateToGet.day);
            expect(moonPhaseOnDate.name).toBe("Waning Crescent Moon");
            expect(moonPhaseOnDate.length).toBe(6);
            expect(moonPhaseOnDate.singleDay).toBe(false);
            expect(moonPhaseOnDate.icon).toBe(Icons.WaningCrescent);
        }
        
        dateToGet = tCal.daysToDate(tCal.rttsDateToDays(tCal.getRttsMonthIndexFromDate(dateToGet.year, dateToGet.month), dateToGet.day) + 1);
        moonPhaseOnDate = m.getDateMoonPhase(tCal, dateToGet.year, dateToGet.month, dateToGet.day);
        expect(moonPhaseOnDate.name).toBe("New Moon");
        expect(moonPhaseOnDate.length).toBe(1);
        expect(moonPhaseOnDate.singleDay).toBe(true);
        expect(moonPhaseOnDate.icon).toBe(Icons.NewMoon);

        for (let i = 0; i < 7; i++){
            dateToGet = tCal.daysToDate(tCal.rttsDateToDays(tCal.getRttsMonthIndexFromDate(dateToGet.year, dateToGet.month), dateToGet.day) + 1);
            moonPhaseOnDate = m.getDateMoonPhase(tCal, dateToGet.year, dateToGet.month, dateToGet.day);
            expect(moonPhaseOnDate.name).toBe("Waxing Crescent Moon");
            expect(moonPhaseOnDate.length).toBe(7);
            expect(moonPhaseOnDate.singleDay).toBe(false);
            expect(moonPhaseOnDate.icon).toBe(Icons.WaxingCrescent);
        }

        dateToGet = tCal.daysToDate(tCal.rttsDateToDays(tCal.getRttsMonthIndexFromDate(dateToGet.year, dateToGet.month), dateToGet.day) + 1);
        moonPhaseOnDate = m.getDateMoonPhase(tCal, dateToGet.year, dateToGet.month, dateToGet.day);
        expect(moonPhaseOnDate.name).toBe("Half Moon");
        expect(moonPhaseOnDate.length).toBe(1);
        expect(moonPhaseOnDate.singleDay).toBe(true);
        expect(moonPhaseOnDate.icon).toBe(Icons.LastQuarter);

        for (let i = 0; i < 6; i++){
            dateToGet = tCal.daysToDate(tCal.rttsDateToDays(tCal.getRttsMonthIndexFromDate(dateToGet.year, dateToGet.month), dateToGet.day) + 1);
            moonPhaseOnDate = m.getDateMoonPhase(tCal, dateToGet.year, dateToGet.month, dateToGet.day);
            expect(moonPhaseOnDate.name).toBe("Waxing Gibbous Moon");
            expect(moonPhaseOnDate.length).toBe(6);
            expect(moonPhaseOnDate.singleDay).toBe(false);
            expect(moonPhaseOnDate.icon).toBe(Icons.WaxingGibbous);
        }
        
        // After the defined dates, the moon is always the default full.
        dateToGet = tCal.daysToDate(tCal.rttsDateToDays(tCal.getRttsMonthIndexFromDate(dateToGet.year, dateToGet.month), dateToGet.day) + 1);
        moonPhaseOnDate = m.getDateMoonPhase(tCal, dateToGet.year, dateToGet.month, dateToGet.day);
        expect(moonPhaseOnDate.name).toBe("Full Moon");
        expect(moonPhaseOnDate.length).toBe(1);
        expect(moonPhaseOnDate.singleDay).toBe(false);
        expect(moonPhaseOnDate.icon).toBe(Icons.Full);
    });
    
    test("Get Moon Phase", () => {
        let m = tCal.rttsMoons[1];
        
        expect(m.getMoonPhase(tCal)).toBeDefined();
        expect(m.getMoonPhase(tCal, "selected")).toBeDefined();
        expect(m.getMoonPhase(tCal, "visible")).toBeDefined();
    });
});
