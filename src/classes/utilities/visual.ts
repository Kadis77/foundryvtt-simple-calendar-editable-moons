import { Icons, SettingNames, Themes } from "../../constants";
import SCIcon from "../../icons/logo.svg";
import Clock from "../../icons/clock.svg";
import MiddayIcon from "../../icons/midday.svg";
import MidnightIcon from "../../icons/midnight.svg";
import SunriseIcon from "../../icons/sunrise.svg";
import SunsetIcon from "../../icons/sunset.svg";
import FirstQuarterIcon from "../../icons/moon-first-quarter.svg";
import FullMoonIcon from "../../icons/moon-full.svg";
import LastQuarterIcon from "../../icons/moon-last-quarter.svg";
import NewMoonIcon from "../../icons/moon-new.svg";
import WaningCrescentIcon from "../../icons/moon-waning-crescent.svg";
import WaningGibbousIcon from "../../icons/moon-waning-gibbous.svg";
import WaxingCrescentIcon from "../../icons/moon-waxing-crescent.svg";
import WaxingGibbousIcon from "../../icons/moon-waxing-gibbous.svg";
import ChevronLeftIcon from "../../icons/chevron-left.svg";
import ChevronRightIcon from "../../icons/chevron-right.svg";
import SeasonSpringIcon from "../../icons/season-spring.svg";
import SeasonSummerIcon from "../../icons/season-summer.svg";
import SeasonFallIcon from "../../icons/season-fall.svg";
import SeasonWinterIcon from "../../icons/season-winter.svg";
import { GameSettings } from "../foundry-interfacing/game-settings";
import { FoundryVTTGameData } from "../foundry-interfacing/game-data";

/**
 * The current Rem size for this system. Most systems are 16px
 */
export const RemSize = parseInt(window.getComputedStyle(document.documentElement).getPropertyValue("font-size"));

/**
 * Finds the "best" contrast color for the passed in color
 * @param color
 */
export function GetContrastColor(color: string) {
    let contrastColor = "#000000";
    if (color.indexOf("#") === 0) {
        color = color.slice(1);
    }
    if (color.length === 3 || color.length === 6) {
        // convert 3-digit hex to 6-digits.
        if (color.length === 3) {
            color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2];
        }
        const r = parseInt(color.slice(0, 2), 16),
            g = parseInt(color.slice(2, 4), 16),
            b = parseInt(color.slice(4, 6), 16);
        contrastColor = r * 0.299 + g * 0.587 + b * 0.114 > 186 ? "#000000" : "#FFFFFF";
    }
    return contrastColor;
}

/**
 * Gets the SVG icon string for the specified icon  type
 * @param {Icons} icon The icon to get
 * @param {string} strokeColor The color of the svg stroke
 * @param {string} fillColor The color of the svg fill
 */
