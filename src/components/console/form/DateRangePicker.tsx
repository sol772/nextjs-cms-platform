"use client";

import "react-datepicker/dist/react-datepicker.css";

import { ko } from "date-fns/locale";
import { useState } from "react";
import DatePicker, { registerLocale } from "react-datepicker";

export interface DateRangePickerProps {
    startDate: Date | null;
    endDate: Date | null;
    setStartDate: (value: Date | null) => void;
    setEndDate: (value: Date | null) => void;
    timePicker?: boolean;
    timeIntervals?: number;
    className?: string;
    startMinDate?: Date;
    startMaxDate?: Date;
    endMinDate?: Date;
    endMaxDate?: Date;
}

export default function DateRangePicker({
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    timePicker,
    timeIntervals = 30,
    className,
    startMinDate,
    startMaxDate,
    endMinDate,
    endMaxDate,
}: DateRangePickerProps) {
    registerLocale("ko", ko);
    const inputStyle = `w-full h-[46px] rounded-[5px] pr-[32px] bg-console-ic-calendar bg-no-repeat bg-[right_center] rounded-[8px] placeholder:text-[#9F9FA5] ${className}`;

    // 달력 오픈 상태 관리
    const [isOpen, setIsOpen] = useState(false);

    // border 색상 동적 클래스
    const ulClassName = `flex-1 flex gap-[12px] rounded-[8px] border ${
        isOpen ? "border-console" : "border-[#D9D9D9]"
    } bg-white px-[12px]`;

    return (
        <ul className={ulClassName}>
            <li className="flex-1 [&>.react-datepicker-wrapper]:w-full">
                <DatePicker
                    selected={startDate}
                    onChange={setStartDate}
                    selectsStart
                    locale="ko"
                    className={inputStyle}
                    dateFormat={timePicker ? "yyyy.MM.dd HH:mm" : "yyyy.MM.dd"}
                    showTimeSelect={timePicker}
                    timeIntervals={timeIntervals}
                    placeholderText="기간"
                    onCalendarOpen={() => setIsOpen(true)}
                    onCalendarClose={() => setIsOpen(false)}
                    minDate={startMinDate}
                    maxDate={startMaxDate}
                />
            </li>
            <li className="flex-1 [&>.react-datepicker-wrapper]:w-full">
                <DatePicker
                    selected={endDate}
                    onChange={setEndDate}
                    selectsEnd
                    locale="ko"
                    className={inputStyle}
                    dateFormat={timePicker ? "yyyy.MM.dd HH:mm" : "yyyy.MM.dd"}
                    showTimeSelect={timePicker}
                    timeIntervals={timeIntervals}
                    placeholderText="기간"
                    onCalendarOpen={() => setIsOpen(true)}
                    onCalendarClose={() => setIsOpen(false)}
                    minDate={endMinDate ? endMinDate : startDate || undefined}
                    maxDate={endMaxDate}
                />
            </li>
        </ul>
    );
}
