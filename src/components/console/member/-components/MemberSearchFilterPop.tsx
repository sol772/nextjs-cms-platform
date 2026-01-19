import { PopoverClose } from "@radix-ui/react-popover";
import Image from "next/image";
import { Control, Controller, useForm, UseFormRegister, UseFormSetValue } from "react-hook-form";

import icSearch from "@/assets/images/console/icSearch.svg";
import popClose from "@/assets/images/console/popClose.svg";
import DateRangePicker from "@/components/console/form/DateRangePicker";
import Input from "@/components/console/form/Input";
import SelectBox, { SelectItem } from "@/components/console/form/SelectBox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useLevelSelectOptions } from "@/hooks/console/useLevelSelectOptions";

import { SearchFormValues } from "../MemberList";

interface MemberSearchFilterPopProps {
    control: Control<SearchFormValues>;
    register: UseFormRegister<SearchFormValues>;
    values: Partial<SearchFormValues>;
    setValue: UseFormSetValue<SearchFormValues>;
    searchTypes: SelectItem[];
    handleSearch: (data: SearchFormValues) => void;
    handleReset: () => void;
    open: boolean;
    setOpen: (open: boolean) => void;
}

export default function MemberSearchFilterPop({
    register,
    searchTypes,
    values,
    setValue,
    control,
    handleSearch,
    handleReset,
    open,
    setOpen,
}: MemberSearchFilterPopProps) {
    const { levelOptions } = useLevelSelectOptions();
    const { handleSubmit } = useForm<SearchFormValues>();

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button type="button">
                    <Image src={icSearch} alt="검색아이콘" />
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-[680px] rounded-[12px] bg-white p-0 shadow-[0_0_16px_0_rgba(0,0,0,0.12)]">
                <form onSubmit={handleSubmit(handleSearch)}>
                    <div className="flex items-center justify-between border-b border-[#F1F1F1] p-[20px_24px]">
                        <p className="text-[24px] font-[700]">회원 상세 검색</p>
                        <PopoverClose>
                            <Image src={popClose} alt="닫기" />
                        </PopoverClose>
                    </div>
                    <ul className="bg-[#F6F7FA] p-[8px_20px]">
                        <li className="flex items-center gap-[8px] border-b border-[#DADEE4] py-[12px]">
                            <p className="w-[160px] font-[500]">직접검색</p>
                            <div className="flex flex-1 gap-[8px]">
                                <Controller
                                    name="search"
                                    control={control}
                                    render={({ field }) => (
                                        <SelectBox
                                            {...field}
                                            list={searchTypes}
                                            triggerClassName="h-[34px]"
                                            onChange={val => field.onChange(val)}
                                        />
                                    )}
                                />
                                <Input
                                    {...register("searchtxt")}
                                    className="h-[34px] flex-1"
                                    placeholder="검색어를 입력해주세요."
                                />
                            </div>
                        </li>
                        <li className="flex items-center gap-[8px] border-b border-[#DADEE4] py-[12px]">
                            <p className="w-[160px] font-[500]">가입일자</p>
                            <DateRangePicker
                                startDate={values.sdate ?? null}
                                endDate={values.edate ?? null}
                                setStartDate={date => date && setValue("sdate", date)}
                                setEndDate={date => date && setValue("edate", date)}
                                className="!h-[34px]"
                            />
                        </li>
                        <li className="flex items-center gap-[8px] py-[12px]">
                            <p className="w-[160px] font-[500]">회원등급</p>
                            <Controller
                                name="mLevel"
                                control={control}
                                render={({ field }) => (
                                    <SelectBox
                                        {...field}
                                        list={levelOptions}
                                        triggerClassName="h-[34px] flex-1"
                                        onChange={val => field.onChange(val)}
                                    />
                                )}
                            />
                        </li>
                    </ul>
                    <div className="flex justify-between gap-[8px] p-[16px_24px]">
                        <button
                            type="button"
                            className="h-[52px] rounded-[12px] border border-[#1A2448] px-[24px] text-[18px] font-[700] text-[#1A2448]"
                            onClick={handleReset}
                        >
                            입력한 내용 초기화
                        </button>
                        <button
                            type="submit"
                            className="h-[52px] flex-1 rounded-[12px] bg-[#1A2448] text-[18px] font-[700] text-white"
                        >
                            검색
                        </button>
                    </div>
                </form>
            </PopoverContent>
        </Popover>
    );
}