export function GetIcon(icon: Icons, strokeColor: string = "#000000", fillColor: string = "#000000") {
    let iString = "";
    let fillSearch = /fill="#000000"/g;

    switch (icon) {
        case Icons.Logo:
            iString = SCIcon;
            break;
        case Icons.Clock:
            iString = Clock;
            break;
        case Icons.Midday:
            iString = MiddayIcon;
            break;
        case Icons.Midnight:
            iString = MidnightIcon;
            break;
        case Icons.Sunrise:
            iString = SunriseIcon;
            break;
        case Icons.Sunset:
            iString = SunsetIcon;
            break;
        case Icons.FirstQuarter:
            iString = FirstQuarterIcon;
            fillSearch = /fill="#ffffff"/g;
            break;
        case Icons.Full:
            iString = FullMoonIcon;
            fillSearch = /fill="#ffffff"/g;
            break;
        case Icons.LastQuarter:
            iString = LastQuarterIcon;
            fillSearch = /fill="#ffffff"/g;
            break;
        case Icons.NewMoon:
            iString = NewMoonIcon;
            fillSearch = /fill="#ffffff"/g;
            break;
        case Icons.WaningCrescent:
            iString = WaningCrescentIcon;
            fillSearch = /fill="#ffffff"/g;
            break;
        case Icons.WaningGibbous:
            iString = WaningGibbousIcon;
            fillSearch = /fill="#ffffff"/g;
            break;
        case Icons.WaxingCrescent:
            iString = WaxingCrescentIcon;
            fillSearch = /fill="#ffffff"/g;
            break;
        case Icons.WaxingGibbous:
            iString = WaxingGibbousIcon;
            fillSearch = /fill="#ffffff"/g;
            break;
        case Icons.Spring:
            iString = SeasonSpringIcon;
            break;
        case Icons.Summer:
            iString = SeasonSummerIcon;
            break;
        case Icons.Fall:
            iString = SeasonFallIcon;
            break;
        case Icons.Winter:
            iString = SeasonWinterIcon;
            break;
        case Icons.ChevronLeft:
            iString = ChevronLeftIcon;
            break;
        case Icons.ChevronRight:
            iString = ChevronRightIcon;
            break;
        case Icons.AngleLeft:
            iString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path fill="currentColor" d="M41.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 256 246.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/></svg>`;
            break;
        case Icons.AngleRight:
            iString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path fill="currentColor" d="M278.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-160 160c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L210.7 256 73.4 118.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l160 160z"/></svg>`;
            break;
        case Icons.AngleDoubleLeft:
            iString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M41.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 256 246.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160zm352-160c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L301.3 256 438.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0z"/></svg>`;
            break;
        case Icons.AngleDoubleRight:
            iString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M470.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L402.7 256 265.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160zm-352 160 160-160c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L210.7 256 73.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0z"/></svg>`;
            break;
        case Icons.StickyNote:
            iString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H288V352c0-17.7 14.3-32 32-32H448V96c0-35.3-28.7-64-64-64H64zM448 352H320V480L448 352z"/></svg>`;
            break;
        case Icons.Search:
            iString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"/></svg>`;
            break;
        case Icons.Calendar:
        case Icons.CalendarDay:
            iString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M128 0c17.7 0 32 14.3 32 32V64H288V32c0-17.7 14.3-32 32-32s32 14.3 32 32V64h48c26.5 0 48 21.5 48 48v48H0V112C0 85.5 21.5 64 48 64H96V32c0-17.7 14.3-32 32-32zM0 192H448V464c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V192zm64 96v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V288c0-8.8-7.2-16-16-16H80c-8.8 0-16 7.2-16 16zm128 0v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V288c0-8.8-7.2-16-16-16H208c-8.8 0-16 7.2-16 16zm144-16c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V288c0-8.8-7.2-16-16-16H336zm-144 128v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V400c0-8.8-7.2-16-16-16H208c-8.8 0-16 7.2-16 16zm-112 0v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V400c0-8.8-7.2-16-16-16H80c-8.8 0-16 7.2-16 16z"/></svg>`;
            break;
        case Icons.CalendarCheck:
            iString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M128 0c17.7 0 32 14.3 32 32V64H288V32c0-17.7 14.3-32 32-32s32 14.3 32 32V64h48c26.5 0 48 21.5 48 48v48H0V112C0 85.5 21.5 64 48 64H96V32c0-17.7 14.3-32 32-32zM0 192H448V464c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V192zM329 305c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-95 95-47-47c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l64 64c9.4 9.4 24.6 9.4 33.9 0L329 305z"/></svg>`;
            break;
        case Icons.Gear:
            iString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M495.9 166.6c3.2 8.7.5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6.3-24.5-6.8-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6 4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2 5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8 8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z"/></svg>`;
            break;
        case Icons.Bell:
            iString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M224 0c-17.7 0-32 14.3-32 32V51.2C119 66 64 130.6 64 208v25.4c0 45.4-15.5 89.5-43.8 124.9L5.3 377c-5.8 7.2-6.9 17.1-2.9 25.4S14.8 416 24 416H424c9.2 0 17.6-5.3 21.6-13.6s2.9-18.2-2.9-25.4l-14.9-18.6C399.5 322.9 384 278.8 384 233.4V208c0-77.4-55-142-128-156.8V32c0-17.7-14.3-32-32-32zm0 96c61.9 0 112 50.1 112 112v25.4c0 47.9 13.9 94.6 39.7 134.6H72.3C98.1 328 112 281.3 112 233.4V208c0-61.9 50.1-112 112-112zm64 352H160c0 17 6.7 33.3 18.7 45.3s28.3 18.7 45.3 18.7s33.3-6.7 45.3-18.7s18.7-28.3 18.7-45.3z"/></svg>`;
            break;
        case Icons.Plus:
            iString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"/></svg>`;
            break;
        case Icons.Times:
            iString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path fill="currentColor" d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>`;
            break;
        case Icons.CaretDown:
            iString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path fill="currentColor" d="M137.4 374.6c12.5 12.5 32.8 12.5 45.3 0l128-128c9.2-9.2 11.9-22.9 6.9-34.9s-16.6-19.8-29.6-19.8L32 192c-12.9 0-24.6 7.8-29.6 19.8s-2.2 25.7 6.9 34.9l128 128z"/></svg>`;
            break;
        case Icons.Check:
            iString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/></svg>`;
            break;
        case Icons.Eye:
            iString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path fill="currentColor" d="M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4 142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1 3.3-7.9 3.3-16.7 0-24.6-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32zM144 256a144 144 0 1 1 288 0 144 144 0 1 1-288 0zm144-64c0 35.3-28.7 64-64 64-7.1 0-13.9-1.2-20.3-3.3-5.5-1.8-11.9 1.6-11.7 7.4.3 6.9 1.3 13.8 3.2 20.7 13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-11.1-41.5-47.8-69.4-88.6-71.1-5.8-.2-9.2 6.1-7.4 11.7 2.1 6.4 3.3 13.2 3.3 20.3z"/></svg>`;
            break;
        case Icons.Trash:
            iString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"/></svg>`;
            break;
        case Icons.Pen:
            iString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M471.6 21.7c-21.9-21.9-57.3-21.9-79.2 0L362.3 51.7l97.9 97.9 30.1-30.1c21.9-21.9 21.9-57.3 0-79.2L471.6 21.7zm-299.2 220c-6.1 6.1-10.8 13.6-13.5 21.9l-29.6 88.8c-2.9 8.6-.6 18.1 5.8 24.6s15.9 8.7 24.6 5.8l88.8-29.6c8.2-2.7 15.7-7.4 21.9-13.5L437.7 172.3 339.7 74.3 172.4 241.7zM96 64C43 64 0 107 0 160V416c0 53 43 96 96 96H352c53 0 96-43 96-96V320c0-17.7-14.3-32-32-32s-32 14.3-32 32v96c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V160c0-17.7 14.3-32 32-32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H96z"/></svg>`;
            break;
        case Icons.Pencil:
            iString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M362.7 19.3L314.3 67.7 444.3 197.7l48.4-48.4c25-25 25-65.5 0-90.5L453.3 19.3c-25-25-65.5-25-90.5 0zm-71 71L58.6 323.5c-10.4 10.4-18 23.3-22.2 37.4L1 481.2C-1.5 489.7.8 498.8 7 505s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L421.7 220.3 291.7 90.3z"/></svg>`;
            break;
        case Icons.Play:
            iString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path fill="currentColor" d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"/></svg>`;
            break;
        case Icons.Pause:
            iString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path fill="currentColor" d="M48 64C21.5 64 0 85.5 0 112V400c0 26.5 21.5 48 48 48H80c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H48zm192 0c-26.5 0-48 21.5-48 48V400c0 26.5 21.5 48 48 48h32c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H240z"/></svg>`;
            break;
        case Icons.Stop:
            iString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path fill="currentColor" d="M0 128C0 92.7 28.7 64 64 64H320c35.3 0 64 28.7 64 64V384c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V128z"/></svg>`;
            break;
        case Icons.ArrowsV:
            iString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path fill="currentColor" d="M182.6 9.4c-12.5-12.5-32.8-12.5-45.3 0l-96 96c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L128 109.3V402.7L86.6 361.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l96 96c12.5 12.5 32.8 12.5 45.3 0l96-96c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 402.7V109.3l41.4 41.4c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-96-96z"/></svg>`;
            break;
        case Icons.Scroll:
            iString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path fill="currentColor" d="M0 80v48c0 17.7 14.3 32 32 32H48 96V80c0-26.5-21.5-48-48-48S0 53.5 0 80zM112 32c10 13.4 16 30 16 48V384c0 35.3 28.7 64 64 64s64-28.7 64-64v-5.3c0-32.4 26.3-58.7 58.7-58.7H480V128c0-53-43-96-96-96H112zM464 480c61.9 0 112-50.1 112-112 0-8.8-7.2-16-16-16H314.7c-14.7 0-26.7 11.9-26.7 26.7V384c0 53-43 96-96 96H464z"/></svg>`;
            break;
        default:
            break;
    }

    iString = iString.replace(/stroke="#000000"/g, `stroke="${strokeColor}"`);
    iString = iString.replace(fillSearch, `fill="${fillColor}"`);
    return iString;
}

