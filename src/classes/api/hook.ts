import { SimpleCalendarHooks, TimeKeeperStatus } from "../../constants";
import { TimestampToDateData } from "../utilities/date-time";
import type Calendar from "../calendar";
import { SC } from "../index";

export class Hook {
    /**
     * Emit a specific hook for other things to listen too. Data is put together within this function.
     * @param {SimpleCalendarHooks} hook The hook to emit
     * @param {Calendar} calendar
     * @param param
     */
    public static emit(hook: SimpleCalendarHooks, calendar: Calendar, param: any = undefined) {
        let data: any = {};
        if (hook === SimpleCalendarHooks.DateTimeChange) {
            data["date"] = TimestampToDateData(calendar.toSeconds(), calendar);
            data["diff"] = param;
            data["moons"] = [];
            data["rttsMoons"] = [];

            for (let i = 0; i < calendar.moons.length; i++) {
                const phase = calendar.moons[i].getMoonPhase(calendar);
                data.moons.push({
                    name: calendar.moons[i].name,
                    color: calendar.moons[i].color,
                    cycleLength: calendar.moons[i].cycleLength,
                    cycleDayAdjust: calendar.moons[i].cycleDayAdjust,
                    currentPhase: phase
                });
            }
            for (let i = 0; i < calendar.rttsMoons.length; i++) {
                const phase = calendar.rttsMoons[i].getMoonPhase(calendar);
                data.rttsMoons.push({
                    name: calendar.rttsMoons[i].name,
                    color: calendar.rttsMoons[i].color,
                    currentPhase: phase
                });
            }
        } else if (hook === SimpleCalendarHooks.ClockStartStop) {
            const status = calendar.timeKeeper.getStatus();
            data = {
                started: status === TimeKeeperStatus.Started,
                stopped: status === TimeKeeperStatus.Stopped,
                paused: status === TimeKeeperStatus.Paused
            };
        } else if (hook === SimpleCalendarHooks.PrimaryGM) {
            data["isPrimaryGM"] = SC.primary;
        }
        Hooks.callAll(hook, data);
    }
}
