import "react-datepicker/dist/react-datepicker.css";

import { ko } from "date-fns/locale";
import DatePicker, { registerLocale } from "react-datepicker";
import { twMerge } from "tailwind-merge";

export interface DatePickerInputProps {
    date: Date | null;
    setDate: (value: Date | null) => void;
    timePicker?: boolean;
    className?: string;
}

export default function DatePickerInput({ date, setDate, timePicker, className }: DatePickerInputProps) {
    registerLocale("ko", ko);

    const inputStyle = twMerge(
        "w-full h-[48px] rounded-[5px] text-[#222] border border-[#D9D9D9] rounded-[8px] focus:border-console p-[0_48px_0_12px] !bg-console-ic-calendar bg-no-repeat bg-[right_12px_center]",
        className,
    );

    return (
        <div className="[&>.react-datepicker-wrapper]:w-full">
            <DatePicker
                selected={date}
                onChange={setDate}
                selectsStart
                locale="ko"
                className={inputStyle}
                dateFormat={timePicker ? "yyyy.MM.dd HH:mm" : "yyyy.MM.dd"}
                showTimeSelect={timePicker}
            />
        </div>
    );
}