/**
 * Gets the text name of the Theme being used. Will check the old Theme client setting if the new world specific one is not set.
 */
export function GetThemeName(): string {
    let theme = GameSettings.GetStringSettings(`${FoundryVTTGameData.worldId}.${SettingNames.Theme}`);
    if (!theme) {
        theme = GameSettings.GetStringSettings(SettingNames.Theme);
        //Check to see if we are trying to load a system specific theme in the wrong system.
        const tObj = Themes.find((t) => {
            return t.key === theme;
        });
        if (tObj) {
            if (tObj.system && FoundryVTTGameData.systemID !== tObj.key) {
                theme = Themes[0].key;
            } else if (tObj.module) {
                const m = (<Game>game).modules.get(tObj.key);
                if (!m || !m.active) {
                    theme = Themes[0].key;
                }
            }
        }
    }
    return theme;
}

/**
 * Returns a list of themes to be used in a drop-down
 */
export function GetThemeList(): { [key: string]: string } {
    const choices: { [key: string]: string } = {};
    for (let i = 0; i < Themes.length; i++) {
        if ((!Themes[i].system && !Themes[i].module) || (Themes[i].system && FoundryVTTGameData.systemID === Themes[i].key)) {
            choices[Themes[i].key] = Themes[i].name;
        } else if (Themes[i].module) {
            const m = (<Game>game).modules.get(Themes[i].key);
            if (m && m.active) {
                choices[Themes[i].key] = Themes[i].name;
            }
        }
    }
    return choices;
}

