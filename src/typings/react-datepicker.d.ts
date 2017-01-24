// Type definitions for react-datepicker v0.40.0
// Project: https://github.com/Hacker0x01/react-datepicker
// Definitions by: Rajab Shakirov <https://github.com/radziksh>, Andrey Balokha <https://github.com/andrewBalekha>, Andrew Olson
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 2.1

/// <reference types="react"/>

interface ReactDatePickerProps {
    autoComplete?: string;
    autoFocus?: boolean;
    className?: string;
    customInput?: React.ReactNode;
    dateFormat?: string;
    dateFormatCalendar?: string;
    disabled?: boolean;
    endDate?: {};
    excludeDates?: any[];
    filterDate?: (date: Date) => boolean;
    fixedHeight?: boolean;
    highlightDates?: Date[]
    id?: string;
    includeDates?: any[];
    inline?: boolean;
    isClearable?: boolean;
    locale?: string;
    maxDate?: {};
    minDate?: {};
    monthsShown?: number;
    name?: string;
    onBlur?(handler: (e: any) => void): any;
    onChange(handler: (date?: any, e?: any) => void): any;
    onFocus?(handler: (e: any) => void): any;
    peekNextMonth?: boolean;
    placeholderText?: string;
    popoverAttachment?: string;
    popoverTargetAttachment?: string;
    popoverTargetOffset?: string;
    readOnly?: boolean;
    renderCalendarTo?: any;
    required?: boolean;
    scrollableYearDropdown?: boolean;
    selected?: {};
    selectsEnd?: boolean;
    selectsStart?: boolean;
    showMonthDropdown?: boolean;
    showYearDropdown?: boolean;
    showWeekNumbers?: boolean;
    startDate?: {};
    tabIndex?: number;
    tetherConstraints?: any[];
    title?: string;
    todayButton?: string;
    utcOffset?: number;
}

declare module "react-datepicker" {
    let ReactDatePicker: React.ClassicComponentClass<ReactDatePickerProps>;
    export = ReactDatePicker;
}
