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
            data["rttsMoons"] = [];
            for (let i = 0; i < calendar.rttsMoons.length; i++) {
                data.rttsMoons.push(calendar.rttsMoons[i].toMoonData(calendar));
            }
            // moons is an alias for rttsMoons for backwards compatibility with external listeners
            data["moons"] = data["rttsMoons"];
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