/**
 * Converts a pixel amount to a new pixel amount based on the current pages REM size
 * @param px The pixel amount to convert
 */
export function ConvertPxBasedOnRemSize(px: number) {
    return px * (RemSize / 16);
}

/**
 * Checks the current systems Rem size and adds the appropriate class to the body to account for that size.
 */
export function CheckRemScaling() {
    if (RemSize !== 16) {
        document.body.classList.add(`sc-scale-${RemSize}`);
    }
}

/**
 * Processes opening and closing animations for HTML elements
 * @param element
 * @param duration
 * @param forceHide
 */
export function animateElement(element: Element, duration: number, forceHide: boolean = false) {
    let openState = false;
    if (element && !element.classList.contains("fsc-animate")) {
        if (element.classList.contains("fsc-open") || forceHide) {
            element.classList.add("fsc-animate");
            element.classList.remove("fsc-open");
            openState = false;
            setTimeout(timeoutCall.bind(null, element, true, "fsc-closed"), duration);
        } else {
            element.classList.add("fsc-animate", "fsc-open");
            element.classList.remove("fsc-closed");
            openState = true;
        }
        setTimeout(timeoutCall.bind(null, element, false, "fsc-animate"), duration);
    }
    return openState;
}

/**
 * Function that is called after the animate element timeout is finished
 * @param element The element that was being animated
 * @param add If a class is being added or removed
 * @param cssClass The class to add/remove
 */
export function timeoutCall(element: Element, add: boolean, cssClass: string) {
    if (add) {
        element.classList.add(cssClass);
    } else {
        element.classList.remove(cssClass);
    }
}

/**
 * Animates a form group
 * @param selector The selector to get an element within the form group
 * @param check If we are opening or closing the group
 * @param element The root element to search for the selector
 */
export function animateFormGroup(selector: string, check: boolean, element: Document | Element = document) {
    const fg = element.querySelector(selector)?.closest(".form-group");
    if (fg) {
        if ((fg.classList.contains("fsc-closed") && check) || (fg.classList.contains("fsc-open") && !check)) {
            animateElement(fg, 200);
        } else if (check) {
            fg.classList.remove("fsc-closed");
            fg.classList.add("fsc-open");
        } else {
            fg.classList.add("fsc-closed");
            fg.classList.remove("fsc-open");
        }
    }
}
