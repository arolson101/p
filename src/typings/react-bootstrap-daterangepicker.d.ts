/// <reference types='moment'/>

// react-bootstrap-daterangepicker needs to be updated with these props
declare namespace ReactBootstrapDaterangepicker {

    interface Locale {
        format: string // "MM/DD/YYYY"
        separator: string // " - ",
        applyLabel: string // "Apply",
        cancelLabel: string // "Cancel",
        fromLabel: string // "From",
        toLabel: string // "To",
        customRangeLabel: string // "Custom",
        weekLabel: string // "W",
        daysOfWeek: string[]
        monthNames: string[]
        firstDay: number // 1
    }

    interface Props extends DatepickerOptions {
        singleDatePicker?: boolean
        locale?: Locale
    }
}
