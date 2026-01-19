"use client";

import { useEffect, useState } from "react";

export const useCheckboxList = () => {
    const [checkedNum, setCheckedNum] = useState(0);
    const [allCheck, setAllCheck] = useState(false);
    const [checkList, setCheckList] = useState<(string | number)[]>([]);
    const [checkedList, setCheckedList] = useState<(string | number)[]>([]);

    // 전체선택 체크박스 체크시
    const handleAllCheck = (checked: boolean) => {
        setAllCheck(checked);
        if (checked) {
            setCheckedList(checkList);
            setCheckedNum(checkList.length);
        } else {
            setCheckedList([]);
            setCheckedNum(0);
        }
    };

    // 체크박스 체크시
    const handleCheck = (checked: boolean, id: string | number) => {
        let newCheckedList = [...checkedList];
        if (checked) {
            newCheckedList = newCheckedList.concat(id);
        } else if (!checked && newCheckedList.includes(id)) {
            newCheckedList = newCheckedList.filter(el => el !== id);
        }
        setCheckedList(newCheckedList);
    };

    useEffect(() => {
        setCheckedNum(checkedList.length);

        if (checkedList.length > 0 && checkList.every(item => checkedList.includes(item))) {
            setAllCheck(true);
        } else {
            setAllCheck(false);
        }
    }, [checkedList, checkList]);

    return {
        checkedNum,
        allCheck,
        checkList,
        setCheckList,
        checkedList,
        setCheckedList,
        handleAllCheck,
        handleCheck,
    };
};
